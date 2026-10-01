#!/usr/bin/env python3
"""Accuracy test for the fontscan stage-1 matcher (Python mirror of fontscan.ts).

Renders test words with PIL in known fonts, runs the same pipeline
(Otsu -> polarity -> connected components -> 16x16 fingerprints -> SAD match),
and reports top-1 / top-5 accuracy.
"""
import base64, json, os, re, sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageOps
from scipy import ndimage

GRID = 16
CHARSET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
TTF_DIR = os.path.expanduser("~/workspace/font-identifier/scripts/font-ttfs")
FP_PATH = os.path.expanduser("~/workspace/font-identifier/public/scan/fingerprints.json")

def slugify(name):
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")

def load_db():
    fp = json.load(open(FP_PATH))
    return {
        "charset": fp["charset"],
        "slugs": fp["fonts"],
        "aspects": np.frombuffer(base64.b64decode(fp["aspects"]), dtype=np.uint8),
        "data": np.frombuffer(base64.b64decode(fp["data"]), dtype=np.uint8),
    }

def otsu(gray):
    hist, _ = np.histogram(gray, bins=256, range=(0, 256))
    total = gray.size
    sum_all = np.dot(np.arange(256), hist)
    sumB = wB = best = 0
    bestT = 128
    for t in range(256):
        wB += hist[t]
        if wB == 0: continue
        wF = total - wB
        if wF == 0: break
        sumB += t * hist[t]
        mB, mF = sumB / wB, (sum_all - sumB) / wF
        between = wB * wF * (mB - mF) ** 2
        if between > best:
            best, bestT = between, t
    return bestT

def render_text(ttf_path, text, size=110):
    font = ImageFont.truetype(ttf_path, size)
    # measure
    tmp = Image.new("L", (10, 10), 255)
    d = ImageDraw.Draw(tmp)
    l, t, r, b = d.textbbox((0, 0), text, font=font)
    W, H = r - l + 60, b - t + 60
    img = Image.new("L", (W, H), 255)
    d = ImageDraw.Draw(img)
    d.text((30 - l, 30 - t), text, font=font, fill=0)
    return img

def letter_fp(gray, box):
    x, y, w, h = box
    pad = 0.08
    x0 = max(0, int(x - w * pad)); y0 = max(0, int(y - h * pad))
    x1 = min(gray.shape[1], int(x + w + w * pad)); y1 = min(gray.shape[0], int(y + h + h * pad))
    crop = gray[y0:y1, x0:x1]
    small = np.array(Image.fromarray(crop).resize((GRID, GRID), Image.LANCZOS))
    fp = np.round((255 - small) / 255 * 15).astype(np.int32)
    aspect = round(min(4.0, w / h) / 4 * 255)
    return fp, aspect

def match_word(img, db):
    gray = np.array(img)
    t = otsu(gray)
    ink = gray < t
    # polarity via rim
    rim = np.concatenate([ink[:8, :].ravel(), ink[-8:, :].ravel(),
                          ink[:, :8].ravel(), ink[:, -8:].ravel()])
    if rim.mean() > 0.5:
        ink = ~ink
    lab, n = ndimage.label(ink, structure=np.ones((3, 3), dtype=int))
    boxes = []
    area = img.size[0] * img.size[1]
    for i in range(1, n + 1):
        ys, xs = np.where(lab == i)
        bw, bh = xs.max() - xs.min() + 1, ys.max() - ys.min() + 1
        a = len(xs)
        if a >= area * 0.00012 and bw >= 3 and bh >= 5:
            boxes.append((xs.min(), ys.min(), bw, bh, a))
    boxes.sort(key=lambda b: b[0])
    if len(boxes) < 2:
        return None, f"only {len(boxes)} letters"
    nChars = len(db["charset"]); nFonts = len(db["slugs"])
    data = db["data"].reshape(nFonts, nChars, 128)
    aspects = db["aspects"].reshape(nFonts, nChars)
    totals = np.full(nFonts, np.inf)
    for f in range(nFonts):
        s = 0.0
        okc = 0
        for (x, y, w, h, a) in boxes:
            fp, ab = letter_fp(gray, (x, y, w, h))
            best = np.inf
            for ch in range(nChars):
                gab = int(aspects[f, ch])
                if gab == 0 or abs(gab - ab) > 90:
                    continue
                packed = data[f, ch]
                hi = (packed >> 4).astype(np.int32)
                lo = (packed & 15).astype(np.int32)
                cand = np.empty(256, dtype=np.int32)
                cand[0::2] = hi; cand[1::2] = lo
                sad = np.abs(cand - fp.ravel()).sum()
                if sad < best:
                    best = sad
            if best < np.inf:
                s += best; okc += 1
        if okc == len(boxes):
            totals[f] = s / okc
    ranking = np.argsort(totals)
    return [db["slugs"][i] for i in ranking[:10]], ""

def main():
    db = load_db()
    tests = [
        ("Playfair Display", "Elegant Wedding"),
        ("Roboto", "Modern Interface"),
        ("Bebas Neue", "BOLD POSTER"),
        ("Pacifico", "Hello World"),
        ("JetBrains Mono", "const code = 42"),
        ("Merriweather", "Reading books"),
        ("Oswald", "STRONG TYPE"),
        ("Dancing Script", "fancy script"),
        ("Inter", "Clean design"),
        ("Lora", "Editorial text"),
    ]
    t1 = t5 = 0
    for name, text in tests:
        slug = slugify(name)
        ttf = os.path.join(TTF_DIR, f"{slug}.ttf")
        if not os.path.exists(ttf):
            print(f"SKIP {name} (no ttf yet)"); continue
        img = render_text(ttf, text)
        ranking, err = match_word(img, db)
        if ranking is None:
            print(f"FAIL {name}: {err}"); continue
        r1 = ranking[0]
        rank = ranking.index(slug) + 1 if slug in ranking else 99
        mark1 = "✓" if rank == 1 else " "
        mark5 = "✓" if rank <= 5 else "✗"
        if rank == 1: t1 += 1
        if rank <= 5: t5 += 1
        print(f"[{mark1}{mark5}] {name:20s} rank={rank:2d} top3={ranking[:3]}")
    print(f"\nTop-1: {t1}   Top-5: {t5}")

if __name__ == "__main__":
    main()

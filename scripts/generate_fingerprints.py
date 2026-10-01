#!/usr/bin/env python3
"""Render every glyph of every downloaded font TTF and build compact 16x16
4-bit shape fingerprints for the client-side font scanner.

Output: public/scan/fingerprints.json
  {
    "grid": 16,
    "charset": "abc...XYZ019",
    "fonts": ["playfair-display", ...],   # slug order
    "aspects": "<base64: nFonts*nChars bytes, w/h ratio mapped 0..255>",
    "data": "<base64: nFonts*nChars*128 bytes, 256 nibbles row-major, ink=15>"
  }
Empty/missing glyphs -> all-zero data + aspect 0.
"""
import base64, io, json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from font_names import font_names

from PIL import Image, ImageDraw, ImageFont, ImageOps
from fontTools.ttLib import TTFont

GRID = 16
CHARSET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
TTF_DIR = os.path.expanduser("~/workspace/font-identifier/scripts/font-ttfs")
OUT_PATH = os.path.expanduser("~/workspace/font-identifier/public/scan/fingerprints.json")

RENDER_SIZE = 220
CANVAS = 520

# fontTools cmap cache per ttf path
_CMAPS: dict[str, set[int]] = {}

def has_glyph(ttf_path: str, char: str) -> bool:
    cmap = _CMAPS.get(ttf_path)
    if cmap is None:
        try:
            cmap = set(TTFont(ttf_path).getBestCmap().keys())
        except Exception:
            cmap = set()
        _CMAPS[ttf_path] = cmap
    return ord(char) in cmap

def slugify(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")

def glyph_fingerprint(ttf_path: str, char: str):
    """Return (packed_bytes[128], aspect_byte) or None if glyph missing."""
    if not has_glyph(ttf_path, char):
        return None
    try:
        font = ImageFont.truetype(ttf_path, RENDER_SIZE)
    except Exception:
        return None
    # missing glyph check
    try:
        l, t, r, b = font.getbbox(char)
        if r - l <= 0 or b - t <= 0:
            return None
    except Exception:
        return None
    img = Image.new("L", (CANVAS, CANVAS), 255)
    d = ImageDraw.Draw(img)
    d.text((80, 80), char, font=font, fill=0)
    ink = ImageOps.invert(img)  # ink=255, bg=0
    bbox = ink.getbbox()
    if not bbox:
        return None
    x0, y0, x1, y1 = bbox
    pad = 12
    x0 = max(0, x0 - pad); y0 = max(0, y0 - pad)
    x1 = min(CANVAS, x1 + pad); y1 = min(CANVAS, y1 + pad)
    w, h = x1 - x0, y1 - y0
    if w <= 0 or h <= 0:
        return None
    crop = ink.crop((x0, y0, x1, y1)).resize((GRID, GRID), Image.LANCZOS)
    px = crop.load()
    nibbles = []
    for y in range(GRID):
        for x in range(GRID):
            nibbles.append(min(15, px[x, y] * 16 // 256))
    packed = bytearray(GRID * GRID // 2)
    for i in range(0, len(nibbles), 2):
        packed[i // 2] = (nibbles[i] << 4) | nibbles[i + 1]
    aspect = max(0.0, min(4.0, w / h))
    return bytes(packed), round(aspect / 4.0 * 255)

def main():
    names = font_names()
    n_chars = len(CHARSET)
    data = bytearray()
    aspects = bytearray()
    slugs, missing_fonts, missing_glyphs = [], [], 0
    for name in names:
        slug = slugify(name)
        slugs.append(slug)
        ttf = os.path.join(TTF_DIR, f"{slug}.ttf")
        if not os.path.exists(ttf):
            missing_fonts.append(name)
            data.extend(b"\x00" * (n_chars * GRID * GRID // 2))
            aspects.extend(b"\x00" * n_chars)
            continue
        for ch in CHARSET:
            res = glyph_fingerprint(ttf, ch)
            if res is None:
                data.extend(b"\x00" * (GRID * GRID // 2))
                aspects.append(0)
                missing_glyphs += 1
            else:
                packed, asp = res
                data.extend(packed)
                aspects.append(asp)
        print(f"fingerprinted {name}", flush=True)
    payload = {
        "grid": GRID,
        "charset": CHARSET,
        "fonts": slugs,
        "aspects": base64.b64encode(bytes(aspects)).decode(),
        "data": base64.b64encode(bytes(data)).decode(),
    }
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w") as f:
        json.dump(payload, f)
    size_mb = os.path.getsize(OUT_PATH) / 1e6
    print(f"\nWROTE {OUT_PATH} ({size_mb:.2f} MB)")
    print(f"fonts={len(names)} missing_fonts={len(missing_fonts)} missing_glyphs={missing_glyphs}")
    if missing_fonts:
        print("MISSING FONTS:", ", ".join(missing_fonts))

if __name__ == "__main__":
    main()

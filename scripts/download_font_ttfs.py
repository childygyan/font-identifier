#!/usr/bin/env python3
"""Download one regular-weight TTF per font family via the Google Fonts CSS API v1
(requesting with an old UA returns truetype URLs from fonts.gstatic.com)."""
import os, re, sys, time, urllib.request, urllib.parse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from font_names import font_names

OUT_DIR = os.path.expanduser("~/workspace/font-identifier/scripts/font-ttfs")
os.makedirs(OUT_DIR, exist_ok=True)

UA = "Mozilla/4.0"
CSS_TMPL = "https://fonts.googleapis.com/css?family={q}"

def fetch_css(family):
    q = urllib.parse.quote(family)
    req = urllib.request.Request(CSS_TMPL.format(q=q), headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "replace")

def download(url, dest):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r, open(dest, "wb") as f:
        while True:
            chunk = r.read(65536)
            if not chunk:
                break
            f.write(chunk)

def main():
    names = font_names()
    ok, failed = [], []
    for i, name in enumerate(names, 1):
        slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
        dest = os.path.join(OUT_DIR, f"{slug}.ttf")
        if os.path.exists(dest) and os.path.getsize(dest) > 1000:
            ok.append(name)
            continue
        try:
            css = fetch_css(name)
            m = re.search(r"url\((https://fonts\.gstatic\.com/[^)]+\.ttf)\)", css)
            if not m:
                # variable font served as multiple unicode-range splits; take latin block if present
                blocks = re.findall(r"/\* (\w+) \*/\s*@font-face \{[^}]*?url\((https://fonts\.gstatic\.com/[^)]+\.ttf)\)", css)
                latin = [u for subset, u in blocks if subset == "latin"]
                m2 = latin[0] if latin else (blocks[0][1] if blocks else None)
                if not m2:
                    raise RuntimeError("no ttf url in css")
                url = m2
            else:
                url = m.group(1)
            download(url, dest)
            ok.append(name)
            print(f"[{i}/{len(names)}] OK  {name}", flush=True)
        except Exception as e:
            failed.append((name, str(e)[:120]))
            print(f"[{i}/{len(names)}] FAIL {name}: {e}", flush=True)
        time.sleep(0.15)
    print(f"\nDONE ok={len(ok)} failed={len(failed)}")
    for n, e in failed:
        print(f"  FAILED: {n} :: {e}")
    with open(os.path.join(OUT_DIR, "_failed.txt"), "w") as f:
        f.write("\n".join(n for n, _ in failed))

if __name__ == "__main__":
    main()

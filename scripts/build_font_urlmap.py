#!/usr/bin/env python3
"""Build public/scan/font-urls.json: {slug: gstatic TTF url} for stage-2 rendering."""
import json, os, re, sys, time, urllib.request, urllib.parse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from font_names import font_names

UA = "Mozilla/4.0"
OUT = os.path.expanduser("~/workspace/font-identifier/public/scan/font-urls.json")

def css_for(family):
    q = urllib.parse.quote(family)
    req = urllib.request.Request(
        f"https://fonts.googleapis.com/css?family={q}", headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "replace")

def slugify(name):
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")

def main():
    names = font_names()
    mapping = {}
    for i, name in enumerate(names, 1):
        slug = slugify(name)
        try:
            css = css_for(name)
            m = re.search(r"url\((https://fonts\.gstatic\.com/[^)]+\.ttf)\)", css)
            if not m:
                blocks = re.findall(r"/\* (\w+) \*/\s*@font-face \{[^}]*?url\((https://fonts\.gstatic\.com/[^)]+\.ttf)\)", css)
                latin = [u for s, u in blocks if s == "latin"]
                url = latin[0] if latin else (blocks[0][1] if blocks else None)
            else:
                url = m.group(1)
            if url:
                mapping[slug] = url
                print(f"[{i}/{len(names)}] OK  {slug}")
            else:
                print(f"[{i}/{len(names)}] NOURL {name}")
        except Exception as e:
            print(f"[{i}/{len(names)}] FAIL {name}: {e}"[:120])
        time.sleep(0.1)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(mapping, open(OUT, "w"))
    print(f"WROTE {OUT} with {len(mapping)} urls")

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Shared helper: read the canonical font list from src/data/fonts.ts.

Font entries are declared as f("Font Name", ...) calls. This keeps the
recognition-asset generator scripts reproducible without depending on a
/tmp scratch file.
"""
import os
import re

REPO = os.path.expanduser("~/workspace/font-identifier")
FONTS_TS = os.path.join(REPO, "src", "data", "fonts.ts")


def font_names(path: str = FONTS_TS):
    src = open(path, encoding="utf-8").read()
    names = re.findall(r'\bf\(\s*"([^"]+)"', src)
    # de-dupe while preserving order
    seen = set()
    out = []
    for n in names:
        if n not in seen:
            seen.add(n)
            out.append(n)
    return out


if __name__ == "__main__":
    names = font_names()
    print(len(names))

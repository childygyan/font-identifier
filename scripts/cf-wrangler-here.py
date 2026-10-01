#!/usr/bin/env python3
"""Run wrangler with the stored Cloudflare API credential (surrogate),
with cwd = the invoking repo root (NOT height-calculator)."""
from __future__ import annotations

import os
import subprocess
import sys

sys.path.insert(0, "/opt/hatch/skills/skill-creator/bin")
from dynamic_credentials import dynamic_credential_entry  # noqa: E402


def main(argv: list[str]) -> int:
    entry = dynamic_credential_entry("custom.cloudflare", "access_token")
    surrogate = str(entry["surrogate"]).strip()
    if not surrogate.startswith("hsurr:"):
        print("error: did not get a surrogate credential", file=sys.stderr)
        return 1
    env = dict(os.environ)
    env["CLOUDFLARE_API_TOKEN"] = surrogate
    env.setdefault("CLOUDFLARE_ACCOUNT_ID", "1abe704f3449834965689b3b47db3926")
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    proc = subprocess.run(
        ["npx", "-y", "wrangler@4", *argv],
        cwd=repo_root,
        env=env,
    )
    return proc.returncode


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

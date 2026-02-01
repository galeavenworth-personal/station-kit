#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


TOKEN_REGEX = re.compile(r"\{\{(SK_[A-Z0-9_]+)\}\}")


def extract_tokens_from_templates(templates_root: Path) -> set[str]:
    tokens: set[str] = set()
    for path in templates_root.rglob("*"):
        if path.is_dir():
            continue
        try:
            content = path.read_text(encoding="utf-8")
        except Exception:
            continue
        tokens.update(TOKEN_REGEX.findall(content))
    return tokens


def extract_allowlist_from_file(allowlist_path: Path) -> set[str]:
    allowlist: set[str] = set()
    content = allowlist_path.read_text(encoding="utf-8")
    for line in content.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        allowlist.add(line)
    return allowlist


def main() -> int:
    parser = argparse.ArgumentParser(description="Audit SK token usage vs allowlist file.")
    parser.add_argument("--templates", default="templates", help="Templates directory")
    parser.add_argument(
        "--allowlist",
        default="tools/tokens_allowlist.txt",
        help="Path to SK token allowlist file",
    )
    args = parser.parse_args()

    templates_root = Path(args.templates)
    allowlist_path = Path(args.allowlist)

    if not templates_root.exists():
        print(f"Templates directory not found: {templates_root}", file=sys.stderr)
        return 2
    if not allowlist_path.exists():
        print(f"Allowlist file not found: {allowlist_path}", file=sys.stderr)
        return 2

    tokens = extract_tokens_from_templates(templates_root)
    allowlist = extract_allowlist_from_file(allowlist_path)

    missing = sorted(tokens - allowlist)
    if missing:
        print("Tokens used in templates but missing from allowlist:")
        for token in missing:
            print(f"- {token}")
        return 1

    print("Token audit passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

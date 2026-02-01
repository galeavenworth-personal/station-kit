#!/usr/bin/env python3
from __future__ import annotations

import argparse
import os
import re
import sys
from pathlib import Path


DEFAULT_PATTERNS = [
    r"OWNER/REPO",
    r"INSERT CONTACT METHOD",
    r"INSERT CONTACT",
    r"YOUR_ORG",
    r"YOUR_EMAIL",
]

DEFAULT_EXCLUDES = {
    ".git",
    ".kilocode",
    "node_modules",
    "dist",
    "build",
    "docs",
    "pre-flight",
    "plans",
    "scripts",
    "private",
    "venv",
    ".venv",
    "__pycache__",
}

TEXT_EXTENSIONS = {
    ".md",
    ".txt",
    ".yml",
    ".yaml",
    ".toml",
    ".json",
    ".py",
    ".js",
    ".ts",
    ".tsx",
    ".jsx",
    ".sh",
    ".bash",
    ".zsh",
    ".cfg",
    ".ini",
    ".rst",
    ".html",
    ".css",
    ".scss",
}


def is_text_like(path: Path) -> bool:
    if path.suffix.lower() in TEXT_EXTENSIONS:
        return True
    # treat extensionless files as text if small and decodable
    if path.suffix == "":
        return True
    return False


def iter_files(root: Path, excludes: set[str]) -> list[Path]:
    files: list[Path] = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in excludes]
        for name in filenames:
            files.append(Path(dirpath) / name)
    return files


def strip_inline_code(line: str) -> str:
    return re.sub(r"`[^`]*`", "", line)


def scan_file(
    path: Path,
    regexes: list[re.Pattern[str]],
    *,
    scan_code_blocks: bool = False,
) -> list[tuple[int, str]]:
    results: list[tuple[int, str]] = []
    try:
        content = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        try:
            content = path.read_text(encoding="latin-1")
        except Exception:
            return results
    except Exception:
        return results

    in_code_block = False
    for idx, line in enumerate(content.splitlines(), start=1):
        if line.strip().startswith("```"):
            in_code_block = not in_code_block
            continue
        if in_code_block and not scan_code_blocks:
            continue
        line_for_scan = strip_inline_code(line)
        for rx in regexes:
            if rx.search(line_for_scan):
                results.append((idx, line.strip()))
                break
    return results


def main() -> int:
    parser = argparse.ArgumentParser(description="Scan for publish placeholders.")
    parser.add_argument("--root", default=".", help="Root directory to scan")
    parser.add_argument(
        "--include-docs",
        action="store_true",
        help="Include docs/ directory in scan",
    )
    parser.add_argument(
        "--scan-code-blocks",
        action="store_true",
        help="Scan fenced code blocks in markdown files",
    )
    parser.add_argument(
        "--pattern",
        action="append",
        dest="patterns",
        help="Placeholder regex (can be repeated)",
    )
    args = parser.parse_args()

    patterns = args.patterns if args.patterns else DEFAULT_PATTERNS
    regexes = [re.compile(p) for p in patterns]

    root = Path(args.root).resolve()
    excludes = set(DEFAULT_EXCLUDES)
    if args.include_docs:
        excludes.discard("docs")
    failures = 0
    for path in iter_files(root, excludes):
        if not is_text_like(path):
            continue
        if path.suffix.lower() == ".md":
            hits = scan_file(
                path,
                regexes,
                scan_code_blocks=args.scan_code_blocks,
            )
        else:
            hits = scan_file(path, regexes)
        if hits:
            rel = path.relative_to(root)
            for line_no, line in hits:
                print(f"{rel}:{line_no}: {line}")
                failures += 1

    if failures:
        print(f"Found {failures} placeholder occurrence(s).", file=sys.stderr)
        return 1
    print("No placeholders found.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

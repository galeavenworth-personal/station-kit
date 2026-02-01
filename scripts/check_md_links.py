#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


LINK_REGEX = re.compile(r"\[[^\]]*\]\(([^)]+)\)")
GITHUB_LINE_REF_REGEX = re.compile(r":\d+$")
HEADING_REGEX = re.compile(r"^(#{1,6})\s+(.*?)\s*$")
MD_LINK_TEXT_REGEX = re.compile(r"\[([^\]]+)\]\([^)]+\)")


def iter_markdown_files(root: Path) -> list[Path]:
    return [p for p in root.rglob("*.md") if p.is_file()]


def is_http(link: str) -> bool:
    return link.startswith("http://") or link.startswith("https://")


def is_mailto(link: str) -> bool:
    return link.startswith("mailto:")


def normalize_link(link: str) -> str:
    base = link.split("#", 1)[0]
    if base.startswith("file://"):
        base = base.replace("file://", "", 1)
    return base


def extract_fragment(link: str) -> str | None:
    if "#" not in link:
        return None
    fragment = link.split("#", 1)[1].strip()
    return fragment or None


def normalize_heading_text(text: str) -> str:
    text = MD_LINK_TEXT_REGEX.sub(r"\1", text)
    text = text.replace("`", "")
    text = text.replace("*", "").replace("_", "")
    text = text.strip()
    return text


def slugify_github(text: str) -> str:
    text = normalize_heading_text(text).lower()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"\s+", "-", text)
    text = re.sub(r"-+", "-", text)
    return text.strip("-")


def build_anchor_index(content: str) -> set[str]:
    anchors: set[str] = set()
    seen: dict[str, int] = {}
    for line in content.splitlines():
        match = HEADING_REGEX.match(line)
        if not match:
            continue
        heading = match.group(2).strip()
        slug = slugify_github(heading)
        if not slug:
            continue
        count = seen.get(slug, 0)
        if count:
            anchor = f"{slug}-{count}"
        else:
            anchor = slug
        seen[slug] = count + 1
        anchors.add(anchor)
    return anchors


def get_anchor_index(path: Path, cache: dict[Path, set[str]]) -> set[str]:
    if path in cache:
        return cache[path]
    try:
        content = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        cache[path] = set()
        return cache[path]
    anchors = build_anchor_index(content)
    cache[path] = anchors
    return anchors


def has_github_line_ref(link: str) -> bool:
    base = link.split("#", 1)[0]
    return bool(GITHUB_LINE_REF_REGEX.search(base))


def validate_link(
    file_path: Path,
    link: str,
    repo_root: Path,
    anchor_cache: dict[Path, set[str]],
    *,
    forbid_line_refs: bool,
) -> bool:
    if not link or link.startswith("#"):
        fragment = extract_fragment(link)
        if fragment is None:
            return True
        anchors = get_anchor_index(file_path, anchor_cache)
        return fragment in anchors
    if is_http(link) or is_mailto(link):
        return True
    if forbid_line_refs and has_github_line_ref(link):
        return False
    fragment = extract_fragment(link)
    link = normalize_link(link)
    if not link:
        return True
    if link.startswith("/"):
        target = repo_root / link.lstrip("/")
    elif link.startswith("./") or link.startswith("../"):
        target = (file_path.parent / link).resolve()
    elif "/" in link:
        target = (repo_root / link).resolve()
    else:
        target = (file_path.parent / link).resolve()
    if not target.exists():
        return False
    if fragment is None:
        return True
    if target.suffix.lower() != ".md":
        return False
    anchors = get_anchor_index(target, anchor_cache)
    return fragment in anchors


def scan_file(
    path: Path,
    repo_root: Path,
    anchor_cache: dict[Path, set[str]],
    *,
    forbid_line_refs: bool,
) -> list[tuple[int, str]]:
    failures: list[tuple[int, str]] = []
    content = path.read_text(encoding="utf-8")
    for idx, line in enumerate(content.splitlines(), start=1):
        for match in LINK_REGEX.finditer(line):
            link = match.group(1).strip()
            if not validate_link(
                path,
                link,
                repo_root,
                anchor_cache,
                forbid_line_refs=forbid_line_refs,
            ):
                failures.append((idx, link))
    return failures


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate repo-relative markdown links.")
    parser.add_argument("--root", default=".", help="Repository root")
    parser.add_argument(
        "--include-templates",
        action="store_true",
        help="Include templates/ markdown in link validation",
    )
    parser.add_argument(
        "--github",
        action="store_true",
        help="Enforce GitHub-compatible links (forbid :line refs)",
    )
    args = parser.parse_args()

    repo_root = Path(args.root).resolve()
    docs_root = repo_root / "docs"
    templates_root = repo_root / "templates"
    readme = repo_root / "README.md"

    candidates: list[Path] = []
    if readme.exists():
        candidates.append(readme)
    if docs_root.exists():
        candidates.extend(iter_markdown_files(docs_root))
    if args.include_templates and templates_root.exists():
        candidates.extend(iter_markdown_files(templates_root))

    failures = 0
    anchor_cache: dict[Path, set[str]] = {}
    for path in candidates:
        try:
            hits = scan_file(
                path,
                repo_root,
                anchor_cache,
                forbid_line_refs=args.github,
            )
        except UnicodeDecodeError:
            continue
        for line_no, link in hits:
            rel = path.relative_to(repo_root)
            print(f"{rel}:{line_no}: {link}")
            failures += 1

    if failures:
        print(f"Found {failures} broken repo-relative link(s).", file=sys.stderr)
        return 1
    print("Markdown link validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

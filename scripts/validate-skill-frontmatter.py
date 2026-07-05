from __future__ import annotations

import argparse
import sys
from pathlib import Path

import yaml


REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_ROOTS = [REPO_ROOT / "skills"]


def split_frontmatter(text: str) -> tuple[list[str], list[str]] | None:
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return None

    end = None
    for index, line in enumerate(lines[1:], start=1):
        if line.strip() == "---":
            end = index
            break

    if end is None:
        return None

    return lines[1:end], lines[end + 1 :]


def validate_file(path: Path) -> list[str]:
    text = path.read_text(encoding="utf-8")
    split = split_frontmatter(text)
    if split is None:
        return ["missing or unterminated frontmatter"]

    frontmatter, _body = split
    try:
        data = yaml.safe_load("\n".join(frontmatter))
    except Exception as exc:  # noqa: BLE001
        return [f"invalid YAML frontmatter: {exc.__class__.__name__}: {exc}"]

    if not isinstance(data, dict):
        return ["frontmatter did not parse to a mapping"]

    description = data.get("description")
    if not isinstance(description, str) or not description.strip():
        return ["missing or empty description"]

    return []


def iter_skill_files(roots: list[Path]) -> list[Path]:
    files: list[Path] = []
    for root in roots:
        if root.exists():
            files.extend(sorted(root.rglob("SKILL.md")))
    return files


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate SKILL.md frontmatter.")
    parser.add_argument("roots", nargs="*", type=Path)
    args = parser.parse_args()

    roots = args.roots or DEFAULT_ROOTS
    files = iter_skill_files(roots)

    if not files:
        print("No SKILL.md files found.")
        return 1

    failures = 0
    for path in files:
        issues = validate_file(path)
        if issues:
            failures += 1
            print(path)
            for issue in issues:
                print(f"  - {issue}")

    print()
    print(f"Scanned: {len(files)} file(s)")
    print(f"Failed:  {failures}")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())

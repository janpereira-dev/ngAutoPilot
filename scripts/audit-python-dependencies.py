"""Audit Skill Lab's resolved Python dependencies without installing the product."""

import os
from pathlib import Path
import subprocess
import sys
import tempfile
import tomllib


def main():
    root = Path(__file__).resolve().parent.parent
    manifest = root / "skill-lab/python/pyproject.toml"
    dependencies = tomllib.loads(manifest.read_text(encoding="utf-8"))["project"]["dependencies"]
    if not dependencies or any(not isinstance(item, str) or "\n" in item or "\r" in item for item in dependencies):
        raise ValueError("Python audit requires non-empty, single-line dependency declarations")
    output = root / "dist/security"
    if output.resolve() != output or (root / "dist").resolve() != root / "dist":
        raise ValueError("Python audit refuses linked output directories")
    output.mkdir(parents=True, exist_ok=True)
    report = output / "python-dependency-audit.json"
    if report.is_symlink():
        raise ValueError("Python audit refuses a linked report")
    # The resolver may download wheels, but must not run package build hooks.
    environment = {**os.environ, "PIP_ONLY_BINARY": ":all:"}
    with tempfile.TemporaryDirectory(prefix="ngautopilot-python-audit-") as directory:
        requirements = Path(directory) / "requirements.txt"
        requirements.write_text("\n".join(dependencies) + "\n", encoding="utf-8")
        return subprocess.run(
            [sys.executable, "-m", "pip_audit", "--strict", "-r", str(requirements),
             "--format", "json", "--output", str(report)],
            cwd=root, env=environment, check=False,
        ).returncode


if __name__ == "__main__":
    sys.exit(main())

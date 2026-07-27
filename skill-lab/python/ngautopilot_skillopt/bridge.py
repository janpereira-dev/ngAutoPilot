"""Narrow SkillOpt bridge for NgAutoPilot Skill Lab.

This module is the only place that may know SkillOpt internals. It reads a
governed JSON contract from Node, allows train and validation inputs only, and
writes candidate.SKILL.md under the requested skill-lab output directory.
"""

from __future__ import annotations

import importlib
import json
import pathlib
import sys
from typing import Any


def main(argv: list[str] | None = None) -> int:
    args = list(sys.argv[1:] if argv is None else argv)
    if len(args) != 1:
        print("Usage: python -m ngautopilot_skillopt.bridge <contract.json>", file=sys.stderr)
        return 2

    contract_path = pathlib.Path(args[0]).resolve()
    contract = json.loads(contract_path.read_text(encoding="utf-8"))
    try:
        candidate_path = run_bridge(contract)
    except BridgeError as error:
        print(str(error), file=sys.stderr)
        return 2

    print(candidate_path.as_posix())
    return 0


def run_bridge(contract: dict[str, Any]) -> pathlib.Path:
    output_directory = pathlib.Path(contract["outputDirectory"]).resolve()
    candidate_path = output_directory / "candidate.SKILL.md"
    output_directory.mkdir(parents=True, exist_ok=True)
    assert_output_boundary(candidate_path)
    assert_allowed_splits(contract)

    try:
        skillopt = importlib.import_module("skillopt")
    except ModuleNotFoundError as exc:
        raise BridgeError(
            "SkillOpt is not installed for the Skill Lab bridge. "
            "Run: python -m pip install -e skill-lab/python"
        ) from exc

    result = call_known_skillopt_api(skillopt, contract)
    candidate = extract_candidate(result, candidate_path)
    if candidate is not None:
        candidate_path.write_text(candidate, encoding="utf-8")

    if not candidate_path.exists():
        raise BridgeError(
            "SkillOpt completed without candidate.SKILL.md. Update "
            "skill-lab/python/ngautopilot_skillopt/bridge.py for the installed SkillOpt API."
        )

    return candidate_path


def call_known_skillopt_api(skillopt: Any, contract: dict[str, Any]) -> Any:
    if hasattr(skillopt, "optimize_skill"):
        return skillopt.optimize_skill(contract)
    if hasattr(skillopt, "optimize"):
        return skillopt.optimize(contract)
    raise BridgeError(
        "Installed SkillOpt package does not expose a supported optimize API. "
        "Expected skillopt.optimize_skill(contract) or skillopt.optimize(contract). "
        "Update only skill-lab/python/ngautopilot_skillopt/bridge.py after verifying the local API."
    )


def extract_candidate(result: Any, candidate_path: pathlib.Path) -> str | None:
    if isinstance(result, str):
        return result
    if isinstance(result, dict):
        for key in ("candidate", "candidateSkill", "candidate_skill"):
            value = result.get(key)
            if isinstance(value, str):
                return value
        output_file = result.get("candidatePath") or result.get("candidate_path")
        if isinstance(output_file, str):
            source = pathlib.Path(output_file).resolve()
            assert_output_boundary(source)
            candidate_path.write_text(source.read_text(encoding="utf-8"), encoding="utf-8")
            return None
    return None


def assert_allowed_splits(contract: dict[str, Any]) -> None:
    splits = set((contract.get("splits") or {}).keys())
    forbidden = splits.intersection({"test", "adversarial"})
    if forbidden:
        raise BridgeError(f"SkillOpt contract cannot include promotion splits: {sorted(forbidden)}")


def assert_output_boundary(path: pathlib.Path) -> None:
    parts = set(path.parts)
    if "skills" in parts:
        raise BridgeError("SkillOpt bridge refuses to write under skills/**")
    if "skill-lab" not in parts:
        raise BridgeError("SkillOpt bridge output must stay under skill-lab/**")


class BridgeError(RuntimeError):
    """Governed bridge failure with user-actionable guidance."""


if __name__ == "__main__":
    raise SystemExit(main())

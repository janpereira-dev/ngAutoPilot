# NgAutoPilot Skill Lab

`skill-lab/` is the governed evaluation laboratory for NgAutoPilot skills.

It answers one question before any optimized skill reaches `skills/**`:

```text
Is this skill actually better, and did it regress anything critical?
```

## Quick Path

```bash
npm run skill-lab:validate
npm run skill-lab:test

npm run skill-lab:baseline -- \
  --benchmark angular-upgrade-validation-gate

npm run skill-lab:evaluate -- \
  --benchmark angular-upgrade-validation-gate \
  --splits train,validation \
  --output skill-lab/runs/manual-evaluation/baseline-results

npm run skill-lab:optimize -- \
  --benchmark angular-upgrade-validation-gate \
  --run <run-id>
```

## Rules

- SkillOpt proposes candidates only.
- NgAutoPilot decides whether a candidate is promotable.
- Candidates stay outside `skills/**` until a human applies a reviewed diff in a branch.
- Test and adversarial splits are promotion gates, not optimization inputs.
- No private data, personal sessions, or corporate code is allowed.

Read `POLICY.md` before running any model-backed experiment.

## Current Scope

Implemented phases:

- Phase A: governance, structure, schemas, benchmark shell.
- Phase B: deterministic evaluator, regression detector, gate engine, reports.
- Phase C: first benchmark fixtures and splits for `angular-upgrade-validation-gate`.
- Phase D: governed SkillOpt bridge contract, agentic gate evidence interface, promotion packet generation, evidence-backed gate inputs, and Skill Lab CI workflows.

The SkillOpt bridge is real but intentionally narrow. It calls `python -m ngautopilot_skillopt.bridge` with a contract that exposes only train and validation splits. If the local `skillopt` package or its expected API is unavailable, the command fails with setup guidance instead of pretending to optimize.

Still manual:

- Applying `canonical.diff` to `skills/**`.
- Running repository gates against a temporary promoted copy.
- Opening a pull request.

Generated candidates, harness evidence, and promotion packets remain under `skill-lab/runs/**`.

## Promotion

Promotion is manual:

1. Review `candidate.SKILL.md`.
2. Review comparison and gate output.
3. Run `npm run skill-lab:prepare-promotion -- --run <run-id>`.
4. Apply `promotion/canonical.diff` manually in a branch.
5. Run `npm run release:validate`.
6. Open a draft pull request with evidence.

No command in this lab commits, pushes, publishes, opens a PR, or overwrites `skills/**`.

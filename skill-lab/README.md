# NgAutoPilot Skill Lab

`skill-lab/` is the governed evaluation laboratory for NgAutoPilot skills.

It answers one question before any optimized skill reaches `skills/**`:

```text
Is this skill actually better, and did it regress anything critical?
```

## Quick Path

```bash
python -m pip install -e skill-lab/python
npm run skill-lab:validate
npm run skill-lab:test

npm run skill-lab:baseline -- \
  --benchmark angular-upgrade-validation-gate \
  --run manual-evaluation

npm run skill-lab:evaluate -- \
  --benchmark angular-upgrade-validation-gate \
  --splits train,validation \
  --output skill-lab/runs/manual-evaluation/baseline-results

npm run skill-lab:optimize -- \
  --benchmark angular-upgrade-validation-gate \
  --run <run-id>
```

## Default Models

Skill Lab defaults to OpenAI API model id `gpt-4.1-mini` for both roles:

| Role | Default | Why |
|------|---------|-----|
| Optimizer | `gpt-4.1-mini` | Low-cost instruction and code-oriented edits for small skill benchmarks. |
| Target | `gpt-4.1-mini` | Keeps evaluation behavior aligned with the optimizer during early lab runs. |

Use `gpt-4.1` for `optimizerModel` only when `gpt-4.1-mini` produces weak or noisy edits. Keep `targetModel` stable while comparing candidates; changing both models changes the experiment.

Credential setup depends on the SkillOpt backend. For the default OpenAI-compatible path, set:

```bash
export OPENAI_API_KEY=<your-key>
```

Override models when needed:

```bash
npm run skill-lab:optimize -- \
  --benchmark angular-upgrade-validation-gate \
  --run manual-evaluation \
  --optimizerModel gpt-4.1 \
  --targetModel gpt-4.1-mini \
  --epochs 3 \
  --editBudget 4 \
  --seed 42
```

Equivalent environment variables:

```bash
export SKILL_LAB_OPTIMIZER_MODEL=gpt-4.1-mini
export SKILL_LAB_TARGET_MODEL=gpt-4.1-mini
```

## Complete Local Workflow

```bash
python -m pip install -e skill-lab/python
npm run skill-lab:ci

npm run skill-lab:baseline -- \
  --benchmark angular-upgrade-validation-gate \
  --run manual-evaluation

npm run skill-lab:evaluate -- \
  --benchmark angular-upgrade-validation-gate \
   --run manual-evaluation \
   --skill skill-lab/runs/manual-evaluation/baseline.SKILL.md \
   --splits validation \
   --runs 1 \
  --output skill-lab/runs/manual-evaluation/baseline-results

npm run skill-lab:optimize -- \
  --benchmark angular-upgrade-validation-gate \
  --run manual-evaluation \
  --epochs 3 \
  --editBudget 4 \
  --seed 42

npm run skill-lab:evaluate -- \
   --benchmark angular-upgrade-validation-gate \
   --run manual-evaluation \
   --splits validation \
   --runs 1

npm run skill-lab:compare -- \
  --run manual-evaluation

```

## Repository Gate Evidence

Run repository validation against a temporary promoted copy of the candidate and record the result in `skill-lab/runs/<run-id>/repository-gates/report.json` before requesting final promotion evaluation:

```bash
npm run release:validate
```

## Agentic Gate Evidence

Collect harness evidence for the candidate, then write the gate report before promotion splits:

```bash
npm run skill-lab:agentic-gate -- \
  --run manual-evaluation \
  --harness <harness>
```

```bash

npm run skill-lab:evaluate -- \
  --benchmark angular-upgrade-validation-gate \
  --run manual-evaluation \
  --splits test,adversarial

npm run skill-lab:gate -- \
  --run manual-evaluation \
  --stage final

npm run skill-lab:prepare-promotion -- \
  --run manual-evaluation
```

Review `skill-lab/runs/<run-id>/promotion/canonical.diff` before applying anything to `skills/**`.

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

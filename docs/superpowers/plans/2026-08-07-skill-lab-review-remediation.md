# Skill Lab Review Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Skill Lab CI, candidate evaluation, promotion evidence, and security gates fail closed with reproducible evidence.

**Architecture:** Keep deterministic evaluation and SkillOpt model-backed rollout separate. Extract reusable candidate-content security and benchmark-target containment helpers. Promotion consumes only evidence bound to one candidate hash and manifest.

**Tech Stack:** Node.js ESM, Python 3.11, SkillOpt 0.2, GitHub Actions, Node test runner.

## Global Constraints

- Keep generated candidates and artifacts under `skill-lab/runs/**`.
- Never auto-modify `skills/**`.
- Keep legacy Angular package fixtures unchanged; exclude only fixture paths from Socket scanning.
- Preserve canonical skill frontmatter.

---

### Task 1: Restore Clean CI and Workflow Documentation

**Files:**
- Modify: `.github/workflows/skill-lab-static.yml`
- Modify: `.github/workflows/skill-lab-optimize.yml`
- Modify: `skill-lab/README.md`
- Create: `socket.yml`
- Test: `skill-lab/tests/phase-d.test.mjs`

- [ ] Add a failing assertion that static workflow installs `skill-lab/python` before tests.
- [ ] Run `npm run skill-lab:test`; expected failure until workflow includes editable bridge install.
- [ ] Install `python -m pip install -e skill-lab/python` in static CI, map `OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}` into optimization, and use `export` in Bash examples.
- [ ] Move final gate command after repository, agentic, test, and adversarial evidence steps in README.
- [ ] Add root `socket.yml` version 2 with `projectIgnorePaths: ["skill-lab/benchmarks/**/fixtures/**"]`.
- [ ] Run focused tests; expected pass.

### Task 2: Bind Evidence and Promotion to Candidate and Manifest

**Files:**
- Modify: `skill-lab/lib/gate-evidence.mjs`
- Modify: `skill-lab/lib/promotion-packet.mjs`
- Modify: `skill-lab/scripts/run-gate.mjs`
- Test: `skill-lab/tests/phase-d.test.mjs`

- [ ] Add failing tests for stale test, adversarial, repository evidence; rejected gate report; and target-hash mismatch.
- [ ] Make `collectGateEvidence(runRoot, candidateHash)` reject missing or mismatched `skillHash`/`candidateHash` fields.
- [ ] Require accepted gate report and matching candidate hash in `generatePromotionPacket`.
- [ ] Read `manifest.json`, resolve `targetSkillPath` beneath repository `skills/`, compare its current hash to `targetSkillHash`, then diff target skill against candidate.
- [ ] Run focused promotion and gate tests; expected pass.

### Task 3: Make Repetition, Rubric, and Target Paths Real Inputs

**Files:**
- Modify: `skill-lab/lib/deterministic-scorer.mjs`
- Modify: `skill-lab/scripts/evaluate-skill.mjs`
- Modify: `skill-lab/scripts/compare-results.mjs`
- Modify: `skill-lab/scripts/snapshot-baseline.mjs`
- Modify: `skill-lab/scripts/validate-lab.mjs`
- Modify: `skill-lab/benchmarks/angular-upgrade-validation-gate/benchmark.yaml`
- Test: `skill-lab/tests/phase-d.test.mjs`

- [ ] Add failing tests proving repeated comparisons count only per-run wins, rubric weight changes affect aggregate score, fixture changes affect manifest input hash, and `skills/../plugins/...` is rejected.
- [ ] Load `rubric.json` per benchmark and emit dimension object before weighted aggregation.
- [ ] Persist and compare `run-N` baseline/candidate result pairs; count only each pair without regressions or missing cases.
- [ ] Hash referenced JSON fixtures while snapshotting; bump benchmark version for changed inputs.
- [ ] Resolve target path with `path.relative(repoRoot/skills, resolvedTarget)` containment checks.
- [ ] Run focused test file; expected pass.

### Task 4: Reuse Full Candidate Security Scan

**Files:**
- Create: `skill-lab/lib/candidate-security.mjs`
- Modify: `scripts/security-scan-skills.mjs`
- Modify: `skill-lab/scripts/run-gate.mjs`
- Test: `skill-lab/tests/phase-d.test.mjs`

- [ ] Add failing tests for merge markers, private key markers, credential-shaped values, invisible controls, remote shells, and broad `allowed-tools` in candidates.
- [ ] Extract content-level scanner returning finding strings without filesystem traversal.
- [ ] Use helper in repository scanner and pass `securityPassed: findings.length === 0` to gate.
- [ ] Run security scan and focused tests; expected pass.

### Task 5: Execute SkillOpt Target-Model Rollouts

**Files:**
- Modify: `skill-lab/python/ngautopilot_skillopt/bridge.py`
- Modify: `skill-lab/tests/phase-d.test.mjs`

- [ ] Add failing fake-SkillOpt test requiring `chat_target(system=skill_content, user=request)` during EnvAdapter rollout.
- [ ] Import and invoke `skillopt.model.chat_target`, preserve prediction/conversation artifacts, and score response with benchmark checks.
- [ ] Keep model calls restricted to train and validation contract splits.
- [ ] Run focused bridge tests, then `npm run skill-lab:ci` and `npm run release:validate`; expected pass.

### Task 6: Deliver Reviewable Fix

**Files:**
- Modify: all files above only.

- [ ] Inspect `git diff --check` and `git status --short`.
- [ ] Run complete validation commands from Task 5.
- [ ] Commit only after explicit user request; push branch if requested.

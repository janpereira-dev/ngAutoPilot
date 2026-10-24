# Evidence-driven Angular ecosystem modernization

Reviewed 2026-10-24. Procedures and proposed pilot contracts below do not implement an automatic consumer runner, repair engine or gate-quality benchmark.

## Ecosystem order and baseline

For a connected ecosystem, inventory repositories, commits, package names, source paths, public exports, peer ranges and direct/transitive consumers. Build a dependency graph before choosing execution order. For the user's library/host/MFE ecosystem, validate libraries first, then host, then MFEs for each major hop. This is an ecosystem dependency policy, not a universal Angular framework requirement.

If libraries depend on other libraries, use topological order. Block on unresolved cycles, unknown consumers, missing repository access or failed upstream validation; do not report an uninspected consumer as unaffected. Record source and target versions for every node. Detect nested Maven/JEE frontends separately from root-layout libraries.

Capture a compilable baseline, real API/BFF fixtures, proxy/environments/baseHref/auth/interceptor behavior, passing tests and visual captures before mutation. Build library artifacts and validate consumers against those exact artifacts. In the corporate launcher flow, retain npmName/distPath evidence and link consumers through the intended file:../lib/dist artifact references; do not silently test an old registry package.

Keep each upgrade major-by-major (Angular 2 → 4 is the numbering exception). Validate the affected ecosystem before advancing. Separate required compatibility fixes from optional modern API, test-runner or architecture changes.

## Consumer Impact Gate: operational procedure

For each changed shared library:

1. Diff public exports, .d.ts types, DTOs, imports/exports, selectors, inputs/outputs, DI tokens, shared singleton dependencies and package export paths against the baseline.
2. Enumerate affected direct and transitive consumers across repositories. Record why each consumer is selected or not applicable, and the commit/artifact used.
3. Compile the library and affected consumers against the rebuilt package. Verify imports, peer ranges, API contracts and runtime behavior where shared tokens/types or federation contracts changed.
4. Validate host/MFE integration: shared dependencies, remote manifests/URLs, routing, bootstrapping and fallback/rollback behavior relevant to the change.
5. Preserve API/BFF URLs, headers, authorization, proxy and payload semantics. A mock-only pass is insufficient if its fixtures do not represent the real contract.
6. Return FAIL for observed regressions and BLOCKED for missing required access/evidence. Only actual passing applicable checks permit advancement.

This makes consumer evidence required in the skill procedure; it does not claim an automatic cross-repository executor has been added.

## Verified Repair Registry: proposed pilot contract

Before invoking an agent to improvise a repair, inspect an existing reviewed solution, if one is actually available. Never fabricate registry entries or assume this repository already ships a repair service.

Each candidate rule needs: stable ID/revision; symptom/error signature; ecosystem and exact source/target Angular/Node/TypeScript/RxJS/builder/test-adapter ranges; applicability predicates; affected files; bounded action/diff; known counterexamples; pre/postconditions; rollback; originating commit and fixture hashes; successful build/test/consumer evidence; owner and last verification date.

A deterministic rule is eligible only when all predicates match and its evidence remains valid. An error string alone is insufficient. Apply through an authorized bounded executor, re-run validation and store the outcome; never reuse a past PASS as proof for new bytes. Reject stale or conflicting rules and escalate unresolved cases with sanitized logs. Review any agent-produced repair before promoting it to reusable knowledge. Target areas: Node, TypeScript, RxJS, builders, Jest/presets and corporate package compatibility.

## Gate Quality Benchmark: proposed pilot contract

Reuse existing Skill Lab test/adversarial splits, repeated-run and critical-regression controls where applicable. They are infrastructure, not proof that every Angular gate is calibrated.

For each gate, bind inputs and oracle to exact commits, toolchain and fixture hashes. Include:

- A known-correct implementation and multiple semantically valid alternatives.
- Seeded invalid cases: broken consumer export/type, API/BFF drift, missing required test, unsafe script, dependency mismatch and visual regression where applicable.
- Missing/partial evidence, warning-only runs and adversarial logs that ask the agent to ignore errors.
- Always-accept and always-reject controls. Neither may qualify by maximizing a single aggregate score.

Record false rejection and false acceptance rates separately, valid-alternative acceptance, per-case results, critical misses and balanced accuracy. Use a held-out, independently checked oracle; do not build every test from the verifier's own assumptions. Set thresholds before the experiment; a critical miss or unreviewed oracle blocks promotion. Do not count a valid alternative as a failure because its formatting or tool sequence differs from the preferred solution.

## Research evidence and limits

The following v1 abstracts and publication records were checked, not independently reproduced. None establishes an Angular 22 effect size.

| Study | Observed research result | Angular adaptation / status |
| --- | --- | --- |
| [RELAY, 2026-10-20](https://arxiv.org/abs/2610.27784v1) | 14,159 historical OSS-Fuzz cases; 69.7% failed reconstruction/verification. Reused deterministic rules plus agent escalation outperformed either alone in that study. | P2: pilot a version-scoped repair registry; do not claim Angular speed/cost gains before measurement |
| [Refactoring Ripple, 2026-10-17](https://arxiv.org/abs/2610.24790v1) | Java: 1,500 attempts, 1,455 complete candidates; 93.8% classified high contract/dependency risk; 106 had a detected broken downstream caller. No significant principal risk difference between the compared single/multi-agent conditions. | P1: require consumer impact evidence. Risk classification is not equivalent to proven incorrectness |
| [VerifierBench, 2026-10-19](https://arxiv.org/abs/2610.28679v1) | 19 models, 222 tasks and 4,993 hidden cases. Verifiers could reject valid alternatives, including accepting no tested solution. | P3: measure acceptance and rejection quality; do not equate strictness with accuracy |
| [Snapshot testing, 2026-10-21](https://arxiv.org/abs/2610.29549v1) | 340 repositories and 60 practitioners; combined suites had 86.7% median statement coverage and detected 1.3 times as many mutants as traditional-only suites. | Adapt DOM/component snapshots alongside behavior tests and separate visual captures; no guaranteed Angular coverage gain |
| [DynaCI, 2026-10-21](https://arxiv.org/abs/2610.29890v1) | Runtime-informed CI generation evaluated on 50 Python projects; 56% of generated workflows had no missing functionality. | Experiment with discovery of real commands/configurations. Generated YAML still needs independent validation and permission review |

## Fixed pilot and acceptance

Use a fixed, versioned set of real Angular migrations spanning legacy and modern projects, libraries/host/MFEs, and known failure cases. Compare the same commits/fixtures/toolchains with and without each proposed improvement; preserve held-out cases and record unavailable evidence.

Measure detected and missed regressions, valid-alternative acceptance, manual interventions, elapsed time per hop, build executions and model calls/cost. Normalize by the migration case; an adoption metric or more agents does not establish reliability.

Prioritize P1 Consumer Impact evidence, P2 verified repairs, then P3 gate-quality calibration. Do not add specialist agents to substitute for those missing controls. Each implementation needs a separate bounded change and measured acceptance; the priority order is a project decision, not a ranking proven by the papers.

## Evidence flow

Inventory → dependency graph → compatibility → verified-repair lookup (if available) → authorized hop → build → consumer impact → contracts → unit/E2E → visual → independent acceptance → evidence store.

Treat this as a logical evidence sequence, not new executable CLI commands. Record run ID, commit/artifact/fixture hashes, responsible owner, command, exit status, elapsed time and report path per applicable gate. Keep secrets out of evidence; preserve unresolved blockers and rollback points.

# Skill Lab Review Remediation Design

## Scope

Fix confirmed PR #33 review defects in Skill Lab workflows, promotion gates, evaluation evidence, security validation, and documentation. Preserve benchmark fixture semantics.

## Decisions

- Static CI installs the local Skill Lab bridge, including its declared `skillopt` dependency, before running Skill Lab tests.
- Both promotion aggregates and repository-gate evidence must carry the active candidate hash. Gate evidence rejects missing or mismatched hashes.
- Promotion packets require an accepted gate report and matching candidate hash. Their canonical patch is generated from the manifest target skill after verifying its recorded hash.
- Repeated validation compares each baseline run with its matching candidate run. `winningRuns` counts only independently regression-free comparisons.
- Deterministic evaluation loads the benchmark rubric and emits named soft dimensions. Aggregation uses that rubric's weights.
- Candidate security uses the same content checks as repository security scanning, including merge markers, Unicode controls, remote-shell pipelines, private keys, credential-shaped tokens, and broad tool permissions.
- Benchmark target paths resolve beneath the repository `skills/` source catalog before use.
- The SkillOpt EnvAdapter rollout calls SkillOpt's `chat_target` with the current candidate skill as system content and benchmark request as user content. Deterministic checks score that model response.
- Documentation exports Bash environment variables, passes provider credentials explicitly in the optimize workflow, and collects repository, agentic, test, and adversarial evidence before final gate evaluation.

## Fixture Vulnerabilities

`skill-lab/benchmarks/**/fixtures/**/package.json` files are benchmark inputs, not shipped dependencies. Their legacy Angular versions remain required test data. Configure Socket to exclude only this fixture subtree, after confirming supported Socket configuration syntax; do not upgrade fixture versions and invalidate benchmark meaning.

## Validation

- Add regression tests for every corrected gate, path, repeated-run, rubric, bridge, and promotion behavior.
- Reproduce static workflow dependencies in a clean Python environment.
- Run `npm run skill-lab:ci`, `npm run release:validate`, and focused bridge tests.
- Confirm candidate security rejects every repository scanner pattern.

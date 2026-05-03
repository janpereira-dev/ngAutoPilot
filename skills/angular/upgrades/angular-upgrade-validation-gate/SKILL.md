---
id: angular.upgrade.angular-upgrade-validation-gate
name: Angular Upgrade Validation Gate
description: >
  Validates each Angular major hop with repository-specific build, test, and lint checks before allowing the next upgrade step.
stack:
  - Angular
  - TypeScript
  - RxJS
category: upgrades
status: draft
version: 0.3.0
owner: NgAutoPilot
triggers:
  - upgrade validation
  - validation gate
  - build test lint
  - hop approval
compatibility:
  angular:
    min: "2"
    max: "21"
---

# Angular Upgrade Validation Gate

## Purpose

Use this skill to validate a single Angular upgrade hop and decide whether the next hop may proceed.

This skill does not plan hops or change code. It checks the repository using the commands that actually exist and reports whether the hop is safe to continue.

## When to Use This Skill

Use this skill when:

- A hop has just been executed.
- You need to confirm the repository still builds and tests after the hop.
- The route planner or hop executor asks for a gate before continuing.
- Validation must block the next major upgrade if it fails.
- The hop crosses the Angular 5 -> 6 boundary and workspace or RxJS model changes are in play.

## When Not to Use This Skill

Do not use this skill when:

- No upgrade hop has been applied yet.
- The task is only version detection or route planning.
- The repository has no available validation commands.
- The user wants code changes instead of a gate decision.

## Inputs Expected

- Current hop result
- `package.json`
- Available build/test/lint scripts
- Failure logs if a command already failed
- Rollback expectations

## Compatibility by Version

| Angular hop    | Strategy recommended                                          | Observations                                  |
| -------------- | ------------------------------------------------------------- | --------------------------------------------- |
| Any major hop  | Validate immediately after the hop                            | Do not batch multiple hops before validation. |
| Angular 2+     | Use the repository's actual build/test/lint commands          | Do not invent commands.                       |
| Angular 17+    | Include any modern checks the repository already supports     | Verify they exist before using them.          |
| Angular 5 -> 6 | Treat CLI workspace and RxJS bridge status as gate conditions | Fail closed if either is incomplete.          |

If a version cannot be confirmed from the project files, mark it as `verify in project`.

## Procedure

1. Read `package.json`.
2. Identify available validation scripts.
3. Run build, test, and lint only if they exist.
4. Record failures with their likely cause.
5. Decide whether the next hop may proceed.
6. Stop if the gate fails.

## Do

- Validate immediately after each bounded hop.
- Block the next hop when validation fails.
- Report the exact command outcome.
- Prefer repository scripts over ad hoc commands.
- Keep the gate decision explicit.
- For Angular 5 -> 6, include CLI workspace and RxJS bridge results in the gate decision.

## Recommended Patterns

Use a simple gate output:

| Command | Result    | Notes                        |
| ------- | --------- | ---------------------------- |
| build   | pass/fail | include first failure if any |
| test    | pass/fail | include failing suite if any |
| lint    | pass/fail | include file or rule if any  |

Gate decision:

```txt
PASS -> next hop may proceed
FAIL -> stop and fix before continuing
```

## Anti-Patterns

- Continuing to the next hop after a failed build.
- Inventing validation commands that do not exist.
- Treating one passing command as proof that the hop is safe.
- Ignoring warnings that indicate a real compatibility problem.
- Folding validation into route planning.

## Do Not

- Do not change code.
- Do not change dependencies.
- Do not select the next hop.
- Do not run commands that are not present in `package.json`.
- Do not claim the gate passed without actual command output.

## Review Checklist

- [ ] `package.json` was read.
- [ ] Available validation scripts were identified.
- [ ] build/test/lint were run only if they existed.
- [ ] Failures were recorded accurately.
- [ ] The next hop was explicitly allowed or blocked.
- [ ] No code was changed.
- [ ] If the hop is Angular 5 -> 6, CLI workspace and RxJS bridge status were checked.

## Validation Minimum

Prefer the actual repository scripts in this order when they exist:

- build
- test
- lint

If a script does not exist, skip it and report that it was unavailable.

## Risks

- A green build does not guarantee the upgrade is semantically correct.
- A missing lint or test script can reduce confidence in the gate.
- Some compatibility issues appear only in later hops.

## Expected Output

When this skill is used, return:

1. Commands discovered in `package.json`.
2. Commands run and results.
3. Failures and likely causes.
4. Gate decision.
5. Whether the next hop may proceed.

## Exit Criteria

This skill is complete only when:

- Validation commands were checked from the repository.
- The hop is either passed or blocked.
- The next hop decision is explicit.

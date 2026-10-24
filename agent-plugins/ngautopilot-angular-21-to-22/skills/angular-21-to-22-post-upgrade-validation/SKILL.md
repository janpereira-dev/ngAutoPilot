---
name: angular-21-to-22-post-upgrade-validation
description: "Validate the Angular 22 hop after migration and before follow-up modernization. For Angular 22 projects and 21-to-22 upgrade planning."
license: MIT
metadata:
  ngautopilot-id: "angular.upgrades.21-to-22.angular-21-to-22-post-upgrade-validation-gate"
  ngautopilot-source: "skills/angular/upgrades/21-to-22/angular-21-to-22-post-upgrade-validation-gate/SKILL.md"
  ngautopilot-version: "0.10.0"
---


# Angular 21 to 22 Post Upgrade Validation Gate

## Purpose

Validate the Angular 22 hop after migration and before follow-up modernization. This gate is read-only with respect to application source, dependencies and repository configuration.

Keep the work concern-first: this skill handles one risk area and does not replace the Angular 21 to 22 hop orchestrator.

## When to Use

- The project is confirmed on Angular 21.x and the target is Angular 22.x.
- The team needs a bounded upgrade hop with explicit preflight, migration, gates, and validation.
- The work must stay major-hop-only and block on failed validation.

## Do Not Use When

- The project version is unknown and the compatibility router has not run.
- The task is unrelated to this risk area.
- The user only needs a general Angular explanation.

## Why This Matters

Angular 22 changes hop 21 to 22 behavior enough that agents need a narrow checklist instead of a generic v22 bucket. The goal is to make the risk visible, testable, and reviewable.

## Inputs Expected

- package.json
- lockfile
- Angular version evidence
- angular.json or workspace config
- tsconfig files
- available build/test/lint scripts

## Version Scope

Angular 21.x and later where this Angular 22 behavior is relevant.

## Angular 22.2 evidence and procedure

If the actual target is 22.2, record that minor and selected patch. Check the feature-index 22.2 reference and run affected router disposal, template strictness, native Sass/watch, SSR/service-worker and runner compatibility checks. Report each as PASS, FAIL or SKIPPED with a reason. A 22.0 build does not prove 22.2 behavior.

For an existing 22.0/22.1 application, perform a bounded minor update, not another 21-to-22 major hop. Preserve existing runner and architecture choices; adopt developer-preview @boundary/router resources only in a separately scoped task.

## Connected ecosystem acceptance

For shared libraries/host/MFEs, apply `angular.upgrade.angular-upgrade-validation-gate` after each affected node group. Require exact rebuilt-artifact consumer validation and applicable API/BFF, Jest/unit, E2E, visual and security evidence; failed upstream libraries block host/MFE advancement. Missing required evidence returns BLOCKED even when build and Jest are green.

Use the main upgrade orchestrator's ecosystem reference for consumer-impact procedure, repair-rule evidence and verifier calibration. These are procedural requirements and proposed pilot contracts, not newly implemented automatic execution.

Overall decision precedence: any executed failing authorized check yields FAIL; otherwise missing or unsafe required evidence yields BLOCKED; only all applicable checks passing yields PASS. Preserve every per-check outcome even when the overall state is FAIL.

## Procedure

1. Inspect the completed hop result, baseline, target minor/patch, changed files and exact library artifacts without modifying them.
2. Confirm Node, TypeScript, RxJS, Angular CLI, Material/CDK, builder and runner compatibility from recorded and official evidence.
3. Discover existing validation scripts and inspect their bodies, delegated commands and lifecycle hooks for safe execution.
4. Run only authorized, scoped validation and gather the required consumer, contract, unit/E2E, visual and security results.
5. Route discovered defects to the relevant executor/satellite; do not apply migrations or change dependencies in this gate.
6. Return FAIL for executed failing checks and BLOCKED for required missing/unsafe evidence. Record genuinely non-applicable checks separately with reasons.
7. Allow advancement only on PASS; preserve failures, warnings and rollback/checkpoint evidence.

## Do

- Verify Angular version and feature status before changing code.
- Report the smallest targeted remediation for an authorized executor; do not apply it in this gate.
- Keep upgrade, modernization, testing, and education responsibilities separate.
- Capture commands, warnings, and unresolved risks in the final report.

## Do Not

- Do not modify source, dependencies or configuration, or execute the upgrade itself.

- Do not invent APIs, versions, commands, or dependency requirements.
- Do not treat roadmap or experimental APIs as stable unless official Angular sources say so.
- Do not hide failed validation or convert blockers into vague follow-ups.
- Do not broaden this satellite into a cross-domain refactor.

## Validation Checklist

- Run only validation commands that exist in the target repository.
- Run TypeScript/template compilation or production build when the change affects Angular code.
- Run unit tests for affected behavior when a test script exists.
- Run lint if the repository exposes a lint script.

## Review Checklist

- [ ] Version evidence is recorded.
- [ ] Official Angular source or repo-local source was checked for the claim.
- [ ] Validation stayed within this gate’s read-only scope.
- [ ] Adjacent risks are routed to separate skills.
- [ ] Overall outcome is PASS, FAIL or BLOCKED. A required skipped check cannot pass; non-applicable checks have recorded reasons.

## Exit Criteria

- The risk is resolved, explicitly not applicable, or blocked with evidence.
- The change is narrow enough for a focused review.
- Validation results are documented.

## Risks and Failure Modes

- Using a v22 API without verifying project compatibility.
- Turning a targeted satellite into a broad refactor.
- Missing runtime-only behavior when compile checks pass.

## Examples

- Use this skill to review `post upgrade validation` in an Angular 22 migration.
- Do not use it to perform the entire 21-to-22 dependency hop.

## Expected Output

1. A short summary of the inspected risk.
2. Files or configuration areas reviewed.
3. Read-only findings and remediation handoff; no source/dependency changes.
4. Validation commands and results.
5. Remaining risks or follow-up skills, if any.

## References

- Angular v22 announcement: https://blog.angular.dev/announcing-angular-v22-c52bb83a4664
- Angular roadmap: https://angular.dev/roadmap
- Angular changelog: https://github.com/angular/angular/blob/main/CHANGELOG.md
- NgAutoPilot versioning gates: skills/angular/versioning/angular-version-gates/SKILL.md

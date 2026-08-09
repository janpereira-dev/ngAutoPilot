---
id: angular.upgrades.21-to-22.angular-21-to-22-breaking-changes-gate
name: Angular 21 to 22 Breaking Changes Gate
description: >
  Use this skill for Gate Angular 22 compiler, core, forms, HTTP, router, platform-server, and upgrade breaking changes. Use when Angular 22 work needs concern-first routing, explicit validation, and no invented APIs.
stack:
  - Angular
  - TypeScript
category: upgrade
status: stable
version: 0.6.0
owner: NgAutoPilot
triggers:
  - Angular 22 breaking changes
  - v22 gate
  - breaking changes gate
  - Angular 21 to 22 Breaking Changes Gate
  - Hop 21 to 22
  - Angular 22
compatibility:
  angular:
    min: "21"
---

# Angular 21 to 22 Breaking Changes Gate

## Purpose

Gate Angular 22 compiler, core, forms, HTTP, router, platform-server, and upgrade breaking changes.

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

## Non-developer explanation

This skill helps separate a real upgrade risk from general cleanup. It gives the team a clear reason for the work, the evidence to check, and the point where the change is safe to stop.

## Inputs Expected

- package.json
- lockfile
- Angular version evidence
- angular.json or workspace config
- tsconfig files
- available build/test/lint scripts

## Version Scope

Angular 21.x and later where this Angular 22 behavior is relevant.

## Procedure

1. Run the preflight inventory before changing dependencies.
2. Confirm Node, TypeScript, RxJS, Angular CLI, Material/CDK, and builder compatibility from official sources.
3. Run the official Angular 22 update path with the project package manager.
4. Apply only migrations and fixes required for the hop.
5. Route specific risks to v22 satellite skills by domain.
6. Run the post-upgrade validation gate and stop on blockers.

## Do

- Verify Angular version and feature status before changing code.
- Prefer the smallest reversible change that resolves this specific risk.
- Keep upgrade, modernization, testing, and education responsibilities separate.
- Capture commands, warnings, and unresolved risks in the final report.

## Do Not

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
- [ ] The selected change is scoped to this skill.
- [ ] Adjacent risks are routed to separate skills.
- [ ] Validation outcome is PASS, FAIL, or SKIPPED with reason.

## Exit Criteria

- The risk is resolved, explicitly not applicable, or blocked with evidence.
- The change is narrow enough for a focused review.
- Validation results are documented.

## Risks and Failure Modes

- Using a v22 API without verifying project compatibility.
- Turning a targeted satellite into a broad refactor.
- Missing runtime-only behavior when compile checks pass.

## Examples

- Use this skill to review `Angular 22 breaking changes` in an Angular 22 migration.
- Do not use it to perform the entire 21-to-22 dependency hop.

## Expected Output

1. A short summary of the inspected risk.
2. Files or configuration areas reviewed.
3. Changes made or a clear no-change decision.
4. Validation commands and results.
5. Remaining risks or follow-up skills, if any.

## References

- Angular v22 announcement: https://blog.angular.dev/announcing-angular-v22-c52bb83a4664
- Angular roadmap: https://angular.dev/roadmap
- Angular changelog: https://github.com/angular/angular/blob/main/CHANGELOG.md
- NgAutoPilot versioning gates: skills/angular/versioning/angular-version-gates/SKILL.md

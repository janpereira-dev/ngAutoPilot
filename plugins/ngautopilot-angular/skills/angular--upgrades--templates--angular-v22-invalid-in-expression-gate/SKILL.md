---
id: angular.upgrades.templates.angular-v22-invalid-in-expression-gate
name: Angular v22 Invalid In Expression Gate
description: >
  Use this skill for Migrate invalid template expressions that misuse the in operator. Use when Angular 22 work needs concern-first routing, explicit validation, and no invented APIs.
stack:
  - Angular
  - TypeScript
category: templates
status: stable
version: 0.6.0
owner: NgAutoPilot
triggers:
  - in expression
  - template diagnostics
  - compiler
  - Angular v22 Invalid In Expression Gate
  - Templates / Compiler
  - Angular 22
compatibility:
  angular:
    min: "22"
---

# Angular v22 Invalid In Expression Gate

## Purpose

Migrate invalid template expressions that misuse the in operator.

Keep the work concern-first: this skill handles one risk area and does not replace the Angular 21 to 22 hop orchestrator.

## When to Use

- The task specifically involves migrate invalid template expressions that misuse the in operator.
- The project is on Angular 22 or planning the Angular 22 hop.
- A narrower concern-first skill is better than a generic v22 baseline skill.

## Do Not Use When

- The project version is unknown and the compatibility router has not run.
- The task is unrelated to this risk area.
- The user only needs a general Angular explanation.

## Why This Matters

Angular 22 changes templates / compiler behavior enough that agents need a narrow checklist instead of a generic v22 bucket. The goal is to make the risk visible, testable, and reviewable.

## Non-developer explanation

This skill helps separate a real upgrade risk from general cleanup. It gives the team a clear reason for the work, the evidence to check, and the point where the change is safe to stop.

## Inputs Expected

- package.json
- lockfile
- Angular version evidence
- angular.json or workspace config
- tsconfig files
- available build/test/lint scripts
- templates
- strictTemplates settings
- component inputs/outputs/models
- compiler diagnostics

## Version Scope

Angular 22.x and later where this Angular 22 behavior is relevant.

## Procedure

1. Inspect the inputs and confirm the risk is present.
2. Read the exact Angular 22 documentation or changelog entry before making API claims.
3. Make the smallest targeted change or produce a concrete audit result.
4. Route adjacent concerns to their own satellite instead of expanding scope.
5. Record validation commands and unresolved follow-ups.

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

- Use this skill to review `in expression` in an Angular 22 migration.
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

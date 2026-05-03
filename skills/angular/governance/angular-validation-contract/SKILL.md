---
id: angular.governance.angular-validation-contract
name: Angular Validation Contract
description: Define the minimum validation contract for a change, such as build, unit tests, lint, e2e, bundle, or SSR validation.
stack:
  - Angular
category: governance
status: stable
version: 0.3.1
owner: NgAutoPilot
triggers:
  - validation contract
  - build test lint
  - gate
---

# Angular Validation Contract

Use this skill to define the smallest validation set that proves the change is safe.

## Expected Output

Return:

1. A concise diagnosis.
2. The minimal safe change or decision.
3. Validation steps.
4. Risks or rollback notes.

## Purpose

Describe the exact problem this skill solves.

## When to Use

Use this skill when this specific Angular workflow is needed.

## Do

- Apply the smallest safe change.
- Keep the workflow focused.

## Do Not

- Do not mix unrelated concerns.
- Do not expand the scope without need.

## Review Checklist

- [ ] The change is scoped correctly.
- [ ] The risk surface is understood.
- [ ] Validation is clear.

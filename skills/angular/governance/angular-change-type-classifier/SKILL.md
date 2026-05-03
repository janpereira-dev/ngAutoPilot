---
id: angular.governance.angular-change-type-classifier
name: Angular Change Type Classifier
description: Classify the change as bugfix, refactor, upgrade, modernization, performance, testing, security, or architecture before touching code.
stack:
  - Angular
category: governance
status: stable
version: 0.3.1
owner: NgAutoPilot
triggers:
  - change type
  - classify change
  - risk level
---

# Angular Change Type Classifier

Use this skill to keep upgrade work, refactors, and modernization separate.

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

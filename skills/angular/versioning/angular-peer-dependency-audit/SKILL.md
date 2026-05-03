---
id: angular.versioning.angular-peer-dependency-audit
name: Angular Peer Dependency Audit
description: Audit Angular peer dependencies and transitive blockers before applying an upgrade or refactor.
stack:
  - Angular
category: versioning
status: stable
version: 0.3.1
owner: NgAutoPilot
triggers:
  - peer dependency audit
  - peer deps
  - compatibility audit
---

# Angular Peer Dependency Audit

Use this skill to detect third-party libraries that block an Angular change.

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

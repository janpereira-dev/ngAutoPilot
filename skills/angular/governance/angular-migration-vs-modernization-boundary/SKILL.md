---
id: angular.governance.angular-migration-vs-modernization-boundary
name: Angular Migration Vs Modernization Boundary
description: Prevent mixing version migrations with modernization work in the same change unless explicitly requested.
stack:
  - Angular
category: governance
status: stable
version: 0.1.0
owner: NgAutoPilot
triggers:
  - migration vs modernization
  - upgrade boundary
  - separate concerns
---

# Angular Migration Vs Modernization Boundary

Use this skill to keep upgrade hops and post-upgrade modernization separate.


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

---
id: angular.migration.angularjs-strategy-selector
name: AngularJS Strategy Selector
description: Select the safest AngularJS-to-Angular migration strategy based on app shape, risk, and rollback constraints.
stack:
  - AngularJS
  - Angular
category: migration
status: stable
version: 0.1.0
owner: NgAutoPilot
triggers:
  - strategy selector
  - migration strategy
  - legacy migration
---

# AngularJS Strategy Selector

Use this skill to decide the migration path before any code change.


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

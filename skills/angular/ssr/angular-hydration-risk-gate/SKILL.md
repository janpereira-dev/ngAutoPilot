---
id: angular.ssr.angular-hydration-risk-gate
name: Angular Hydration Risk Gate
description: Detect hydration blockers, DOM mismatches, and server/client divergence before enabling hydration changes.
stack:
  - Angular
category: ssr
status: stable
version: 0.1.0
owner: NgAutoPilot
triggers:
  - hydration risk
  - hydration gate
  - ssr hydration
---

# Angular Hydration Risk Gate

Use this skill to gate hydration changes with a bounded risk check.


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

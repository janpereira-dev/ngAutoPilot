---
id: angular.ssr.angular-ssr-browser-api-safety
name: Angular SSR Browser API Safety
description: Keep browser-only APIs out of SSR execution paths and provide safe server-side guards or abstractions.
stack:
  - Angular
category: ssr
status: stable
version: 0.1.0
owner: NgAutoPilot
triggers:
  - browser api safety
  - ssr browser safety
  - window document
---

# Angular SSR Browser API Safety

Use this skill when code may run on both server and browser.


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

---
id: angular.ssr.angular-ssr-readiness-audit
name: Angular SSR Readiness Audit
description: Audit Angular applications for SSR readiness, browser API usage, hydration blockers, and server/client split risks.
stack:
  - Angular
category: ssr
status: stable
version: 0.3.0
owner: NgAutoPilot
triggers:
  - ssr readiness
  - ssr audit
  - server rendering readiness
---

# Angular SSR Readiness Audit

Use this skill before turning on SSR or hydration-sensitive features.

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

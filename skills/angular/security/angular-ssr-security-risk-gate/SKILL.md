---
id: angular.security.angular-ssr-security-risk-gate
name: Angular SSR Security Risk Gate
description: Gate SSR changes with host validation, proxy trust, and server-side security boundaries.
stack:
  - Angular
category: security
status: stable
version: 0.3.1
owner: NgAutoPilot
triggers:
  - ssr security
  - security risk gate
  - server rendering security
---

# Angular SSR Security Risk Gate

Use this skill before shipping SSR changes that may change host or request handling.

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

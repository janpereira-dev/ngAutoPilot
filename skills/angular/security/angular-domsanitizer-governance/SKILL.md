---
id: angular.security.angular-domsanitizer-governance
name: Angular DomSanitizer Governance
description: Govern DomSanitizer usage so bypasses are explicit, justified, and reviewed.
stack:
  - Angular
category: security
status: stable
version: 0.1.0
owner: NgAutoPilot
triggers:
  - domsanitizer
  - sanitization
  - security governance
---

# Angular DomSanitizer Governance

Use this skill when a feature needs trusted HTML, resource URLs, or sanitization decisions.


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

---
id: angular.templates.angular-extended-diagnostics-governance
name: Angular Extended Diagnostics Governance
description: Govern Angular extended diagnostics and decide which warnings need remediation, suppression, or a deliberate bridge.
stack:
  - Angular
category: templates
status: stable
version: 0.1.0
owner: NgAutoPilot
triggers:
  - extended diagnostics
  - template diagnostics
  - ng810x
---

# Angular Extended Diagnostics Governance

Use this skill to manage Angular compiler diagnostics with intent.


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

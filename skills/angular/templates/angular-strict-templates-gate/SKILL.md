---
id: angular.templates.angular-strict-templates-gate
name: Angular Strict Templates Gate
description: Verify strictTemplates and template type checking before applying Angular template-sensitive changes.
stack:
  - Angular
category: templates
status: stable
version: 0.1.0
owner: NgAutoPilot
triggers:
  - strict templates
  - template gate
  - template validation
---

# Angular Strict Templates Gate

Use this skill to make sure template type checking is enabled and trusted.


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

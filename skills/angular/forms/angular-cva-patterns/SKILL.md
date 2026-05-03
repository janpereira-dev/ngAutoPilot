---
id: angular.forms.angular-cva-patterns
name: Angular CVA Patterns
description: Design ControlValueAccessor implementations with clear boundaries, typed contracts, and minimal side effects.
stack:
  - Angular
category: forms
status: stable
version: 0.3.0
owner: NgAutoPilot
triggers:
  - cva
  - control value accessor
  - forms
---

# Angular CVA Patterns

Use this skill when a custom form control needs a safe CVA contract.

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

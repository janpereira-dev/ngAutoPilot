---
id: angular.upgrade.forms.angular-ngmodel-template-write-cleanup-v18
name: Angular ngModel Template Write Cleanup v18
description: >
  Remove template write expressions from Angular forms that use [(ngModel)] after an Angular 18 upgrade. Use when templates assign to properties inside two-way bindings or otherwise combine writes with ngModel expressions.
stack:
  - Angular
  - TypeScript
category: forms
status: stable
version: 0.5.1
owner: NgAutoPilot
triggers:
  - ngModel cleanup
  - template write expressions
  - template-driven forms
compatibility:
  angular:
    min: "18"
---

# Angular ngModel Template Write Cleanup v18

## Purpose

Remove template write expressions from Angular forms that use `[(ngModel)]`.

## When to Use

- Templates write to properties inside `[(ngModel)]`.
- Template-driven forms are used.
- The app is stable on Angular 18.

## When Not to Use

- The templates do not use write expressions.
- The app is still in a version upgrade.

## Required Inputs

- templates using `[(ngModel)]`
- template-driven forms
- tests for the target slice

## Procedure

1. Find write expressions in `[(ngModel)]`.
2. Move writes into component handlers.
3. Keep two-way binding readable.
4. Validate forms and tests.

## Do

- Keep business logic in the component.
- Make template bindings side-effect free.
- Validate form behavior.

## Do Not

- Do not leave write expressions in templates.
- Do not mix this with the version upgrade.

## Review Checklist

- [ ] Write expressions are removed.
- [ ] Form behavior is preserved.
- [ ] Tests pass.

## Expected Output

1. Template cleanup summary.
2. Handler updates.
3. Test result.

## Exit Criteria

- Template write cleanup is complete.

---
id: angular.upgrades.material.angular-material-mdc-v15-form-controls
name: Angular Material MDC v15 Form Controls
description: >
  Migrates Angular Material v15 form controls including form-field, input, select, checkbox, radio, slide-toggle, and autocomplete with validation and layout review.
stack:
  - Angular
  - TypeScript
category: material
status: draft
version: 0.3.1
owner: NgAutoPilot
triggers:
  - Material form controls
  - form-field migration
  - checkbox migration
  - radio migration
compatibility:
  angular:
    min: "15"
---

# Angular Material MDC v15 Form Controls

## Purpose

Use this skill to migrate Angular Material form controls to the MDC-based implementations.

## When to Use

- The project uses form-field, input, select, checkbox, radio, slide-toggle, or autocomplete.
- The project has dense business forms.
- The project has custom form-field wrappers.

## When Not to Use

- The project does not use Material form controls.
- The task is only theming or typography.

## Required Inputs

- Forms screens
- Material wrappers
- CSS overrides
- Validation flows
- Harness tests

## Procedure

1. Inventory form control usage.
2. Migrate one form-family slice at a time.
3. Update wrappers and templates.
4. Validate forms and visuals.

## Do

- Review form-field appearance, prefixes/suffixes, labels, hints, and errors.
- Validate selection and checkbox/radio behavior.
- Check layout and density.

## Do Not

- Do not migrate all form controls blindly.
- Do not drop custom wrappers without validation.

## Review Checklist

- [ ] Form controls compile.
- [ ] Validation behavior is intact.
- [ ] Layout is acceptable.
- [ ] Harness/tests pass.

## Expected Output

1. Form control migration summary.
2. Wrapper updates.
3. Validation result.
4. Remaining risk list.

## Exit Criteria

- Form controls are validated.
- Remaining risk is documented.

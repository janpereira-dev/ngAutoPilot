---
id: angular.upgrades.material.angular-material-v14-stepper-selectionlist-chips-cleanup
name: Angular Material v14 Stepper SelectionList Chips Cleanup
description: >
  Review Angular Material v14 changes affecting stepper, selection list, and chips usage. Use when legacy API and styling assumptions need cleanup before or during an Angular 14 upgrade.
stack:
  - Angular
  - TypeScript
category: material
status: draft
version: 0.1.0
owner: NgAutoPilot
triggers:
  - Material v14
  - stepper cleanup
  - selection list cleanup
  - chips cleanup
compatibility:
  angular:
    min: "14"
---

# Angular Material v14 Stepper SelectionList Chips Cleanup

## Purpose

Clean up Material stepper, selection list, and chips usage for v14.

## When to Use

- The app uses stepper, selection list, or chips.
- Material migration risk exists.

## When Not to Use

- Those Material components are not used.
- No Material cleanup is needed.

## Required Inputs

- Material templates
- theme styles
- tests

## Procedure

1. Inventory affected Material controls.
2. Update templates and styles.
3. Validate interaction and visuals.

## Do

- Keep component behavior explicit.
- Validate visual and interaction changes.

## Do Not

- Do not ignore component-specific regressions.

## Review Checklist

- [ ] Stepper usage reviewed.
- [ ] Selection list usage reviewed.
- [ ] Chips usage reviewed.
- [ ] Tests pass.

## Expected Output

1. Material cleanup summary.
2. Validation result.

## Exit Criteria

- Affected Material usage is compatible.

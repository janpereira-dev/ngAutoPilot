---
id: angular.upgrade.material.angular-material-mdc-v15-migration
name: Angular Material MDC v15 Migration
description: >
  Migrates Angular Material applications to the MDC-based v15 component set with visual validation, harness updates, and CSS override review.
stack:
  - Angular
  - TypeScript
category: material
status: draft
version: 0.1.0
owner: NgAutoPilot
triggers:
  - Angular Material v15
  - MDC migration
  - Material visual regression
  - harness migration
compatibility:
  angular:
    min: "15"
---

# Angular Material MDC v15 Migration

## Purpose

Use this skill to migrate Angular Material applications to the MDC-based v15 component set.

This skill focuses on Material API, DOM, CSS, harness, and visual changes. It does not upgrade Angular core by itself.

## When to Use

Use this skill when:

- Angular Material is used.
- The project is on Angular 15 or is being upgraded to Angular 15.
- Material components show visual or API changes.
- Harness tests or screenshot tests need review.

## When Not to Use

Do not use this skill when:

- Angular Material is not used.
- The project is not on Angular 15.
- The task is only a generic CSS cleanup.

## Inputs Expected

- Material component inventory
- Angular Material version
- Angular CDK version
- CSS overrides
- Harness tests
- Screenshot/golden tests

## Compatibility by Version

| Angular Material | Strategy recommended | Observations |
|---|---|---|
| v15 MDC | Migrate component by component | Visual regression review is required. |
| Legacy Material overrides | Review or remove old class selectors | DOM structure changes may break CSS. |

## Procedure

1. Inventory Material components in use.
2. Detect CSS overrides and harness tests.
3. Migrate components to MDC equivalents.
4. Update harness tests and selectors.
5. Review screenshots and critical layouts.

## Do

- Review form-field, button, checkbox, radio, select, dialog, menu, tabs, table, datepicker, stepper, chips, and list components.
- Update CSS selectors and density assumptions carefully.
- Validate screenshots or visual smoke tests.
- Prefer the orchestrator plus focused subskills over a full-app rewrite.
- Keep legacy bridge imports until a slice is validated.

## Do Not

- Do not migrate all Material components blindly.
- Do not keep brittle DOM/CSS overrides without review.
- Do not update harness tests without checking rendered behavior.
- Do not mix MDC migration with standalone adoption or unrelated refactors.
- Do not close on compile success alone.

## Review Checklist

- [ ] Material inventory is complete.
- [ ] MDC migrations are bounded.
- [ ] Harness changes are updated.
- [ ] Visual validation passed or is documented.
- [ ] Remaining CSS overrides are reviewed.

## Expected Output

1. Material inventory.
2. MDC migrations applied.
3. Harness changes.
4. Visual validation results.

## Exit Criteria

- The bounded slice is migrated.
- Harness and visual review are complete.
- Remaining MDC debt is documented.

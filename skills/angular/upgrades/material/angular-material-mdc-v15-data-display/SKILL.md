---
id: angular.upgrades.material.angular-material-mdc-v15-data-display
name: Angular Material MDC v15 Data Display
description: >
  Migrates Angular Material table, list, card, paginator, and progress components where layout and structure changes can affect business screens.
stack:
  - Angular
  - TypeScript
category: material
status: draft
version: 0.3.0
owner: NgAutoPilot
triggers:
  - Material table
  - Material list
  - Material card
  - Material paginator
compatibility:
  angular:
    min: "15"
---

# Angular Material MDC v15 Data Display

## Purpose

Use this skill to review data display components during Material MDC migration.

## When to Use

- The project uses table, list, card, paginator, or progress components.
- The project has dense data-heavy screens.
- The project has style overrides for row, cell, or card layout.

## When Not to Use

- The project does not use data display components.
- The task is only form controls or overlays.

## Required Inputs

- Data display component templates
- CSS overrides
- Harness tests
- Screenshot tests

## Procedure

1. Inventory data display usage.
2. Migrate one bounded slice.
3. Update templates and styles.
4. Validate data-heavy screens.

## Do

- Review table row layout, list item structure, and paginator controls.
- Validate progress indicators and cards in dense layouts.

## Do Not

- Do not change table/list structure without visual review.
- Do not rely on legacy internal CSS selectors.

## Review Checklist

- [ ] Data display components compile.
- [ ] Layout is acceptable.
- [ ] Tests pass.
- [ ] Visual validation passed.

## Expected Output

1. Data display migration summary.
2. Test result.
3. Visual validation result.
4. Remaining risk list.

## Exit Criteria

- Data display is validated.
- Remaining risk is documented.

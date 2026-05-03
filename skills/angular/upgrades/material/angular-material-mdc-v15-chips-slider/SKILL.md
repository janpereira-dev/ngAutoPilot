---
id: angular.upgrades.material.angular-material-mdc-v15-chips-slider
name: Angular Material MDC v15 Chips Slider
description: >
  Migrates Angular Material v15 chips and slider components, which have some of the largest API and template changes in the MDC rollout.
stack:
  - Angular
  - TypeScript
category: material
status: draft
version: 0.3.0
owner: NgAutoPilot
triggers:
  - Material chips migration
  - Material slider migration
  - MDC chips
  - MDC slider
compatibility:
  angular:
    min: "15"
---

# Angular Material MDC v15 Chips Slider

## Purpose

Use this skill to migrate Material chips and slider usage in a controlled slice.

## When to Use

- The project uses chips or slider.
- The project has custom chip templates or slider markup.
- The project has chip/slider related tests or screenshots.

## When Not to Use

- The project does not use chips or slider.
- The task is only a generic Material cleanup.

## Required Inputs

- Chip and slider templates
- CSS overrides
- Harness tests
- Screenshot/golden tests

## Procedure

1. Inventory all chip and slider usage.
2. Migrate one feature slice at a time.
3. Update templates, styles, and tests.
4. Validate visuals and interactions.

## Do

- Review chip set, chip grid, chip row, chip listbox, and slider thumb usage.
- Check keyboard and focus behavior.
- Validate screenshots.

## Do Not

- Do not migrate chips or slider without test coverage.
- Do not accept broken interaction states.

## Review Checklist

- [ ] Chips compile and behave correctly.
- [ ] Slider compile and behave correctly.
- [ ] Focus and keyboard interaction are intact.
- [ ] Visual validation passed.

## Expected Output

1. Chips migration summary.
2. Slider migration summary.
3. Test result.
4. Visual validation result.

## Exit Criteria

- Chips and slider are validated.
- Remaining risks are documented.

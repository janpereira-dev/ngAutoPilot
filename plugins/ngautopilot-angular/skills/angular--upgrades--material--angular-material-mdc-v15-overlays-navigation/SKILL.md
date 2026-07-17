---
id: angular.upgrades.material.angular-material-mdc-v15-overlays-navigation
name: Angular Material MDC v15 Overlays Navigation
description: >
  Migrates Angular Material dialogs, menus, snack-bars, tooltips, and tabs where overlay structure and navigation behavior can regress.
stack:
  - Angular
  - TypeScript
category: material
status: stable
version: 0.5.2
owner: NgAutoPilot
triggers:
  - Material dialogs
  - Material menus
  - Material snack-bars
  - Material tooltips
  - Material tabs
compatibility:
  angular:
    min: "15"
---

# Angular Material MDC v15 Overlays Navigation

## Purpose

Use this skill to review overlay and navigation-style Material components during MDC migration.

## When to Use

- The project uses dialog, menu, snack-bar, tooltip, or tabs.
- Overlay styling is customized.
- Navigation flows depend on Material overlays.

## When Not to Use

- The project does not use overlay or navigation Material components.
- The task is only data display or form controls.

## Required Inputs

- Overlay component templates
- CSS overrides
- Harness tests
- Screenshot tests

## Procedure

1. Inventory overlay and navigation components.
2. Migrate one feature slice at a time.
3. Review overlay styles and positioning.
4. Validate tests and screenshots.

## Do

- Review dialog layouts and focus behavior.
- Review menus, snack-bars, tooltips, and tab panels.
- Validate visual and keyboard interactions.

## Do Not

- Do not change overlay behavior without smoke tests.
- Do not keep brittle DOM selectors without review.

## Review Checklist

- [ ] Overlay components compile.
- [ ] Navigation behavior is intact.
- [ ] Focus and positioning are acceptable.
- [ ] Visual validation passed.

## Expected Output

1. Overlay migration summary.
2. Navigation migration summary.
3. Test result.
4. Visual validation result.

## Exit Criteria

- Overlay and navigation components are validated.
- Remaining risk is documented.

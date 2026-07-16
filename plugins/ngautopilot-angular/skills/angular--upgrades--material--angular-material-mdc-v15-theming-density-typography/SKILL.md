---
id: angular.upgrades.material.angular-material-mdc-v15-theming-density-typography
name: Angular Material MDC v15 Theming Density Typography
description: >
  Reviews Angular Material v15 theme, density, and typography changes, including custom styles, mixins, and MDC class name impacts.
stack:
  - Angular
  - TypeScript
category: material
status: stable
version: 0.5.1
owner: NgAutoPilot
triggers:
  - Material theming
  - Material density
  - Material typography
  - MDC classes
compatibility:
  angular:
    min: "15"
---

# Angular Material MDC v15 Theming Density Typography

## Purpose

Use this skill to review theme, density, and typography behavior during Angular Material v15 MDC migration.

## When to Use

- The project has custom Material themes.
- The project sets density or typography globally.
- The project uses `mat-typography` or custom theme mixins.
- The project relies on internal Material CSS class names.

## When Not to Use

- The project does not customize Material theming.
- The task is only a component API migration.

## Required Inputs

- Theme SCSS
- Global styles
- Material component styles
- `angular.json`
- Typography helpers
- Density configuration

## Procedure

1. Inspect theme entry points and mixins.
2. Review density and typography assumptions.
3. Update class selectors that rely on legacy DOM structure.
4. Validate screenshots or visual smoke tests for themed screens.

## Do

- Review `mat-typography`, density, and theme mixins.
- Review `mat-mdc-*` class impacts.
- Validate light and dark theme output if both are used.

## Do Not

- Do not change theme tokens blindly.
- Do not accept selector breakage without visual review.

## Review Checklist

- [ ] Theme compiles.
- [ ] Density assumptions are correct.
- [ ] Typography renders correctly.
- [ ] Selector overrides still apply.

## Expected Output

1. Theme risk summary.
2. Density impact summary.
3. Typography impact summary.
4. Visual validation result.

## Exit Criteria

- Theme, density, and typography are reviewed.
- Visual impact is documented.

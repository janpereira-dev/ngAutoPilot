---
id: angular.upgrades.material.angular-material-mdc-v15-inventory
name: Angular Material MDC v15 Inventory
description: >
  Detects Angular Material usage, legacy imports, custom CSS overrides, harness assumptions, and MDC migration hotspots before any component changes are made.
stack:
  - Angular
  - TypeScript
category: material
status: stable
version: 0.5.3
owner: NgAutoPilot
triggers:
  - Angular Material inventory
  - MDC inventory
  - legacy Material imports
  - Material CSS overrides
compatibility:
  angular:
    min: "15"
---

# Angular Material MDC v15 Inventory

## Purpose

Use this skill to inventory Angular Material usage before any MDC migration work starts.

## When to Use

- The project uses Angular Material.
- The project is being prepared for Material v15 MDC migration.
- The project has custom CSS overrides for Material internals.
- The project has harness tests or screenshot tests.

## When Not to Use

- The project does not use Angular Material.
- The migration slice is already selected and inventory is complete.
- The task is only a style polish.

## Required Inputs

- `package.json`
- Material imports
- Angular CDK version
- `angular.json`
- theme files
- global styles
- component styles
- harness tests
- screenshot/golden tests
- custom wrappers
- shared Material modules

## Procedure

1. Search for Material imports and legacy imports.
2. Search for pending MDC migration notes.
3. Inventory CSS overrides and internal selectors.
4. Inventory harness and DOM-based tests.
5. Group usage by risk and output a migration map.

## Do

- Identify the Material component families in use.
- Identify custom CSS targeting Material internals.
- Identify screenshot and visual regression coverage.
- Classify hotspots by risk.

## Do Not

- Do not change application code in this skill.
- Do not migrate components while inventorying them.
- Do not ignore legacy import paths.

## Review Checklist

- [ ] Material imports are listed.
- [ ] Legacy imports are listed.
- [ ] CSS override hotspots are listed.
- [ ] Harness and DOM-based tests are listed.
- [ ] Migration hotspots are ranked.

## Expected Output

1. Material inventory.
2. Legacy import list.
3. CSS override list.
4. Risk-ranked migration map.

## Exit Criteria

- Inventory is complete.
- Hotspots are ranked.
- The next migration slice is clear.

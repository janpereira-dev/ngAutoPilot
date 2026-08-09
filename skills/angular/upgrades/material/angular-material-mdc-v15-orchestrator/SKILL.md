---
id: angular.upgrades.material.angular-material-mdc-v15-orchestrator
name: Angular Material MDC v15 Orchestrator
description: >
  Coordinates the Angular Material v15 MDC migration by inventorying usage, selecting a safe migration strategy, delegating to focused Material skills, and enforcing visual and test validation before closing the migration.
stack:
  - Angular
  - TypeScript
category: material
status: stable
version: 0.6.0
owner: NgAutoPilot
triggers:
  - Angular Material v15
  - MDC migration
  - Material orchestrator
  - visual regression gate
compatibility:
  angular:
    min: "15"
---

# Angular Material MDC v15 Orchestrator

## Purpose

Use this skill to coordinate the Angular Material v15 MDC migration.

This skill does not blindly migrate every component. It inventories Material usage, classifies risk, selects the smallest safe MDC migration slice, delegates to focused Material MDC skills, and enforces visual and test validation before closing the migration.

## When to Use

- The project upgrades to Angular Material v15.
- The project has Angular Material components.
- The project imports from `@angular/material/*`.
- The project has custom CSS overrides for Material internals.
- The project has screenshot or visual smoke tests.

## When Not to Use

- The project does not use Angular Material.
- The task is only Angular core upgrade without Material.
- The task is only a visual redesign unrelated to MDC migration.

## Required Inputs

- `package.json`
- Angular Material version
- Angular CDK version
- Angular version
- `angular.json`
- global styles
- theme files
- SCSS partials
- component styles
- screenshot/golden test setup
- test framework
- Material harnesses
- Protractor/Cypress/Playwright usage
- legacy Material imports
- pending MDC migration notes
- custom CSS targeting Material internals
- custom Material wrappers
- shared Material modules
- design system wrappers
- component library packages

## Procedure

1. Run the inventory skill first.
2. Choose `legacy-bridge-first`, partial migration, or component-family migration.
3. Upgrade Angular Material to v15.
4. Delegate the affected slice to a focused Material MDC skill.
5. Resolve pending MDC migration notes in the touched slice.
6. Update tests and styles for that slice.
7. Run visual validation before closing the slice.
8. Stop and document remaining MDC debt.

## Strategy

Default to `legacy-bridge-first`.

Use partial or family-based migration when risk is isolated and tests are available.

## Do

- Inventory Material usage before migrating.
- Review theme, density, typography, and CSS overrides.
- Validate screenshot or visual smoke tests.
- Route chips and slider separately from form controls and overlays.
- Treat visual validation as mandatory for every slice.

## Do Not

- Do not migrate all Material components blindly.
- Do not keep brittle DOM/CSS overrides without review.
- Do not update harness tests without checking rendered behavior.
- Do not mix MDC migration with standalone adoption or other Angular modernization.
- Do not close the migration on compile success alone.

## Review Checklist

- [ ] Material inventory is complete.
- [ ] Migration strategy is explicit.
- [ ] Legacy bridge status is understood.
- [ ] Visual validation exists or is planned.
- [ ] Remaining MDC debt is documented.

## Expected Output

1. Material inventory.
2. Selected strategy.
3. Slice to migrate.
4. Visual validation result.

## Exit Criteria

- Inventory is complete.
- Migration strategy is explicit.
- The next slice is bounded.
- A focused subskill is selected.
- Visual validation is complete or explicitly blocked.

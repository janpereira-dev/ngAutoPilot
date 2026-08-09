---
id: angular.upgrade.zone.angular-zonejs-imports-v17-migration
name: Angular Zone.js Imports v17 Migration
description: >
  Migrate Zone.js imports to Angular 17-compatible entry points after an Angular 17 upgrade when deep imports from zone.js dist or bundles remain in app or test code.
stack:
  - Angular
  - TypeScript
category: zone
status: stable
version: 0.6.0
owner: NgAutoPilot
triggers:
  - Zone.js imports
  - zone.js/testing
  - zone.js deep imports
compatibility:
  angular:
    min: "17"
---

# Angular Zone.js Imports v17 Migration

## Purpose

Move Zone.js imports to supported Angular 17 entry points.

## When to Use

- The app or tests import Zone.js deep paths.
- The app has old test bootstrap files.
- The upgrade exposed zone import errors.

## When Not to Use

- Zone.js imports are already clean.
- The app is still in a version upgrade.

## Required Inputs

- app bootstrap files
- test bootstrap files
- `polyfills.ts`
- `zone.js` imports

## Procedure

1. Search for deep Zone.js imports.
2. Replace them with supported root imports.
3. Update test bootstrap files.
4. Run tests that depend on async timing.

## Do

- Use `zone.js` and `zone.js/testing`.
- Keep test setup consistent.
- Validate async behavior after import changes.

## Do Not

- Do not leave deep imports in app or test code.
- Do not mix this with a broader test rewrite.

## Review Checklist

- [ ] Deep imports are removed.
- [ ] Test bootstrap uses supported imports.
- [ ] Async tests still pass.

## Expected Output

1. Zone.js import summary.
2. Test bootstrap updates.
3. Async test result.

## Exit Criteria

- Zone.js imports are compatible with Angular 17.

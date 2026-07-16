---
id: angular.upgrade.testing.angular-v18-test-stability-change-detection
name: Angular v18 Test Stability Change Detection
description: >
  Review Angular 18 test timing, change detection, stabilization, and fixture behavior after an Angular 18 upgrade when tests rely on whenStable, autoDetectChanges, fakeAsync, tick, flush, dialog timing, or Zone stabilization.
stack:
  - Angular
  - TypeScript
category: testing
status: stable
version: 0.5.1
owner: NgAutoPilot
triggers:
  - test stability
  - change detection timing
  - whenStable
  - autoDetectChanges
compatibility:
  angular:
    min: "18"
---

# Angular v18 Test Stability Change Detection

## Purpose

Review Angular 18 test timing and change detection behavior.

## When to Use

- Tests rely on `whenStable`, `autoDetectChanges`, `fakeAsync`, `tick`, or `flush`.
- Dialogs or overlays are created during change detection.
- The app is stable on Angular 18.

## When Not to Use

- The app is still in a version upgrade.
- The tests do not rely on timing-sensitive behavior.

## Required Inputs

- test setup files
- specs that use stabilization helpers
- dialog and overlay tests
- fakeAsync tests

## Procedure

1. Identify timing-sensitive specs.
2. Review stabilization assumptions.
3. Replace fragile timing with explicit detection when needed.
4. Validate targeted tests.

## Do

- Prefer explicit change detection in fragile specs.
- Validate overlays and dialogs carefully.
- Keep test adjustments narrow.

## Do Not

- Do not add arbitrary timeouts to tests.
- Do not hide failing tests with blanket configuration changes.

## Review Checklist

- [ ] Timing-sensitive tests are identified.
- [ ] Stabilization assumptions are correct.
- [ ] Tests pass.

## Expected Output

1. Test stability summary.
2. Timing-sensitive spec list.
3. Test result.

## Exit Criteria

- Test timing risk is explicit.

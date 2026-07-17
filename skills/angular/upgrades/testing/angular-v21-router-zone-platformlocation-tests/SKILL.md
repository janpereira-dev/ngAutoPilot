---
id: angular.upgrade.testing.angular-v21-router-zone-platformlocation-tests
name: Angular v21 Router Zone PlatformLocation Tests
description: >
  Review Angular 21 tests that rely on router navigation timing, Zone.js scheduling, or PlatformLocation behavior after an Angular 21 upgrade. Use when router and zone timing changes may alter fixture stability or navigation assertions.
stack:
  - Angular
  - TypeScript
category: testing
status: stable
version: 0.5.2
owner: NgAutoPilot
triggers:
  - router tests
  - Zone.js timing
  - PlatformLocation
  - navigation assertions
compatibility:
  angular:
    min: "21"
---

# Angular v21 Router Zone PlatformLocation Tests

## Purpose

Review Angular 21 router, Zone.js, and PlatformLocation tests.

## When to Use

- Tests rely on navigation timing.
- Tests use `PlatformLocation` or `MockPlatformLocation`.
- Zone timing affects fixture stability.

## When Not to Use

- The app has no timing-sensitive router tests.
- The app is still in a version hop.

## Required Inputs

- navigation specs
- PlatformLocation tests
- Zone-based async tests
- fakeAsync tests

## Procedure

1. Identify timing-sensitive navigation tests.
2. Review PlatformLocation assumptions.
3. Validate routing and async stability.

## Do

- Prefer explicit waits and assertions.
- Keep test fixes narrow.

## Do Not

- Do not add arbitrary timeouts.
- Do not mix this with the version hop.

## Review Checklist

- [ ] Navigation timing is understood.
- [ ] PlatformLocation assumptions are correct.
- [ ] Tests pass.

## Expected Output

1. Router/Zone test summary.
2. PlatformLocation review.
3. Test result.

## Exit Criteria

- Router/Zone timing risk is explicit.

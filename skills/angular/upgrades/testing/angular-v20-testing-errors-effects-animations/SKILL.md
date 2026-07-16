---
id: angular.upgrade.testing.angular-v20-testing-errors-effects-animations
name: Angular v20 Testing Errors Effects Animations
description: >
  Review Angular 20 tests that rely on effect timing, TestBed.tick, fakeAsync, animation timing, AsyncPipe error reporting, event listener errors, ApplicationRef.tick, or ng-reflect debug attributes after an Angular 20 upgrade.
stack:
  - Angular
  - TypeScript
category: testing
status: stable
version: 0.5.1
owner: NgAutoPilot
triggers:
  - effects timing
  - fakeAsync
  - animations
  - AsyncPipe errors
compatibility:
  angular:
    min: "20"
---

# Angular v20 Testing Errors Effects Animations

## Purpose

Review Angular 20 tests that rely on effect timing and test stability behavior.

## When to Use

- Tests use `fakeAsync`, `tick`, `flush`, or `whenStable`.
- Effects influence DOM timing or scheduler behavior.
- Animation assertions exist.
- The app is stable on Angular 20.

## When Not to Use

- The app is still in a version hop.
- The tests do not rely on scheduler-sensitive behavior.

## Required Inputs

- timing-sensitive specs
- effect usage
- fakeAsync tests
- animation tests
- event listener error tests
- AsyncPipe-related tests

## Procedure

1. Identify timing-sensitive tests.
2. Review scheduler and stabilization assumptions.
3. Make timing explicit where needed.
4. Validate targeted tests.

## Do

- Prefer explicit change detection where tests are fragile.
- Review effect ordering carefully.
- Keep test fixes narrow.

## Do Not

- Do not add arbitrary timeouts.
- Do not hide failures behind blanket workarounds.

## Review Checklist

- [ ] Timing-sensitive tests are identified.
- [ ] Scheduler assumptions are correct.
- [ ] Tests pass.

## Expected Output

1. Scheduler timing summary.
2. Timing-sensitive spec list.
3. Test result.

## Exit Criteria

- Scheduler risk is explicit.

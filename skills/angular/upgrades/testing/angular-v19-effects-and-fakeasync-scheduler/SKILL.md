---
id: angular.upgrade.testing.angular-v19-effects-and-fakeasync-scheduler
name: Angular v19 Effects and fakeAsync Scheduler
description: >
  Review Angular 19 tests that rely on effect timing, fakeAsync flush behavior, whenStable, tick, flush, or application stabilization after an Angular 19 upgrade. Use when scheduler changes or effect ordering changes can alter test outcomes.
stack:
  - Angular
  - TypeScript
category: testing
status: draft
version: 0.3.1
owner: NgAutoPilot
triggers:
  - effects timing
  - fakeAsync scheduler
  - whenStable
  - ApplicationRef.tick
compatibility:
  angular:
    min: "19"
---

# Angular v19 Effects and fakeAsync Scheduler

## Purpose

Review Angular 19 tests that rely on effect timing and fakeAsync behavior.

## When to Use

- Tests use `fakeAsync`, `tick`, `flush`, or `whenStable`.
- Effects influence DOM timing or scheduler behavior.
- The app is stable on Angular 19.

## When Not to Use

- The app is still in a version hop.
- The tests do not rely on scheduler-sensitive behavior.

## Required Inputs

- timing-sensitive specs
- effect usage
- fakeAsync tests
- dialog and overlay tests

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
- Do not hide failures behind blanket scheduler workarounds.

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

---
id: angular.upgrade.signals.angular-signals-mutate-to-update-v17
name: Angular Signals Mutate to Update v17
description: >
  Replace Angular Signals mutate usage with update-based immutable patterns after an Angular 17 upgrade when signal state changes are still written with in-place mutation. Use when a bounded slice uses signals and needs a controlled refactor.
stack:
  - Angular
  - TypeScript
category: signals
status: stable
version: 0.5.2
owner: NgAutoPilot
triggers:
  - signals mutate
  - signals update
  - reactive state modernization
compatibility:
  angular:
    min: "17"
---

# Angular Signals Mutate to Update v17

## Purpose

Replace `mutate(...)` with `update(...)` for Angular Signals.

## When to Use

- The app already uses Signals.
- A bounded slice still mutates signal state in place.
- The app is stable on Angular 17.

## When Not to Use

- The app does not use Signals.
- The app is still in a version upgrade.

## Required Inputs

- signal definitions
- computed values
- effects
- tests for the target slice

## Procedure

1. Find in-place signal mutations.
2. Convert them to immutable updates.
3. Validate computed values and effects.
4. Run targeted tests.

## Do

- Prefer immutable state transitions.
- Keep effects narrow.
- Validate UI updates.

## Do Not

- Do not leave `mutate(...)` in the target slice.
- Do not mix this with a version upgrade.

## Review Checklist

- [ ] `mutate(...)` is removed from the slice.
- [ ] UI updates remain correct.
- [ ] Tests pass.

## Expected Output

1. Signal mutation summary.
2. Update-based refactor.
3. Test result.

## Exit Criteria

- Signal slice is migration-complete.

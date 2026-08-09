---
id: angular.upgrade.change-detection.angular-onpush-host-bindings-v18
name: Angular OnPush Host Bindings v18
description: >
  Review OnPush components with host bindings after Angular 18 when host-bound state or external callbacks may not refresh as expected. Use when a bounded slice relies on ChangeDetectionStrategy.OnPush, host bindings, markForCheck, detectChanges, or manual refresh logic.
stack:
  - Angular
  - TypeScript
category: change-detection
status: stable
version: 0.6.0
owner: NgAutoPilot
triggers:
  - OnPush
  - host bindings
  - markForCheck
  - detectChanges
compatibility:
  angular:
    min: "18"
---

# Angular OnPush Host Bindings v18 Migration

## Purpose

Review OnPush components with host bindings after Angular 18.

## When to Use

- Components use `ChangeDetectionStrategy.OnPush`.
- Components rely on `@HostBinding`.
- Manual refresh logic exists.

## When Not to Use

- The app does not use OnPush or host bindings.
- The app is still in a version upgrade.

## Required Inputs

- OnPush components
- host bindings
- manual refresh logic
- tests for the target slice

## Procedure

1. Identify OnPush components with host-bound state.
2. Review external callback and refresh behavior.
3. Add explicit dirty-marking where needed.
4. Validate tests and UI state.

## Do

- Keep refresh triggers intentional.
- Validate third-party callback paths.
- Review visual state updates.

## Do Not

- Do not rely on implicit refresh behavior.
- Do not mix this with the version upgrade.

## Review Checklist

- [ ] Host-bound state updates correctly.
- [ ] Refresh logic is explicit.
- [ ] Tests pass.

## Expected Output

1. OnPush host binding summary.
2. Refresh logic updates.
3. Test result.

## Exit Criteria

- OnPush host binding risk is explicit.

---
id: angular.architecture.directive-composition-api
name: Directive Composition API
description: >
  Adopt Angular directive composition in bounded slices after the app is stable, using it to reduce inheritance-heavy patterns and share behavior without mixing the change into upgrade work.
stack:
  - Angular
  - TypeScript
category: architecture
status: stable
version: 0.5.1
owner: NgAutoPilot
triggers:
  - directive composition
  - composition API
  - inheritance reduction
compatibility:
  angular:
    min: "15"
---

# Directive Composition API

## Purpose

Adopt Angular directive composition in a bounded, post-upgrade modernization slice.

## When to Use

- The app is already on a stable Angular version.
- The codebase has inheritance-heavy shared behavior.
- The team wants to compose behavior instead of extending base classes.

## When Not to Use

- The app is still in a version upgrade.
- The codebase is not stable enough for architectural refactoring.

## Required Inputs

- reusable directives
- inheritance-heavy components
- shared behavior candidates
- tests for the target slice

## Procedure

1. Identify repeated behavior in a bounded area.
2. Extract directive behavior carefully.
3. Apply composition to one slice.
4. Validate inputs, outputs, host bindings, and tests.

## Do

- Prefer small refactors.
- Keep host behavior explicit.
- Validate accessibility and event handling.

## Do Not

- Do not convert unrelated inheritance trees in one pass.
- Do not mix this with a version upgrade.
- Do not hide behavior in composition without tests.

## Review Checklist

- [ ] Slice is bounded.
- [ ] Behavior is preserved.
- [ ] Tests pass.
- [ ] Remaining inheritance debt is documented.

## Expected Output

1. Slice refactored with composition.
2. Remaining inheritance patterns.
3. Test result.
4. Follow-up list.

## Exit Criteria

- Composition is incremental.
- The next slice is clear.

---
id: angular.modernization.angular-standalone-first-adoption
name: Angular Standalone First Adoption
description: >
  Adopt standalone components and bootstrap APIs in bounded post-upgrade modernization slices after Angular 18 is stable. Use when reducing NgModule usage incrementally or converting bounded feature areas without mixing the change into a version hop.
stack:
  - Angular
  - TypeScript
category: modernization
status: draft
version: 0.3.1
owner: NgAutoPilot
triggers:
  - standalone adoption
  - standalone components
  - bootstrapApplication
  - NgModule reduction
compatibility:
  angular:
    min: "18"
---

# Angular Standalone First Adoption

## Purpose

Adopt standalone components and bootstrap APIs in bounded modernization slices after Angular 18 is stable.

## When to Use

- The app is already on stable Angular 18.
- The team wants to reduce `NgModule` usage incrementally.
- The change is modernization, not a version upgrade.

## When Not to Use

- The app is still in a version hop.
- The app is not stable enough for architectural refactoring.

## Required Inputs

- feature module boundaries
- routing setup
- shared declarations/modules
- bootstrap entry points
- tests for the target slice

## Procedure

1. Select a bounded feature area.
2. Convert leaf components first.
3. Update routing and bootstrap paths.
4. Remove obsolete declarations only after the slice is stable.
5. Validate build, tests, and runtime behavior.

## Do

- Prefer incremental conversion.
- Keep shared module changes small.
- Validate lazy routes and bootstrap paths.

## Do Not

- Do not convert the whole app in one pass.
- Do not mix standalone adoption with version hops.
- Do not remove modules that still provide shared declarations.

## Review Checklist

- [ ] Slice is bounded.
- [ ] Routing still works.
- [ ] Bootstrap still works.
- [ ] Tests pass.
- [ ] Remaining NgModule debt is documented.

## Expected Output

1. Slice converted to standalone.
2. Remaining module dependencies.
3. Test result.
4. Follow-up list.

## Exit Criteria

- Adoption is incremental.
- The next slice is clear.

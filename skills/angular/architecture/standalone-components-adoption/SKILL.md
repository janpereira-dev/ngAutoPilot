---
id: angular.architecture.standalone-components-adoption
name: Standalone Components Adoption
description: >
  Adopt Angular standalone components after an Angular upgrade when the app is stable on Ivy and the goal is architectural modernization rather than a version hop. Use when the project is ready to reduce NgModule usage incrementally or convert bounded feature areas without mixing the change into the upgrade itself.
stack:
  - Angular
  - TypeScript
category: architecture
status: stable
version: 0.5.1
owner: NgAutoPilot
triggers:
  - standalone components
  - standalone adoption
  - NgModule reduction
compatibility:
  angular:
    min: "15"
---

# Standalone Components Adoption

## Purpose

Adopt standalone components in bounded slices after the Angular upgrade is stable.

## When to Use

- The app is already on a stable Angular version.
- The team wants to reduce `NgModule` usage incrementally.
- The change is architectural modernization, not a version upgrade.

## When Not to Use

- The app is still in the middle of a major Angular hop.
- The goal is to fix a build break during upgrade.
- The app is not stable on Ivy.

## Required Inputs

- `angular.json`
- feature module boundaries
- routing setup
- shared declarations/modules
- test coverage for the target slice

## Procedure

1. Select a bounded feature area.
2. Convert leaf components first.
3. Update routing and imports.
4. Remove obsolete declarations only after the slice is stable.
5. Validate build, tests, and runtime behavior.

## Do

- Prefer incremental conversion.
- Keep shared module changes small.
- Validate lazy routes and bootstrap paths.

## Do Not

- Do not convert the whole app in one pass.
- Do not mix standalone adoption with upgrade hops.
- Do not remove modules that still provide shared declarations.

## Review Checklist

- [ ] Slice is bounded.
- [ ] Routing still works.
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

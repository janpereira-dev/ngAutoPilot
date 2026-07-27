---
id: angular.upgrade.angularjs.angularjs-controller-to-component-migration
name: AngularJS Controller to Component Migration
description: >
  Convert AngularJS controllers into Angular components during modernization. Use when controller-heavy views must become component-based before or during a hybrid migration.
stack:
  - Angular
  - AngularJS
category: angularjs
status: stable
version: 0.5.3
owner: NgAutoPilot
triggers:
  - AngularJS controller migration
  - controller to component
  - legacy controller
compatibility:
  angular:
    min: "2"
---

# AngularJS Controller to Component Migration

## Purpose

Migrate AngularJS controllers to Angular components.

## When to Use

- Controllers own view logic that should move to components.
- The app is being modernized incrementally.

## When Not to Use

- The controller is not part of the migration scope.
- The app is already component-first.

## Required Inputs

- controller code
- template bindings
- scope usage

## Procedure

1. Extract controller state and methods.
2. Move template logic into Angular component inputs and outputs.
3. Validate behavior.

## Do

- Keep component APIs simple.
- Preserve user-visible behavior.

## Do Not

- Do not keep scope-based coupling.

## Review Checklist

- [ ] Controller responsibilities identified.
- [ ] Component API defined.
- [ ] Tests updated.

## Expected Output

1. Controller migration summary.
2. Component mapping.

## Exit Criteria

- Controllers are no longer required for the migrated view.

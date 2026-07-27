---
id: angular.architecture.host-directives-adoption
name: Host Directives Adoption
description: >
  Adopt Angular host directives in bounded post-upgrade modernization slices to share host behavior, reduce wrapper components, and replace inheritance-heavy patterns without mixing the change into an Angular version hop.
stack:
  - Angular
  - TypeScript
category: architecture
status: stable
version: 0.5.3
owner: NgAutoPilot
triggers:
  - host directives
  - hostDirectives
  - wrapper reduction
  - inheritance reduction
compatibility:
  angular:
    min: "15"
---

# Host Directives Adoption

## Purpose

Adopt host directives in bounded modernization slices after the app is stable on the target Angular version.

## When to Use

- The app is already on a stable Angular version.
- The codebase has wrapper components that only forward behavior.
- The team wants to share host behavior without extending base classes.

## When Not to Use

- The app is still in a major version upgrade.
- The target slice is not well tested.
- The app relies on component wrappers for public API contracts that are not ready to change.

## Required Inputs

- wrapper components
- shared directive behavior
- host bindings and listeners
- test coverage for the target slice
- accessibility expectations

## Procedure

1. Identify wrapper components that only proxy behavior.
2. Extract the shared behavior into a directive.
3. Apply host directives to one bounded slice.
4. Validate inputs, outputs, events, and styles.
5. Remove wrappers only after the slice is stable.

## Do

- Prefer incremental migration.
- Keep public APIs stable unless the slice explicitly changes them.
- Validate keyboard and accessibility behavior.

## Do Not

- Do not convert unrelated wrappers in one pass.
- Do not mix this with version upgrade work.
- Do not hide public API changes behind host directives without tests.

## Review Checklist

- [ ] Slice is bounded.
- [ ] Wrapper behavior is preserved or intentionally changed.
- [ ] Tests pass.
- [ ] Accessibility and events are validated.

## Expected Output

1. Slice refactored with host directives.
2. Remaining wrapper components.
3. Test result.
4. Follow-up list.

## Exit Criteria

- Adoption is incremental.
- The next slice is clear.

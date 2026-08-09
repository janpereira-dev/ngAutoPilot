---
id: angular.architecture.defer-lazy-loading-modernization
name: Defer Lazy Loading Modernization
description: >
  Adopt Angular defer blocks and modern lazy loading in bounded post-upgrade modernization slices to improve render timing, route splitting, and loading behavior without mixing the change into an Angular version hop.
stack:
  - Angular
  - TypeScript
category: architecture
status: stable
version: 0.6.0
owner: NgAutoPilot
triggers:
  - defer blocks
  - lazy loading modernization
  - route splitting
  - loading behavior modernization
compatibility:
  angular:
    min: "17"
---

# Defer and Lazy Loading Modernization

## Purpose

Adopt `@defer` and modern lazy loading in bounded modernization slices after the app is stable on a compatible Angular version.

## When to Use

- The app is already on a stable Angular version that supports `@defer`.
- The team wants to improve render timing or split heavy views incrementally.
- The change is architectural modernization, not a version upgrade.

## When Not to Use

- The app is still in the middle of a major Angular hop.
- The target slice is not well tested.
- The app is not on a version that supports `@defer`.

## Required Inputs

- heavy templates
- route boundaries
- lazy route configuration
- loading and placeholder behavior
- tests for the target slice

## Procedure

1. Select a bounded feature area.
2. Identify heavy views or route boundaries.
3. Introduce `@defer` or route splitting in the smallest safe slice.
4. Keep placeholders, loading states, and fallback content explicit.
5. Validate rendering, timing, and tests.

## Do

- Prefer incremental conversion.
- Keep loading states intentional.
- Validate empty, loading, and error paths.

## Do Not

- Do not split the whole app in one pass.
- Do not mix this with upgrade hops.
- Do not hide loading regressions behind a smaller diff.

## Review Checklist

- [ ] Slice is bounded.
- [ ] Loading behavior is correct.
- [ ] Tests pass.
- [ ] Remaining loading debt is documented.

## Expected Output

1. Slice converted to defer or modern lazy loading.
2. Remaining route/view debt.
3. Test result.
4. Follow-up list.

## Exit Criteria

- Adoption is incremental.
- The next slice is clear.

---
id: angular.upgrade.deprecations.angular-v15-deprecation-cleanup
name: Angular v15 Deprecation Cleanup
description: >
  Cleans up Angular 15 deprecations in touched code after the upgrade is stable.
stack:
  - Angular
  - TypeScript
category: deprecations
status: draft
version: 0.3.1
owner: NgAutoPilot
triggers:
  - deprecation cleanup
  - routerlinkwithhref
  - date pipe timezone
compatibility:
  angular:
    min: "15"
---

# Angular v15 Deprecation Cleanup

## Purpose

Use this skill to clean up Angular 15 deprecations in touched code after the upgrade is stable.

## When to Use

- The Angular 15 upgrade is already in place.
- Touched code still contains deprecations worth removing.

## Do

- Remove or document deprecations only in code that was touched or is clearly in scope.
- Keep cleanup small and reviewable.

## Do Not

- Do not turn deprecation cleanup into a broad refactor.
- Do not remove deprecations that are not understood.

## Review Checklist

- [ ] Deprecations found are listed.
- [ ] Cleanup scope is bounded.
- [ ] Warnings or blockers are documented.

## Expected Output

1. Deprecations found.
2. Cleanup scope.
3. Warnings or blockers.

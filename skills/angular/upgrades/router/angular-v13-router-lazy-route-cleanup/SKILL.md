---
id: angular.upgrade.router.angular-v13-router-lazy-route-cleanup
name: Angular v13 Router Lazy Route Cleanup
description: >
  Clean up legacy Angular router lazy route syntax before or during Angular 13 migration.
stack:
  - Angular
  - TypeScript
category: router
status: stable
version: 0.6.0
owner: NgAutoPilot
triggers:
  - Angular 13 router
  - lazy route cleanup
  - loadChildren strings
compatibility:
  angular:
    min: "13"
---

# Angular v13 Router Lazy Route Cleanup

## Purpose

Remove legacy lazy route syntax.

## When to Use

- Router config still contains legacy lazy route patterns.
- The project is moving through Angular 13.

## When Not to Use

- Routes already use dynamic imports.
- No router cleanup is needed.

## Required Inputs

- router config
- lazy routes
- navigation tests

## Procedure

1. Find legacy lazy routes.
2. Replace them with supported lazy imports.
3. Validate navigation.

## Do

- Keep routes explicit.
- Validate route loading.

## Do Not

- Do not keep legacy string syntax.

## Review Checklist

- [ ] Lazy routes updated.
- [ ] Tests pass.
- [ ] No legacy syntax remains.

## Expected Output

1. Lazy route cleanup summary.
2. Validation result.

## Exit Criteria

- Router lazy route syntax is modernized.

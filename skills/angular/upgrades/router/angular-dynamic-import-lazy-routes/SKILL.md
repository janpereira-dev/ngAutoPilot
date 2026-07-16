---
id: angular.upgrade.router.angular-dynamic-import-lazy-routes
name: Angular Dynamic Import Lazy Routes
description: >
  Replace Angular router string-based lazy route syntax with dynamic imports. Use when older loadChildren patterns still exist and block modern Angular routing.
stack:
  - Angular
  - TypeScript
category: router
status: stable
version: 0.5.0
owner: NgAutoPilot
triggers:
  - lazy routes
  - loadChildren string
  - dynamic import routes
compatibility:
  angular:
    min: "8"
---

# Angular Dynamic Import Lazy Routes

## Purpose

Move lazy routes to dynamic imports.

## When to Use

- Route configuration still uses string-based lazy loading.
- The project is upgrading toward modern router syntax.

## When Not to Use

- All lazy routes already use dynamic imports.
- No router modernization is needed.

## Required Inputs

- route config
- lazy route modules
- routing tests

## Procedure

1. Find string-based lazy routes.
2. Replace them with dynamic imports.
3. Validate navigation behavior.

## Do

- Keep route boundaries explicit.
- Validate route loading.

## Do Not

- Do not keep string-based lazy loading.

## Review Checklist

- [ ] Lazy routes use imports.
- [ ] Routes compile.
- [ ] Tests pass.

## Expected Output

1. Lazy route migration summary.
2. Validation notes.

## Exit Criteria

- String-based lazy routes are removed.

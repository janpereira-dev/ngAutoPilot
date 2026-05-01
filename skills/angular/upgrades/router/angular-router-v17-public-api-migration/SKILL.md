---
id: angular.upgrade.router.angular-router-v17-public-api-migration
name: Angular Router v17 Public API Migration
description: >
  Migrate Angular Router code to v17 public APIs after an Angular 17 upgrade when the app uses advanced router configuration, custom URL handling, redirects, or loadComponent route inheritance. Use when router internals are mutated directly or when malformed URI handling, absolute redirects, or route inheritance need explicit review.
stack:
  - Angular
  - TypeScript
category: router
status: draft
version: 0.1.0
owner: NgAutoPilot
triggers:
  - router public API migration
  - malformedUriErrorHandler
  - absolute redirects
  - loadComponent inheritance
compatibility:
  angular:
    min: "17"
---

# Angular Router v17 Public API Migration

## Purpose

Move Angular Router usage to supported public APIs after Angular 17.

## When to Use

- Router internals are mutated directly.
- Custom URL parsing or redirects exist.
- `loadComponent` route inheritance matters.
- Router tests rely on old assumptions.

## When Not to Use

- The app does not have router customization risk.
- The app is still in a version upgrade.

## Required Inputs

- router config
- custom `UrlSerializer`
- absolute redirects
- `loadComponent` routes
- child route inheritance
- router tests

## Procedure

1. Identify router internals or deprecated patterns.
2. Move config to `provideRouter` or `RouterModule.forRoot`.
3. Replace custom parsing or redirect workarounds with supported APIs.
4. Validate route inheritance and tests.

## Do

- Keep router configuration public-API-based.
- Review absolute redirects and inheritance explicitly.
- Validate navigation tests.

## Do Not

- Do not mutate router internals directly.
- Do not keep risky redirect workarounds unreviewed.
- Do not mix this with version upgrade work.

## Review Checklist

- [ ] Router config uses public APIs.
- [ ] Redirect behavior is validated.
- [ ] `loadComponent` inheritance is correct.
- [ ] Tests pass.

## Expected Output

1. Router migration summary.
2. Redirect review.
3. Route inheritance review.
4. Test result.

## Exit Criteria

- Router risk is resolved or documented.

---
id: angular.upgrade.router.angular-v20-guards-redirects-route-validation
name: Angular v20 Guards Redirects Route Validation
description: >
  Validate Angular 20 router guards, redirects, and route configuration after an Angular 20 upgrade when `redirectTo`, `canMatch`, `RedirectFn`, or readonly command arrays may affect routing behavior.
stack:
  - Angular
  - TypeScript
category: router
status: stable
version: 0.6.0
owner: NgAutoPilot
triggers:
  - router guards
  - redirects
  - route validation
  - RedirectFn
compatibility:
  angular:
    min: "20"
---

# Angular v20 Guards Redirects Route Validation

## Purpose

Validate Angular 20 router guards, redirects, and route configuration.

## When to Use

- The app has guards or resolvers.
- The app uses `redirectTo`, `canMatch`, or `RedirectFn`.
- Route readers or navigation tests are sensitive.

## When Not to Use

- The app has no router complexity.
- The app is still in a version hop.

## Required Inputs

- routes
- guards
- resolvers
- route readers
- navigation tests

## Procedure

1. Identify redirect and guard paths.
2. Review route validation and readonly command arrays.
3. Update typings and redirect handling.
4. Validate navigation tests.

## Do

- Keep redirect behavior explicit.
- Review route readers and `canMatch` combinations.
- Validate navigation history and failure behavior.

## Do Not

- Do not assume `redirectTo` is only a string.
- Do not mix this with the version hop.

## Review Checklist

- [ ] Redirect sources are identified.
- [ ] Typings allow current redirect behavior.
- [ ] Route validation passes.
- [ ] Tests pass.

## Expected Output

1. Router validation summary.
2. Typing updates.
3. Test result.

## Exit Criteria

- Router risk is explicit.

---
id: angular.upgrade.router.angular-router-error-handler-v19
name: Angular Router Error Handler v19
description: >
  Migrate Angular Router error handling after Angular 19 when routing code uses Router.errorHandler, custom navigation error handling, guards, resolvers, or route readers that depend on navigation failure behavior. Use when redirect/error handling needs explicit review.
stack:
  - Angular
  - TypeScript
category: router
status: stable
version: 0.5.2
owner: NgAutoPilot
triggers:
  - Router.errorHandler
  - navigation error handling
  - RedirectCommand
  - routing failures
compatibility:
  angular:
    min: "19"
---

# Angular Router Error Handler v19

## Purpose

Migrate Angular Router error handling after Angular 19.

## When to Use

- The code uses `Router.errorHandler`.
- Guards or resolvers redirect on failure.
- Router navigation failures need explicit handling.

## When Not to Use

- The app has no router error handling.
- The app is still in a version hop.

## Required Inputs

- router config
- guards
- resolvers
- navigation error tests
- route readers

## Procedure

1. Identify router error handlers.
2. Migrate to supported public APIs.
3. Review redirect and failure behavior.
4. Validate navigation tests.

## Do

- Keep router error handling explicit.
- Review navigation failure paths.
- Validate tests.

## Do Not

- Do not keep `Router.errorHandler` in the target slice.
- Do not mix this with the version hop.

## Review Checklist

- [ ] Error handling paths are known.
- [ ] Redirect behavior is explicit.
- [ ] Tests pass.

## Expected Output

1. Error handling summary.
2. API migration summary.
3. Test result.

## Exit Criteria

- Router error handling risk is explicit.

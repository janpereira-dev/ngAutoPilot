---
id: angular.upgrade.router.angular-router-redirect-command-v18
name: Angular Router Redirect Command v18
description: >
  Review Angular Router redirect behavior after Angular 18 when guards, resolvers, or route metadata rely on UrlTree redirects, Route.redirectTo, or RedirectCommand. Use when history behavior, replaceUrl, or route readers need an explicit compatibility review.
stack:
  - Angular
  - TypeScript
category: router
status: stable
version: 0.5.2
owner: NgAutoPilot
triggers:
  - RedirectCommand
  - router redirects
  - guards and resolvers
  - Route.redirectTo
compatibility:
  angular:
    min: "18"
---

# Angular Router Redirect Command v18

## Purpose

Review Angular Router redirect behavior after Angular 18.

## When to Use

- Guards or resolvers return `UrlTree` or `RedirectCommand`.
- Route readers assume `redirectTo` is only a string.
- Redirect history behavior matters.

## When Not to Use

- The app has no redirect behavior to review.
- The app is still in a version upgrade.

## Required Inputs

- guards
- resolvers
- `RedirectCommand`
- `UrlTree`
- `Route.redirectTo`
- route metadata readers
- navigation tests

## Procedure

1. Identify redirect-producing code.
2. Review history behavior.
3. Update route readers and typings.
4. Validate navigation tests.

## Do

- Keep redirect behavior explicit.
- Update route readers to handle function redirects.
- Validate navigation history.

## Do Not

- Do not assume `redirectTo` is only a string.
- Do not keep redirect history behavior unreviewed.

## Review Checklist

- [ ] Redirect sources are identified.
- [ ] Typings allow `RedirectCommand`.
- [ ] History behavior is validated.
- [ ] Tests pass.

## Expected Output

1. Redirect behavior summary.
2. Typing updates.
3. Test result.

## Exit Criteria

- Redirect risk is explicit.

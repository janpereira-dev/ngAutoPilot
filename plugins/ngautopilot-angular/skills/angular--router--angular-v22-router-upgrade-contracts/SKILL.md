---
id: angular.router.angular-v22-router-upgrade-contracts
name: Angular v22 Router Upgrade Contracts
description: >
  Use this skill when Angular 22 changes affect route configuration, guards, redirects, route reuse, or navigation behavior.
stack:
  - Angular
  - TypeScript
category: router
status: stable
version: 0.5.0
owner: NgAutoPilot
triggers:
  - router
  - provideRouter
  - CanMatch
  - paramsInheritanceStrategy
  - route cleanup
compatibility:
  angular:
    min: "22"
---

# Angular v22 Router Upgrade Contracts

## Purpose

Use this skill when Angular 22 changes affect route configuration, guards, redirects, route reuse, or navigation behavior.

## When to Use

Use this skill when:

- The bootstrap router config needs a v22 update.
- Guards, redirects, or route reuse rely on older contracts.
- The app depends on route parameter inheritance or navigation behavior.

## When Not to Use

Do not use this skill when:

- The issue is only a template syntax problem.
- No route config or navigation contract changed.
- The task is already covered by a more specific routing satellite.

## Required Inputs

- bootstrap route config
- guards and redirects
- route reuse strategy
- router tests

## Procedure

1. Review the router bootstrap and remove deprecated config patterns.
2. Update guard signatures and route parameter assumptions.
3. Check route reuse and cleanup behavior if cached views are involved.

## Do

- Use the supported router configuration path.
- Keep guard contracts explicit.
- Validate the route behavior after changing defaults.

## Do Not

- Do not keep deprecated route helpers in new code.
- Do not assume the old route parameter inheritance still applies.
- Do not ignore cached-route cleanup when memory matters.

## Review Checklist

- [ ] Router config uses the supported API.
- [ ] Guard signatures still compile.
- [ ] Route tests pass with the new defaults.

## Expected Output

When this skill is used, the agent should:

1. A router contract summary.
2. The changed defaults or APIs.
3. Validation evidence.

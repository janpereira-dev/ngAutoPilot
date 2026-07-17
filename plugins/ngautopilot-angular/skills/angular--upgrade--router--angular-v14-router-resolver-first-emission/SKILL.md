---
id: angular.upgrade.router.angular-v14-router-resolver-first-emission
name: Angular v14 Router Resolver First Emission
description: >
  Review router resolvers for first-emission behavior before or during Angular 14 migration. Use when multi-emission observables or delayed resolver completion affect navigation.
stack:
  - Angular
  - TypeScript
category: router
status: stable
version: 0.5.2
owner: NgAutoPilot
triggers:
  - resolver first emission
  - router resolver
  - navigation completion
compatibility:
  angular:
    min: "14"
---

# Angular v14 Router Resolver First Emission

## Purpose

Review resolver completion behavior.

## When to Use

- Router resolvers may emit more than once.
- Navigation depends on first-emission assumptions.

## When Not to Use

- Resolvers are already single-emission.
- The app has no resolver logic.

## Required Inputs

- resolver code
- route config
- navigation tests

## Procedure

1. Identify multi-emission resolvers.
2. Ensure navigation only relies on the intended emission.
3. Validate routing behavior.

## Do

- Keep resolver contracts explicit.
- Validate navigation completion.

## Do Not

- Do not assume multi-emission timing is harmless.

## Review Checklist

- [ ] Resolver behavior reviewed.
- [ ] Navigation tests updated.
- [ ] No unintended emissions remain.

## Expected Output

1. Resolver behavior summary.
2. Test notes.

## Exit Criteria

- Resolver completion behavior is acceptable.

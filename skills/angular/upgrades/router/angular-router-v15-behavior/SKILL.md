---
id: angular.upgrade.router.angular-router-v15-behavior
name: Angular Router v15 Behavior
description: >
  Reviews Angular Router behavior changes in Angular 15 around outlet timing, route matching, and navigation assumptions.
stack:
  - Angular
  - TypeScript
category: router
status: stable
version: 0.5.3
owner: NgAutoPilot
triggers:
  - router behavior
  - route timing
  - navigation assumptions
  - relativeLinkResolution
compatibility:
  angular:
    min: "15"
---

# Angular Router v15 Behavior

## Purpose

Use this skill to review Angular Router behavior and test assumptions around Angular 15.

## When to Use This Skill

- Router timing or outlet availability is sensitive.
- Tests rely on navigation internals.

## Do

- Review route timing assumptions and outlet availability in tests.
- Keep navigation assertions aligned with the current router behavior.

## Do Not

- Do not preserve brittle router timing hacks.
- Do not assume old outlet timing semantics remain unchanged.

## Review Checklist

- [ ] Router assumptions were inventoried.
- [ ] Required behavior changes are documented.
- [ ] Tests or code were updated safely.

## Expected Output

1. Router assumptions found.
2. Updated test or code behavior.
3. Blocker or warning.

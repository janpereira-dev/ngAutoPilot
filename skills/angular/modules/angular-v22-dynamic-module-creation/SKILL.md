---
id: angular.modules.angular-v22-dynamic-module-creation
name: Angular v22 Dynamic Module Creation
description: >
  Use this skill when Angular 22 code still needs runtime module creation or legacy NgModule boundaries.
stack:
  - Angular
  - TypeScript
category: modules
status: stable
version: 0.5.0
owner: NgAutoPilot
triggers:
  - createNgModuleRef
  - createNgModule
  - dynamic module
  - NgModule
compatibility:
  angular:
    min: "22"
---

# Angular v22 Dynamic Module Creation

## Purpose

Use this skill when Angular 22 code still needs runtime module creation or legacy NgModule boundaries.

## When to Use

Use this skill when:

- The app creates NgModules dynamically at runtime.
- Legacy integration still depends on dynamic module creation.
- You need to replace removed module-creation APIs without broad refactoring.

## When Not to Use

Do not use this skill when:

- The app has no runtime module creation.
- The change is only about static NgModule declarations.
- A wider architecture skill is a better fit.

## Required Inputs

- dynamic module factories
- bootstrap path
- legacy DI boundaries

## Procedure

1. Find every runtime module-creation path.
2. Switch removed APIs to the supported v22 replacement.
3. Check that DI and bootstrap behavior still match expectations.
4. Keep the migration isolated from unrelated module cleanup.

## Do

- Keep dynamic module creation explicit.
- Prefer the supported module API.
- Validate bootstrap and injection behavior.

## Do Not

- Do not leave removed runtime module APIs in place.
- Do not widen the migration to unrelated module work.
- Do not assume static declarations are affected just because runtime creation changed.

## Review Checklist

- [ ] Dynamic module creation was found.
- [ ] The replacement API is in place.
- [ ] Runtime behavior was validated.

## Expected Output

When this skill is used, the agent should:

1. A dynamic-module summary.
2. The replacement path.
3. Residual runtime risk.

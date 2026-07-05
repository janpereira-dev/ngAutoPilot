---
id: angular.components.angular-v22-component-contracts
name: Angular v22 Component Contracts
description: >
  Use this skill when Angular 22 changes affect component creation, selector rules, host directives, or default component behavior.
stack:
  - Angular
  - TypeScript
category: components
status: stable
version: 0.4.0
owner: NgAutoPilot
triggers:
  - ComponentFactoryResolver
  - ComponentFactory
  - selector collision
  - createComponent
  - change detection
compatibility:
  angular:
    min: "22"
---

# Angular v22 Component Contracts

## Purpose

Use this skill when Angular 22 changes affect component creation, selector rules, host directives, or default component behavior.

## When to Use

Use this skill when:

- Dynamic components use APIs that changed or were removed in v22.
- Multiple selectors or host directives may now collide.
- Component change detection behavior needs to stay explicit.

## When Not to Use

Do not use this skill when:

- The issue is only template syntax.
- The task is only about routing or SSR.
- A more specific dynamic-component skill is the better match.

## Required Inputs

- dynamic component code
- selectors
- host directives
- change detection expectations

## Procedure

1. Replace removed component creation APIs with the supported v22 path.
2. Normalize selectors so the compiler no longer sees collisions.
3. Review host-directive exposure and any default change-detection assumptions.
4. Validate dynamic component behavior with targeted tests.

## Do

- Keep component creation explicit.
- Prefer one clear selector per component contract.
- Validate lifecycle behavior after the migration.

## Do Not

- Do not keep removed factory APIs in the codebase.
- Do not ignore compile-time selector errors.
- Do not rely on an implicit change-detection default without confirming it.

## Review Checklist

- [ ] Removed component APIs are gone.
- [ ] Selectors are unambiguous.
- [ ] Component tests still pass.

## Expected Output

When this skill is used, the agent should:

1. A component-contract summary.
2. The removed API replacement.
3. Remaining component risks.

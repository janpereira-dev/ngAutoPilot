---
id: angular.upgrade.templates.angular-v21-host-binding-typecheck
name: Angular v21 Host Binding Typecheck
description: >
  Review Angular 21 host binding type checking after an Angular 21 upgrade when components or directives use @HostBinding or host metadata. Use when strict host binding types or inherited host bindings may fail compilation.
stack:
  - Angular
  - TypeScript
category: templates
status: stable
version: 0.4.0
owner: NgAutoPilot
triggers:
  - host binding typecheck
  - HostBinding
  - host metadata
  - inherited host bindings
compatibility:
  angular:
    min: "21"
---

# Angular v21 Host Binding Typecheck

## Purpose

Review Angular 21 host binding type checking.

## When to Use

- Components or directives use `@HostBinding`.
- Host metadata exists.
- The app is stable on Angular 21.

## When Not to Use

- The app has no host bindings.
- The app is still in a version hop.

## Required Inputs

- host binding code
- directive metadata
- inherited host bindings
- tests for affected components

## Procedure

1. Identify host-bound values.
2. Fix type errors explicitly.
3. Validate rendered state and tests.

## Do

- Keep host binding types explicit.
- Validate inherited bindings.

## Do Not

- Do not hide errors behind `any`.
- Do not mix this with the version hop.

## Review Checklist

- [ ] Host binding types are correct.
- [ ] Inherited bindings are correct.
- [ ] Tests pass.

## Expected Output

1. Host binding summary.
2. Type fixes.
3. Test result.

## Exit Criteria

- Host binding risk is explicit.

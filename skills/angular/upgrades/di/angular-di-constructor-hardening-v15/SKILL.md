---
id: angular.upgrade.di.angular-di-constructor-hardening-v15
name: Angular DI Constructor Hardening v15
description: >
  Reviews Angular-inheriting classes and constructor-based DI patterns for Angular 15 hardening and decorator requirements.
stack:
  - Angular
  - TypeScript
category: di
status: draft
version: 0.3.0
owner: NgAutoPilot
triggers:
  - constructor DI
  - inheritance
  - decorators
  - Angular DI hardening
compatibility:
  angular:
    min: "15"
---

# Angular DI Constructor Hardening v15

## Purpose

Use this skill to review classes that inherit Angular DI or lifecycle behavior for Angular 15 hardening.

## When to Use This Skill

- Base classes are used by components/directives.
- Constructor DI or lifecycle hooks are inherited.

## Do

- Review base classes for Angular decorators or explicit constructor handling.
- Preserve DI behavior in inherited Angular classes.

## Do Not

- Do not decorate every base class blindly.
- Do not hide inheritance problems with `any`.

## Review Checklist

- [ ] Risky inherited classes are identified.
- [ ] Decorator or constructor fix is explicit.
- [ ] Remaining blockers or warnings are documented.

## Expected Output

1. Risky base classes.
2. Decorator or constructor fix.
3. Remaining blocker or warning.

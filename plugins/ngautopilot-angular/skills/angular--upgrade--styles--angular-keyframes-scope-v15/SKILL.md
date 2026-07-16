---
id: angular.upgrade.styles.angular-keyframes-scope-v15
name: Angular Keyframes Scope v15
description: >
  Reviews component-scoped keyframes and animation-name assumptions affected by Angular 15 style scoping.
stack:
  - Angular
  - TypeScript
category: styles
status: stable
version: 0.5.1
owner: NgAutoPilot
triggers:
  - keyframes scope
  - animation-name
  - component styles
  - animation regression
compatibility:
  angular:
    min: "15"
---

# Angular Keyframes Scope v15

## Purpose

Use this skill to review component-scoped keyframes and animation-name assumptions affected by Angular 15 style scoping.

## When to Use

- Component styles define `@keyframes`.
- Code or tests rely on animation names.

## Do

- Inventory scoped keyframes and any runtime references to animation names.
- Move shared keyframes to global styles only when that matches the architecture.

## Do Not

- Do not assume component-scoped keyframes share global names.
- Do not change animation architecture blindly.

## Review Checklist

- [ ] Keyframes inventory is complete.
- [ ] Scope-sensitive regressions are identified.
- [ ] Required style fix or warning is documented.

## Expected Output

1. Keyframes inventory.
2. Scope-sensitive regressions.
3. Required style fix or warning.

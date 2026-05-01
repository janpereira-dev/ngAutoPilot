---
id: angular.upgrade.components.angular-v21-custom-elements-signal-inputs
name: Angular v21 Custom Elements Signal Inputs
description: >
  Review Angular custom elements that use signal inputs after an Angular 21 upgrade when property access semantics or signal-based inputs affect element consumers. Use when createCustomElement, customElements.define, or signal input wrappers exist.
stack:
  - Angular
  - TypeScript
category: components
status: draft
version: 0.1.0
owner: NgAutoPilot
triggers:
  - custom elements
  - signal inputs
  - createCustomElement
  - customElements.define
compatibility:
  angular:
    min: "21"
---

# Angular v21 Custom Elements Signal Inputs

## Purpose

Review Angular custom elements that use signal inputs.

## When to Use

- The app registers Angular custom elements.
- The app exposes signal inputs through custom elements.
- Property access semantics may affect consumers.

## When Not to Use

- The app does not use custom elements.
- The app is still in a version hop.

## Required Inputs

- `createCustomElement`
- `customElements.define`
- signal inputs
- consumer wrappers

## Procedure

1. Identify custom element wrappers.
2. Review signal input access semantics.
3. Validate consumer-facing behavior.

## Do

- Keep property access explicit.
- Validate consumer wrappers.

## Do Not

- Do not mix this with the version hop.

## Review Checklist

- [ ] Custom element behavior is known.
- [ ] Signal inputs are consumed correctly.
- [ ] Tests pass.

## Expected Output

1. Custom element summary.
2. Signal input review.
3. Test result.

## Exit Criteria

- Custom element risk is explicit.

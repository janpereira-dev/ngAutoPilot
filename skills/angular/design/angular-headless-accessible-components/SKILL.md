---
id: angular.design.angular-headless-accessible-components
name: Angular Headless Accessible Components
description: Route Angular custom interactive components to native HTML, Angular Aria, or CDK accessibility primitives by version and pattern complexity.
stack:
  - Angular
  - TypeScript
  - Accessibility
  - Angular Aria
  - Angular CDK
category: components
status: stable
version: 0.5.3
owner: NgAutoPilot
triggers:
  - Angular Aria
  - headless Angular component
  - accessible Angular design system
  - custom Angular control
compatibility:
  angular:
    min: "12"
    recommended: "17+"
    modern: "22+"
---

# Angular Headless Accessible Components

## Purpose

Build custom-branded Angular interactions without rebuilding keyboard, focus, ARIA, and screen-reader behavior from scratch.

## When to Use

- A custom Angular component needs complex keyboard or focus handling.
- A shared Angular design system needs accessible headless primitives.

## Do

- Detect Angular version and existing Material, CDK, and Aria dependencies before choosing an implementation.
- Use native HTML first; then use Angular Aria only where verified compatible and available, or CDK/proven libraries for older or lower-level requirements.
- Keep business state separate from interaction semantics; test keyboard, RTL, focus, screen readers, forms, and teardown.

## Do Not

- Do not install Angular Aria without version validation, break primitive DOM relationships, duplicate primitive keyboard handling, or expose private directive instances.

## Review Checklist

- [ ] Angular version and primitive compatibility are confirmed.
- [ ] Native-first decision and public labeling contract are explicit.
- [ ] Keyboard, RTL, focus, and screen-reader behavior pass.

## Expected Output

1. Native, Angular Aria, or CDK decision.
2. Component anatomy, imports, and typed public API.
3. Accessibility matrix and compatible fallback.

## References

- [Design Excellence Guide](../../../../docs/design-excellence-guide.md)

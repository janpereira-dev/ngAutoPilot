---
id: angular.design.angular-component-library-contracts
name: Angular Component Library Contracts
description: Define Angular component-library APIs, compatibility, theming, composition, testing, documentation, and consumer stability.
stack:
  - Angular
  - TypeScript
  - SCSS
  - Storybook
  - Design Systems
category: components
status: stable
version: 0.5.1
owner: NgAutoPilot
triggers:
  - Angular component library
  - Angular design system
  - reusable Angular components
  - component contract
compatibility:
  angular:
    min: "12"
    recommended: "17+"
    modern: "22+"
---

# Angular Component Library Contracts

## Purpose

Define production Angular component contracts covering public API, support range, theming, accessibility, testing, documentation, and migration.

## When to Use

- A shared Angular UI library is created, evolved, difficult to consume, theme, test, or upgrade.
- Product patterns are repeated across applications and need a stable contract.

## Do

- Define support matrix and forbidden syntax before standalone defaults, signal APIs, control flow, host directives, Aria, or packaging conventions.
- Keep typed public APIs, intentional slots, semantic tokens, accessibility, state-complete stories, consumer builds, template type checks, and migration policy.
- Prefer public extension points over deep selectors and test every declared consumer range.

## Do Not

- Do not couple consumers to internal DOM or Material private classes, combine major upgrades with redesign, ship happy-path demos, or claim untested major support.

## Review Checklist

- [ ] Consumer support matrix and typed minimal API are explicit.
- [ ] Theming avoids deep selectors and default implementation is accessible.
- [ ] Critical states, consumer builds, tests, docs, and migration notes exist.

## Expected Output

1. Library component contract and compatibility matrix.
2. Public API, theming, story, and test specification.
3. Migration and release plan.

## References

- [Design Excellence Guide](../../../../docs/design-excellence-guide.md)

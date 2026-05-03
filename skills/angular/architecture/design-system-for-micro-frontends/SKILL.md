---
id: angular.architecture.design-system-for-micro-frontends
name: Design System for Micro-frontends
description: >
  Evaluates and designs design systems shared across Angular micro-frontends in Nx monorepos, focusing on reusable tokens, component contracts, accessibility, and visual consistency across remotes.
stack:
  - Angular
  - TypeScript
  - Nx
  - Design System
category: architecture
status: stable
version: 0.3.1
owner: NgAutoPilot
triggers:
  - design system for micro frontends
  - design system for micro-frontends
  - shared design system
  - design tokens
  - component library
  - ui kit for remotes
  - shell and remote design
  - shared visual language
  - micro frontends design system
compatibility:
  angular:
    min: "2"
    signalInputsFrom: "17"
    recommendedModern: "17+"
---

# Design System for Micro-frontends

## Purpose

Use this skill to evaluate or design the design system shared by Angular micro-frontends.

Micro-frontends need a shared visual language, or the user experience fragments immediately. The design system should provide reusable tokens, components, and accessibility guidance without becoming a home for business logic.

The core rule is simple:

```txt
Design system owns consistency.
Micro-frontends own domain behavior.
```

## When to Use

Use this skill when:

- multiple remotes need the same visual language
- the shell and remotes must look cohesive
- design tokens or base components need governance
- UI fragmentation is becoming a risk
- accessibility and theming must stay consistent across teams

## Do

Provide reusable primitives:

```txt
- design tokens
- typography
- color system
- spacing scale
- buttons
- forms
- overlays
- feedback states
- accessibility patterns
```

Keep the library domain-agnostic:

```ts
@Component({
  selector: "ds-button",
  template: `<button class="ds-button"><ng-content /></button>`,
})
export class ButtonComponent {}
```

Document versioning and breaking changes:

```txt
Token version:
Component version:
Breaking change policy:
Migration notes:
```

Enforce consistent usage across remotes:

```txt
shared/ui -> presentational contracts
design-system -> tokens and base components
remotes -> domain-specific composition
```

## Do Not

Avoid business logic in the design system.

Avoid remote-specific hacks that bypass shared tokens.

Avoid making the design system depend on a single app or domain.

Avoid hidden coupling between the design system and remote data flows.

## Review Checklist

- [ ] The design system is domain-agnostic.
- [ ] Tokens and components are reusable across remotes.
- [ ] Accessibility is part of the contract.
- [ ] Versioning and breaking changes are documented.
- [ ] The design system does not own business behavior.
- [ ] Remotes consume the design system consistently.

## Expected Output

When this skill is used, the agent should:

1. Identify the shared visual and interaction language.
2. Separate tokens and base components from domain code.
3. Recommend reusable patterns for remotes and shell.
4. Flag visual fragmentation or local overrides.
5. Suggest versioning and migration guidance for UI changes.

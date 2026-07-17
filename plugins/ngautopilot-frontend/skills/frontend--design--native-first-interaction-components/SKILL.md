---
id: frontend.design.native-first-interaction-components
name: Native First Interaction Components
description: Choose native HTML semantics before custom widgets and define safe escalation to verified accessibility primitives.
stack:
  - Frontend
  - HTML
  - Accessibility
category: accessibility
status: stable
version: 0.5.2
owner: NgAutoPilot
triggers:
  - native HTML component
  - custom control accessibility
  - button link semantics
  - interactive component
---

# Native First Interaction Components

## Purpose

Preserve browser semantics, focus, forms, keyboard behavior, and assistive-technology support before considering custom widgets.

## When to Use

- An interactive component uses click or keyboard logic on a non-native element.
- Buttons, links, inputs, dialogs, disclosures, lists, tables, or custom controls are introduced or changed.

## Do

- Identify semantic role and native element first, then enhance through styling or attribute-selector components.
- Preserve labels, form participation, disabled behavior, focus, keyboard handling, DOM order, and visible focus.
- Escalate only to proven ARIA or headless patterns when native behavior cannot satisfy requirements; test name, role, state, keyboard, touch, and high contrast.

## Do Not

- Do not rebuild native button behavior with `div`, add conflicting ARIA, remove focus styling, or hide disclosure markers without verification.

## Review Checklist

- [ ] Native decision or escalation rationale is documented.
- [ ] Accessible name, role, value/state, focus order, and keyboard behavior pass.
- [ ] Touch target meets project requirements.

## Expected Output

1. Semantic element decision.
2. Escalation and keyboard/focus contract.
3. Accessibility test checklist.

## References

- [Design Excellence Guide](../../../../docs/design-excellence-guide.md)

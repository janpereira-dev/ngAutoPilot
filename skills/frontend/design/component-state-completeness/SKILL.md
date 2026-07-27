---
id: frontend.design.component-state-completeness
name: Component State Completeness
description: Define visual, behavioral, content, accessibility, and responsive contracts for every meaningful component state.
stack:
  - Frontend
  - Design Systems
  - Testing
category: components
status: stable
version: 0.5.3
owner: NgAutoPilot
triggers:
  - component states
  - loading empty error states
  - component matrix
  - design system completeness
---

# Component State Completeness

## Purpose

Prevent happy-path components that fail under production state, content, accessibility, and responsive conditions.

## When to Use

- Reusable components or stories cover default variants but omit async, permission, validation, or interaction states.
- Bugs occur around disabled, loading, empty, error, or recovery behavior.

## Do

- Create a state matrix with precedence for applicable default, focus, selected, disabled, read-only, loading, success, warning, error, empty, offline, permission, and skeleton states.
- Define copy, live announcements, focus, recovery, transitions, and layout stability.
- Add deterministic stories and tests for all critical states.

## Do Not

- Do not erase context behind spinners, confuse disabled with read-only, show unknown-shape skeletons, or allow conflicting statuses.

## Review Checklist

- [ ] Critical state matrix and precedence are explicit.
- [ ] Keyboard and screen-reader behavior exists per state.
- [ ] Stories and tests cover blocker states without damaging layout shifts.

## Expected Output

1. State and transition matrix.
2. Content, accessibility, and responsive requirements.
3. Required stories and tests.

## References

- [Design Excellence Guide](../../../../docs/design-excellence-guide.md)

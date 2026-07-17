---
id: angular.signals.angular-v22-signals-state-and-forms
name: Angular v22 Signals State and Forms
description: >
  Use this skill when Angular 22 code needs signal-driven state, computed derivations, or signal-form integration.
stack:
  - Angular
  - TypeScript
category: signals
status: stable
version: 0.5.2
owner: NgAutoPilot
triggers:
  - signals
  - computed
  - effect
  - signal forms
  - resource
  - httpResource
compatibility:
  angular:
    min: "22"
---

# Angular v22 Signals State and Forms

## Purpose

Use this skill when Angular 22 code needs signal-driven state, computed derivations, or signal-form integration.

## When to Use

Use this skill when:

- The app already uses signals or is moving toward them.
- You need to model local state, derived state, or signal-form state in v22.
- Async state should stay simple in the component model.

## When Not to Use

Do not use this skill when:

- The task is only about a single resource fetch.
- The task is a forms-only migration.
- The project is not ready for signal-first state yet.

## Required Inputs

- signal state owners
- computed and effect usage
- resource or httpResource usage
- consumer contracts

## Procedure

1. Map synchronous and asynchronous state separately.
2. Keep derived values in computed signals.
3. Separate local UI state from async resource state.

## Do

- Prefer clear signal boundaries.
- Keep the model explicit and testable.
- Use signal forms when the form model is signal-native.

## Do Not

- Do not expose unstable reactive contracts.
- Do not move unrelated imperative code into signals just because the app is on v22.
- Do not blur resource data and local UI state.

## Review Checklist

- [ ] Signal boundaries are explicit.
- [ ] Async state is modeled intentionally.
- [ ] Tests cover the changed behavior.

## Expected Output

When this skill is used, the agent should:

1. A signal-state summary.
2. The chosen reactive model.
3. Any remaining migration risks.

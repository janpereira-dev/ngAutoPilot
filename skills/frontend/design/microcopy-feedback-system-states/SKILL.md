---
id: frontend.design.microcopy-feedback-system-states
name: Microcopy and Feedback System States
description: Define clear labels, validation, loading feedback, empty states, errors, confirmations, and recovery actions for product interfaces.
stack:
  - Frontend
  - Content Design
  - UX
category: usability
status: stable
version: 0.5.2
owner: NgAutoPilot
triggers:
  - microcopy
  - error messages
  - empty states
  - loading copy
  - user feedback
---

# Microcopy and Feedback System States

## Purpose

Help users understand action, consequence, current state, and recovery without generic, blaming, or implementation-leaking language.

## When to Use

- Forms, asynchronous work, errors, empty states, permissions, destructive actions, or onboarding are involved.
- Labels are vague, inconsistent, or omit persistence feedback.

## Do

- Inventory labels, guidance, validation, loading, success, warning, error, empty, offline, permission, and destructive-action copy.
- Use user-domain vocabulary and outcome verbs; explain what happened, safe cause, and recovery.
- Preserve input, differentiate empty-first-use from empty-filtered and error states, and test localization and screen-reader order.

## Do Not

- Do not use generic errors where safer specificity exists, blame users, expose internals, or label unrelated actions `Continue`.

## Review Checklist

- [ ] Critical states provide meaningful copy and a next action.
- [ ] Labels work outside visual context and announcements avoid noise.
- [ ] Copy survives narrow layouts and translation expansion.

## Expected Output

1. State-copy matrix.
2. Rewritten messages and terminology rules.
3. Localization and accessibility risks.

## References

- [Design Excellence Guide](../../../../docs/design-excellence-guide.md)

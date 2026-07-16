---
id: frontend.accessibility.inclusive-ui-foundations
name: Inclusive UI Foundations
description: Build and review accessible frontend flows with semantic structure, keyboard operation, readable error feedback, and resilient content.
stack:
  - HTML
  - CSS
  - JavaScript
category: accessibility
status: stable
version: 0.5.1
owner: NgAutoPilot
triggers:
  - accessibility review
  - keyboard navigation
  - form errors
  - semantic HTML
  - screen reader
---

# Inclusive UI Foundations

## Purpose

Provide a practical, framework-neutral baseline for interfaces that remain understandable and operable with keyboard, assistive technology, zoom, and user-selected preferences.

## When to Use

Use this skill when:

- a user flow adds or changes forms, tables, navigation, dialogs, or status feedback;
- a review identifies unclear focus order, non-semantic controls, or inaccessible validation;
- responsive work could hide content, truncate meaning, or break at text zoom.

Route Angular component primitives to `angular.material.angular-aria-headless-patterns` or `angular.material.angular-cdk-a11y-patterns` when those APIs are involved.

## Do

- Start with native elements, labels, headings, landmarks, and table semantics before adding ARIA.
- Keep the tab order aligned with the visible and logical task order; make focus movement deliberate for overlays.
- Associate validation messages with their fields and announce task-level outcomes without repeatedly interrupting users.
- Test at increased text size and narrow widths; preserve access to full labels, values, and actions.
- Record manual keyboard and screen-reader findings as evidence, including browser and assistive-technology versions when known.

## Do Not

- Do not replace native controls with clickable generic elements when a native control exists.
- Do not use ARIA to compensate for an unclear interaction model.
- Do not require a particular screen reader, browser extension, cloud service, or design tool to use this skill.
- Do not claim conformance from an automated scan alone.

## Review Checklist

- [ ] Landmarks, headings, names, roles, and states match the user task.
- [ ] Every interactive path is operable with a keyboard and has visible focus.
- [ ] Errors, success, loading, and empty states communicate useful next actions.
- [ ] Zoom, reflow, and long localized content preserve meaning and controls.
- [ ] Automated and manual evidence are separated in the review record.

## Expected Output

When this skill is used, the agent should:

1. State the affected flow and the users or assistive scenarios considered.
2. List semantic, keyboard, feedback, and responsive changes separately.
3. Provide reproducible automated or manual validation evidence.
4. Identify remaining accessibility risks and the smallest follow-up.

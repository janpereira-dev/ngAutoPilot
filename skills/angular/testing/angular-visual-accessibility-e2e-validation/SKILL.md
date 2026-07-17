---
id: angular.testing.angular-visual-accessibility-e2e-validation
name: Angular Visual Accessibility E2E Validation
description: Validate Angular user journeys with evidence across behavior, keyboard access, automated accessibility signals, and stable visual checks when repository capabilities allow.
stack:
  - Angular
  - TypeScript
  - Testing
category: testing
status: stable
version: 0.5.2
owner: NgAutoPilot
triggers:
  - Angular E2E
  - visual regression
  - accessibility testing
  - Playwright
  - keyboard flow
---

# Angular Visual Accessibility E2E Validation

## Purpose

Validate an Angular user journey through the repository's actual test setup, combining functional checks with accessibility and visual evidence without assuming a particular Angular version, runner, browser, server, or GUI.

## When to Use

Use this skill when:

- an Angular change affects a critical cross-component journey or an interaction with visual and accessibility risk;
- a defect must be reproduced beyond an isolated component test;
- the repository already has an end-to-end or browser testing capability, or needs a documented manual validation path.

## Do

- Detect the installed Angular version, test runner, browser tooling, and available scripts before selecting a procedure.
- Reuse the existing test runner and project configuration; if Playwright is present, it may provide browser, screenshot, and accessibility integration, but it is optional.
- Validate keyboard navigation, focus restoration, labels, error feedback, and user-visible state transitions in the journey.
- Stabilize test data, viewport, locale, time, animation, and fonts before accepting visual snapshots.
- Keep evidence explicit: command output, runner version, manual checks, known browser conditions, and unresolved limitations.
- Route component-unit coverage to `angular.testing.angular-component-testing-patterns` and general test strategy to `angular.testing.angular-test-strategy-router`.

## Do Not

- Do not assume Angular 22 or any Angular release from this skill alone; inspect the project and use version-specific skills only when their evidence applies.
- Do not install Playwright, launch a development server, require a GUI, or add a visual baseline unless the repository already supports and approves it.
- Do not use automated accessibility output as conformance certification.
- Do not replace behavior assertions with screenshots or make platform-specific browser paths part of the test contract.

## Review Checklist

- [ ] Angular version and testing capabilities were detected before choosing tools.
- [ ] The critical journey and a relevant non-happy state are covered.
- [ ] Keyboard and focus behavior have manual or automated evidence.
- [ ] Visual checks use stable conditions or are explicitly excluded with reason.
- [ ] Commands, observations, and remaining gaps are recorded separately.

## Expected Output

When this skill is used, the agent should:

1. State detected Angular and test capabilities.
2. Define the journey, risk, and selected functional, accessibility, and visual checks.
3. Provide reproducible runner output or a manual validation procedure.
4. List evidence limits and the next smallest coverage improvement.

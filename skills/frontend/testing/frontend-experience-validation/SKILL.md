---
id: frontend.testing.frontend-experience-validation
name: Frontend Experience Validation
description: Gather evidence for critical frontend journeys across behavior, accessibility, visual regressions, network resilience, and performance without requiring a fixed test tool.
stack:
  - Frontend
  - Testing
  - Accessibility
category: testing
status: stable
version: 0.5.2
owner: NgAutoPilot
triggers:
  - visual regression
  - browser test
  - accessibility test
  - frontend E2E
  - user flow
---

# Frontend Experience Validation

## Purpose

Provide an evidence-first way to validate the user experience after frontend changes while respecting each repository's runner, browser setup, and delivery constraints.

## When to Use

Use this skill when:

- a change affects a critical user journey, visual composition, interaction state, or browser integration;
- an accessibility finding must be reproduced in a realistic flow;
- a team is selecting a smallest useful layer among unit, component, end-to-end, visual, and manual checks.

## Do

- Inspect the repository's existing test commands, fixtures, browser configuration, and CI constraints before adding coverage.
- Test the critical outcome and a relevant interruption such as validation, slow response, empty data, or retry.
- Use automated accessibility checks as a supplement to manual keyboard and semantic verification.
- Use visual snapshots only where fonts, data, viewport, animation, and rendering environment can be stabilized.
- Treat Playwright, Lighthouse, browser DevTools, and MCP integrations as optional capabilities: detect them, use the existing runner when available, and report a manual alternative when absent.

## Do Not

- Do not start a server, assume a GUI, install a browser package, or require cloud credentials without repository evidence and permission.
- Do not replace functional assertions with snapshots alone.
- Do not report a tool's absence as a product-quality pass or failure.
- Do not hard-code operating-system paths or browser executables.

## Review Checklist

- [ ] The selected test layer matches the changed risk.
- [ ] Test data, viewport, animation, and network assumptions are explicit.
- [ ] Automated findings and manual observations are reported separately.
- [ ] Existing runner and CI commands were reused where possible.
- [ ] Evidence includes failures, mitigations, and remaining gaps.

## Expected Output

When this skill is used, the agent should:

1. State the journey, risks, and chosen validation layers.
2. List detected capabilities and the exact commands or manual procedure used.
3. Report behavioral, accessibility, and visual evidence separately.
4. Identify coverage gaps without inventing unavailable tooling.

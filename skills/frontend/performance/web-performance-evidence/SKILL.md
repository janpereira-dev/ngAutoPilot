---
id: frontend.performance.web-performance-evidence
name: Web Performance Evidence
description: Improve frontend loading and interaction performance through measured user-path evidence, resource prioritization, rendering analysis, and explicit budgets.
stack:
  - Web Performance
  - CSS
  - JavaScript
category: performance
status: stable
version: 0.5.0
owner: NgAutoPilot
triggers:
  - core web vitals
  - performance budget
  - render blocking
  - image loading
  - bundle size
---

# Web Performance Evidence

## Purpose

Make frontend performance work measurable and user-path focused rather than driven by generic score chasing or a required auditing vendor.

## When to Use

Use this skill when:

- loading, rendering, interaction, image, font, CSS, or JavaScript cost affects a user journey;
- a change risks exceeding a bundle, request, or user-experience budget;
- a report identifies poor Core Web Vitals or inconsistent browser performance.

For Angular-specific budgets and framework optimizations, route to the existing Angular bundle-budget, Core Web Vitals, and performance skills.

## Do

- Establish a baseline using the repository's available telemetry, build output, synthetic test, or reproducible manual trace.
- Tie measurements to a route, device class, network condition, and user outcome.
- Prioritize removing unnecessary work, deferring non-critical work, and improving resource delivery before micro-optimizing code.
- Evaluate images, fonts, CSS, JavaScript, hydration, and third-party resources as separate contributors.
- Use Lighthouse, browser DevTools, and external monitoring only when available; record their versions and conditions as evidence.

## Do Not

- Do not claim field performance from a local synthetic score.
- Do not add compression, image, monitoring, or build dependencies without a demonstrated need.
- Do not set arbitrary budgets without a baseline, product impact, and ownership.
- Do not hide regressions by changing only the test environment or sampling conditions.

## Review Checklist

- [ ] Baseline and after measurements describe the same route and conditions.
- [ ] The largest contributors and their user impact are identified.
- [ ] Budgets, if used, are measurable in the existing build or delivery workflow.
- [ ] Optional performance tools are recorded as capabilities, not mandatory dependencies.
- [ ] Remaining uncertainty distinguishes lab and field evidence.

## Expected Output

When this skill is used, the agent should:

1. Summarize the user-path baseline and target.
2. List contributors, changes, and expected trade-offs.
3. Provide reproducible measurement evidence and conditions.
4. State budget ownership and follow-up risks.

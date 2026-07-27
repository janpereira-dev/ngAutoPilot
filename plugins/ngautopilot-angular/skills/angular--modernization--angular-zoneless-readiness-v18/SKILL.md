---
id: angular.modernization.angular-zoneless-readiness-v18
name: Angular Zoneless Readiness v18
description: >
  Prepare an Angular app for zoneless execution in bounded post-upgrade modernization slices after Angular 18 is stable. Use when reducing reliance on Zone.js timing, event patching assumptions, and implicit change detection behavior without mixing the work into a version hop.
stack:
  - Angular
  - TypeScript
category: modernization
status: stable
version: 0.5.3
owner: NgAutoPilot
triggers:
  - zoneless readiness
  - Zone.js reduction
  - zoneless modernization
  - change detection assumptions
compatibility:
  angular:
    min: "18"
---

# Angular Zoneless Readiness v18

## Purpose

Prepare an Angular app for zoneless execution in bounded modernization slices after Angular 18 is stable.

## When to Use

- The app is already on stable Angular 18.
- The team wants to reduce reliance on Zone.js patching or implicit timing.
- The change is modernization, not a version upgrade.

## When Not to Use

- The app is still in a version hop.
- The app relies on unreviewed Zone.js-driven behavior in critical flows.

## Required Inputs

- async flows
- change detection assumptions
- `setTimeout` / `setInterval` usage
- promise-based UI updates
- tests that rely on Zone.js timing

## Procedure

1. Select a bounded feature area.
2. Identify places that rely on implicit Zone.js timing.
3. Make change detection triggers explicit where needed.
4. Validate async flows, events, and tests.
5. Keep the scope small and reversible.

## Do

- Prefer incremental conversion.
- Make UI update triggers explicit.
- Validate task scheduling and tests.

## Do Not

- Do not remove Zone.js assumptions across the whole app in one pass.
- Do not mix this with a version hop.
- Do not hide failing async behavior behind retries.

## Review Checklist

- [ ] Slice is bounded.
- [ ] Async behavior is explicit.
- [ ] Tests pass.
- [ ] Remaining Zone.js dependency is documented.

## Expected Output

1. Slice prepared for zoneless behavior.
2. Remaining Zone.js assumptions.
3. Test result.
4. Follow-up list.

## Exit Criteria

- Adoption is incremental.
- The next slice is clear.

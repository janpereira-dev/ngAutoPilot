---
id: angular.upgrade.zone.angular-v21-zone-change-detection-root-provider
name: Angular v21 Zone Change Detection Root Provider
description: >
  Review Angular 21 apps that use provideZoneChangeDetection or Zone.js-based change detection. Use when root providers, scheduler behavior, or timing assumptions need explicit validation after an Angular 21 upgrade.
stack:
  - Angular
  - TypeScript
category: zone
status: stable
version: 0.4.0
owner: NgAutoPilot
triggers:
  - provideZoneChangeDetection
  - Zone.js
  - scheduler behavior
  - root provider
compatibility:
  angular:
    min: "21"
---

# Angular v21 Zone Change Detection Root Provider

## Purpose

Review Angular 21 change detection root provider usage.

## When to Use

- The app uses `provideZoneChangeDetection`.
- The app still depends on Zone.js-based scheduling.
- Timing-sensitive tests or UI flows exist.

## When Not to Use

- The app does not use zone-based change detection.
- The app is still in a version hop.

## Required Inputs

- bootstrap entry points
- root providers
- timing-sensitive tests
- async flows

## Procedure

1. Identify root provider setup.
2. Review timing assumptions.
3. Validate tests and async flows.

## Do

- Keep root provider behavior explicit.
- Validate timing-sensitive tests.

## Do Not

- Do not mix this with the version hop.

## Review Checklist

- [ ] Root provider setup is known.
- [ ] Timing-sensitive flows are reviewed.
- [ ] Tests pass.

## Expected Output

1. Root provider summary.
2. Timing risk summary.
3. Test result.

## Exit Criteria

- Zone change detection risk is explicit.

---
id: angular.upgrade.zoneless.angular-v20-zoneless-api-rename
name: Angular v20 Zoneless API Rename
description: >
  Migrate Angular zoneless APIs after an Angular 20 upgrade when applications use provideExperimentalZonelessChangeDetection or provideExperimentalCheckNoChangesForDebug. Use when transitioning to supported zoneless or check-no-changes APIs.
stack:
  - Angular
  - TypeScript
category: zoneless
status: stable
version: 0.5.3
owner: NgAutoPilot
triggers:
  - zoneless API rename
  - provideExperimentalZonelessChangeDetection
  - provideExperimentalCheckNoChangesForDebug
compatibility:
  angular:
    min: "20"
---

# Angular v20 Zoneless API Rename

## Purpose

Migrate Angular zoneless APIs after Angular 20.

## When to Use

- The app uses experimental zoneless or check-no-changes providers.
- The app is stable on Angular 20.

## When Not to Use

- The app does not use zoneless APIs.
- The app is still in a version hop.

## Required Inputs

- zoneless providers
- check-no-changes providers
- tests for the target slice

## Procedure

1. Identify experimental provider usage.
2. Replace with supported API names.
3. Validate tests.

## Do

- Keep provider names current.
- Validate test behavior.

## Do Not

- Do not keep experimental provider names in the target slice.
- Do not mix this with the version hop.

## Review Checklist

- [ ] Experimental provider names are removed.
- [ ] Tests pass.

## Expected Output

1. Zoneless API summary.
2. Provider updates.
3. Test result.

## Exit Criteria

- Zoneless API risk is explicit.

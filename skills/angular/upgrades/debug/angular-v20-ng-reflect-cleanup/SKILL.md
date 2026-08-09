---
id: angular.upgrade.debug.angular-v20-ng-reflect-cleanup
name: Angular v20 ng-reflect Cleanup
description: >
  Remove Angular debug-attribute dependencies after an Angular 20 upgrade when tests, e2e, or tools rely on ng-reflect-* attributes. Use when selectors or assertions depend on framework debug DOM and need to be migrated to stable contracts.
stack:
  - Angular
  - TypeScript
category: debug
status: stable
version: 0.6.0
owner: NgAutoPilot
triggers:
  - ng-reflect cleanup
  - debug attributes
  - e2e selectors
  - DOM contracts
compatibility:
  angular:
    min: "20"
---

# Angular v20 ng-reflect Cleanup

## Purpose

Remove Angular debug-attribute dependencies after Angular 20.

## When to Use

- Tests or e2e rely on `ng-reflect-*`.
- The app is stable on Angular 20.

## When Not to Use

- The app does not rely on debug attributes.
- The app is still in a version hop.

## Required Inputs

- tests
- e2e selectors
- debug attribute usage
- stable data-testid contracts

## Procedure

1. Identify debug-attribute dependencies.
2. Replace them with stable selectors or assertions.
3. Add temporary debug attributes only if absolutely needed.
4. Validate tests and e2e.

## Do

- Prefer stable DOM contracts.
- Keep removal plans explicit.

## Do Not

- Do not use ng-reflect as a public contract.
- Do not mix this with the version hop.

## Review Checklist

- [ ] Debug-attribute usage is identified.
- [ ] Stable selectors replace it.
- [ ] Tests pass.

## Expected Output

1. Debug attribute cleanup summary.
2. Selector updates.
3. Test result.

## Exit Criteria

- ng-reflect dependency is explicit or removed.

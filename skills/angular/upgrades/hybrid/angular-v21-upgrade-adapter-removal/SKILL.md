---
id: angular.upgrade.hybrid.angular-v21-upgrade-adapter-removal
name: Angular v21 Upgrade Adapter Removal
description: >
  Remove AngularJS upgrade adapter usage after an Angular 21 upgrade when hybrid applications still reference UpgradeAdapter or legacy upgrade APIs. Use when the project still combines AngularJS and Angular and needs an explicit compatibility cleanup.
stack:
  - Angular
  - TypeScript
category: hybrid
status: draft
version: 0.3.0
owner: NgAutoPilot
triggers:
  - UpgradeAdapter
  - AngularJS hybrid
  - upgrade/static
  - hybrid cleanup
compatibility:
  angular:
    min: "21"
---

# Angular v21 Upgrade Adapter Removal

## Purpose

Remove AngularJS upgrade adapter usage after Angular 21.

## When to Use

- The app is a hybrid AngularJS/Angular app.
- The app still uses legacy upgrade APIs.

## When Not to Use

- The app is not a hybrid app.
- The app is still in a version hop.

## Required Inputs

- hybrid bootstrap
- upgrade APIs
- downgraded components
- AngularJS services

## Procedure

1. Identify legacy upgrade APIs.
2. Replace them with supported static upgrade APIs.
3. Validate hybrid bootstrap and downgraded components.

## Do

- Keep hybrid behavior explicit.
- Validate downgraded component integration.

## Do Not

- Do not keep UpgradeAdapter.
- Do not mix this with the version hop.

## Review Checklist

- [ ] Legacy upgrade APIs are removed.
- [ ] Hybrid bootstrap works.
- [ ] Tests pass.

## Expected Output

1. Hybrid cleanup summary.
2. API replacement summary.
3. Test result.

## Exit Criteria

- Hybrid risk is explicit.

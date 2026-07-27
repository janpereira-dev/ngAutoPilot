---
id: angular.upgrade.angularjs.angularjs-downgrade-upgrade-api-bridge
name: AngularJS Downgrade and Upgrade API Bridge
description: >
  Manage downgradeComponent, downgradeInjectable, UpgradeComponent, and related ngUpgrade bridge APIs during AngularJS and Angular coexistence.
stack:
  - Angular
  - AngularJS
category: angularjs
status: stable
version: 0.5.3
owner: NgAutoPilot
triggers:
  - downgradeComponent
  - downgradeInjectable
  - UpgradeComponent
  - ngUpgrade bridge APIs
compatibility:
  angular:
    min: "2"
---

# AngularJS Downgrade and Upgrade API Bridge

## Purpose

Manage bridge APIs used between AngularJS and Angular.

## When to Use

- The app uses downgrade or upgrade bridge APIs.
- Components or services are shared across frameworks.

## When Not to Use

- No bridge APIs are used.
- The app is already single-framework.

## Required Inputs

- bridge registrations
- component downgrade list
- service upgrade list

## Procedure

1. Inventory all bridge APIs.
2. Validate each bridge contract.
3. Remove unused bridge registrations.

## Do

- Keep bridges explicit.
- Remove dead bridge code early.

## Do Not

- Do not leave bridge registration untested.

## Review Checklist

- [ ] Bridge APIs inventoried.
- [ ] Contracts validated.
- [ ] Unused bridges removed.

## Expected Output

1. Bridge inventory.
2. Migration risk summary.

## Exit Criteria

- Bridge usage is explicit and stable.

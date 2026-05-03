---
id: angular.upgrade.angularjs.angularjs-service-to-injectable-migration
name: AngularJS Service to Injectable Migration
description: >
  Move AngularJS services to Angular injectable services during migration. Use when stateful or shared business logic should leave the AngularJS dependency graph.
stack:
  - Angular
  - AngularJS
category: angularjs
status: draft
version: 0.3.0
owner: NgAutoPilot
triggers:
  - AngularJS service migration
  - service to injectable
  - legacy service
compatibility:
  angular:
    min: "2"
---

# AngularJS Service to Injectable Migration

## Purpose

Convert AngularJS services to Angular injectables.

## When to Use

- Shared logic still lives in AngularJS services.
- The app is moving business logic into Angular.

## When Not to Use

- The service is already an Angular injectable.
- No shared logic migration is required.

## Required Inputs

- service definitions
- injection points
- state persistence needs

## Procedure

1. Identify service responsibilities.
2. Create Angular injectables with explicit dependencies.
3. Validate service consumers.

## Do

- Keep injectable contracts clear.
- Move framework-agnostic logic first.

## Do Not

- Do not keep AngularJS-specific globals in new services.

## Review Checklist

- [ ] Service responsibilities inventoried.
- [ ] Injectable replacement defined.
- [ ] Consumers migrated.

## Expected Output

1. Service migration summary.
2. Injectable mapping.

## Exit Criteria

- AngularJS service is no longer needed.

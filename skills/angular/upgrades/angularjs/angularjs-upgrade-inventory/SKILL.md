---
id: angular.upgrade.angularjs.angularjs-upgrade-inventory
name: AngularJS Upgrade Inventory
description: >
  Inventory AngularJS applications before migration to Angular. Use when the repo still contains controllers, scopes, directives, filters, services, routes, templates, or ngUpgrade artifacts that must be mapped before a hybrid or full Angular migration.
stack:
  - Angular
  - AngularJS
category: angularjs
status: draft
version: 0.3.0
owner: NgAutoPilot
triggers:
  - AngularJS inventory
  - ngUpgrade inventory
  - legacy AngularJS app
  - hybrid migration planning
compatibility:
  angular:
    min: "2"
---

# AngularJS Upgrade Inventory

## Purpose

Inventory AngularJS code before migration.

## When to Use

- The repo still contains AngularJS code.
- The app is moving to Angular or a hybrid architecture.

## When Not to Use

- The app has no AngularJS code.
- The app is already fully migrated.

## Required Inputs

- AngularJS modules
- controllers
- services
- directives
- filters
- routes
- templates
- tests

## Procedure

1. Identify AngularJS modules and dependencies.
2. Inventory controllers, directives, services, filters, and routes.
3. Group by migration risk.

## Do

- Keep a clear inventory.
- Identify hybrid dependencies early.

## Do Not

- Do not change behavior during inventory.

## Review Checklist

- [ ] Controllers inventoried.
- [ ] Directives inventoried.
- [ ] Services inventoried.
- [ ] Filters inventoried.
- [ ] Routes inventoried.

## Expected Output

1. AngularJS inventory.
2. Risk-ranked map.

## Exit Criteria

- Inventory is complete.

---
id: angular.upgrade.angularjs.angularjs-routing-hybrid-migration
name: AngularJS Routing Hybrid Migration
description: >
  Move routing from AngularJS to a hybrid Angular and AngularJS setup when both frameworks must coexist during migration. Use when route ownership is split and navigation needs explicit bridge handling.
stack:
  - Angular
  - AngularJS
category: angularjs
status: stable
version: 0.5.1
owner: NgAutoPilot
triggers:
  - AngularJS routing migration
  - hybrid routing
  - ui-router bridge
  - Angular Router coexistence
compatibility:
  angular:
    min: "2"
---

# AngularJS Routing Hybrid Migration

## Purpose

Coordinate route migration between AngularJS and Angular.

## When to Use

- AngularJS and Angular routes coexist.
- Navigation must cross framework boundaries.

## When Not to Use

- Only one router remains.
- Routing is already fully migrated.

## Required Inputs

- route tables
- route ownership map
- navigation guards or resolves

## Procedure

1. Inventory route ownership.
2. Define bridge navigation rules.
3. Validate route transitions.

## Do

- Keep ownership explicit.
- Validate deep links and redirects.

## Do Not

- Do not leave route ownership ambiguous.

## Review Checklist

- [ ] Route ownership mapped.
- [ ] Bridge navigation validated.
- [ ] Deep links work.

## Expected Output

1. Routing migration summary.
2. Route ownership map.

## Exit Criteria

- Routing is stable across framework boundaries.

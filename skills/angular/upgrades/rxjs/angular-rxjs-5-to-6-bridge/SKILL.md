---
id: angular.upgrade.rxjs.angular-rxjs-5-to-6-bridge
name: Angular RxJS 5 to 6 Bridge
description: >
  Bridge Angular projects from RxJS 5 to RxJS 6, including compat package review, operator changes, and import cleanup.
stack:
  - Angular
  - TypeScript
category: rxjs
status: draft
version: 0.1.0
owner: NgAutoPilot
triggers:
  - RxJS 5 to 6
  - rxjs-compat
  - lettable operators
compatibility:
  angular:
    min: "6"
---

# Angular RxJS 5 to 6 Bridge

## Purpose

Bridge Angular projects from RxJS 5 to RxJS 6.

## When to Use

- The app still depends on RxJS 5 patterns.
- The project needs a bridge before Angular 6+.

## When Not to Use

- The app already uses RxJS 6+ imports and operators.
- No RxJS 5 compatibility code remains.

## Required Inputs

- package.json
- RxJS imports
- operator usage
- compat package usage

## Procedure

1. Identify RxJS 5 import patterns.
2. Replace them with pipeable operators and RxJS 6 imports.
3. Remove compat dependencies when possible.

## Do

- Keep compatibility scope explicit.
- Remove deprecated import style gradually.

## Do Not

- Do not keep `rxjs-compat` indefinitely.

## Review Checklist

- [ ] RxJS imports updated.
- [ ] Pipeable operators used.
- [ ] Compat package reviewed.

## Expected Output

1. RxJS bridge summary.
2. Remaining compat risks.

## Exit Criteria

- RxJS 5 compatibility is no longer required.

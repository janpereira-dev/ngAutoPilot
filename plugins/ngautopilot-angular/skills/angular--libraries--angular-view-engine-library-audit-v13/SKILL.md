---
id: angular.libraries.angular-view-engine-library-audit-v13
name: Angular View Engine Library Audit v13
description: >
  Audit Angular libraries for View Engine compatibility before Angular 13 and later upgrades. Use when ngcc or View Engine metadata could still affect the upgrade path.
stack:
  - Angular
  - TypeScript
category: libraries
status: stable
version: 0.4.0
owner: NgAutoPilot
triggers:
  - View Engine libraries
  - ngcc audit
  - Angular library compatibility
compatibility:
  angular:
    min: "13"
---

# Angular View Engine Library Audit v13

## Purpose

Audit Angular libraries for View Engine compatibility.

## When to Use

- The app uses Angular libraries.
- Angular 13+ is the target.

## When Not to Use

- No Angular libraries are used.

## Required Inputs

- libraries
- ngcc status
- metadata artifacts

## Procedure

1. Inventory libraries.
2. Identify View Engine blockers.
3. Validate Angular 13+ readiness.

## Do

- Keep blockers explicit.

## Do Not

- Do not keep ngcc as a workaround.

## Review Checklist

- [ ] Library compatibility is explicit.
- [ ] Blockers are listed.

## Expected Output

1. Library audit summary.

## Exit Criteria

- Library readiness is explicit.

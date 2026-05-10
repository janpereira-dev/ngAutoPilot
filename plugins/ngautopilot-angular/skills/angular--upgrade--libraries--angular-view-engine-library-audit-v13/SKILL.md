---
id: angular.upgrade.libraries.angular-view-engine-library-audit-v13
name: Angular View Engine Library Audit v13
description: >
  Audit Angular libraries for View Engine compatibility before Angular 13 or later. Use when package dependencies may still require ngcc or old metadata formats.
stack:
  - Angular
  - TypeScript
category: libraries
status: stable
version: 0.4.0
owner: NgAutoPilot
triggers:
  - View Engine library audit
  - ngcc audit
  - Angular library compatibility
compatibility:
  angular:
    min: "13"
---

# Angular View Engine Library Audit v13

## Purpose

Audit libraries for View Engine compatibility.

## When to Use

- The project depends on third-party Angular libraries.
- The upgrade path may cross Angular 13.

## When Not to Use

- No Angular libraries are present.
- Library compatibility is already known.

## Required Inputs

- package.json
- lockfile
- library metadata

## Procedure

1. Identify library packages.
2. Check for View Engine or ngcc dependence.
3. Block or approve the upgrade.

## Do

- Keep compatibility explicit.
- Document library risk.

## Do Not

- Do not assume libraries are Ivy-compatible.

## Review Checklist

- [ ] Library list is known.
- [ ] View Engine risk checked.
- [ ] Decision recorded.

## Expected Output

1. Library audit summary.
2. Blockers list.

## Exit Criteria

- Library compatibility is explicit.

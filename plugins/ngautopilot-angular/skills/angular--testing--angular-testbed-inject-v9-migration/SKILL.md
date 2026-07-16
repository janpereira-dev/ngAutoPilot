---
id: angular.testing.angular-testbed-inject-v9-migration
name: Angular TestBed Inject v9 Migration
description: >
  Replace TestBed.get with TestBed.inject in Angular tests. Use when older tests still rely on TestBed.get and need a small, controlled modernization step.
stack:
  - Angular
  - TypeScript
category: testing
status: stable
version: 0.5.1
owner: NgAutoPilot
triggers:
  - TestBed.get
  - TestBed.inject
  - test modernization
compatibility:
  angular:
    min: "9"
---

# Angular TestBed Inject v9 Migration

## Purpose

Replace `TestBed.get` with `TestBed.inject`.

## When to Use

- Tests still use `TestBed.get`.
- The change is part of Angular 9-era testing cleanup.

## When Not to Use

- Tests already use `TestBed.inject`.

## Required Inputs

- test files
- test helpers
- injection patterns

## Procedure

1. Find `TestBed.get` calls.
2. Replace them with `TestBed.inject`.
3. Validate tests.

## Do

- Keep test changes narrow.
- Preserve explicit injection patterns.

## Do Not

- Do not mix with unrelated test rewrites.

## Review Checklist

- [ ] `TestBed.get` is removed.
- [ ] Tests compile.
- [ ] Tests pass.

## Expected Output

1. Testing API migration summary.
2. Validation result.

## Exit Criteria

- Tests use `TestBed.inject`.

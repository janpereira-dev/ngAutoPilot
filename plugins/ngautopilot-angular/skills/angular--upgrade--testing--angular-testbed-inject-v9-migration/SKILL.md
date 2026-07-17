---
id: angular.upgrade.testing.angular-testbed-inject-v9-migration
name: Angular TestBed.inject v9 Migration
description: >
  Replace TestBed.get with TestBed.inject during Angular 9 modernization and related testing cleanup.
stack:
  - Angular
  - TypeScript
category: testing
status: stable
version: 0.5.2
owner: NgAutoPilot
triggers:
  - TestBed.get
  - TestBed.inject
  - testing migration
compatibility:
  angular:
    min: "9"
---

# Angular TestBed.inject v9 Migration

## Purpose

Replace TestBed.get with TestBed.inject.

## When to Use

- Tests still call `TestBed.get`.
- The project is upgrading around Angular 9.

## When Not to Use

- Tests already use `TestBed.inject`.
- No testing API cleanup is needed.

## Required Inputs

- test files
- test helpers
- injection patterns

## Procedure

1. Find `TestBed.get` calls.
2. Replace them with `TestBed.inject`.
3. Run tests.

## Do

- Keep test injection explicit.
- Validate type safety.

## Do Not

- Do not keep deprecated test APIs.

## Review Checklist

- [ ] `TestBed.get` removed.
- [ ] Tests compile.
- [ ] Tests pass.

## Expected Output

1. Testing API migration summary.
2. Validation result.

## Exit Criteria

- `TestBed.get` is no longer used.

---
id: testing.angular-testbed-inject-v9-migration
name: Angular TestBed Inject v9 Migration
description: >
  Replace TestBed.get with TestBed.inject in Angular tests. Use when older tests still rely on TestBed.get and need a small, controlled modernization step.
stack:
  - Angular
  - TypeScript
category: testing
status: draft
version: 0.1.0
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

## When Not to Use

- Tests already use `TestBed.inject`.

## Required Inputs

- test files

## Procedure

1. Replace `TestBed.get`.
2. Validate tests.

## Do

- Keep test changes narrow.

## Do Not

- Do not mix with unrelated test rewrites.

## Review Checklist

- [ ] `TestBed.get` is removed.
- [ ] Tests pass.

## Expected Output

1. TestBed migration summary.

## Exit Criteria

- Tests use `TestBed.inject`.

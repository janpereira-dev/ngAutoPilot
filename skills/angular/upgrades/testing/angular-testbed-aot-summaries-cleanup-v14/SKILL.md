---
id: angular.upgrade.testing.angular-testbed-aot-summaries-cleanup-v14
name: Angular TestBed AOT Summaries Cleanup v14
description: >
  Remove obsolete TestBed AOT summary assumptions before or during Angular 14 migration.
stack:
  - Angular
  - TypeScript
category: testing
status: stable
version: 0.5.3
owner: NgAutoPilot
triggers:
  - TestBed AOT summaries
  - aotSummaries
  - testing cleanup
compatibility:
  angular:
    min: "14"
---

# Angular TestBed AOT Summaries Cleanup v14

## Purpose

Remove obsolete AOT summary assumptions from tests.

## When to Use

- Tests still rely on AOT summaries.
- The project is moving around Angular 14.

## When Not to Use

- No AOT summary assumptions remain.
- TestBed usage is already modern.

## Required Inputs

- test files
- TestBed setup
- AOT-related helpers

## Procedure

1. Find AOT summary assumptions.
2. Remove or replace them with modern TestBed usage.
3. Validate tests.

## Do

- Keep tests explicit.
- Remove obsolete assumptions.

## Do Not

- Do not preserve summary-specific hacks.

## Review Checklist

- [ ] AOT summary assumptions removed.
- [ ] Tests compile.
- [ ] Tests pass.

## Expected Output

1. Testing cleanup summary.
2. Validation result.

## Exit Criteria

- AOT summary assumptions are gone.

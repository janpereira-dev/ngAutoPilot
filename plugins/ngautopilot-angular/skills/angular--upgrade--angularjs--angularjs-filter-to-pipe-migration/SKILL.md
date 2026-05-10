---
id: angular.upgrade.angularjs.angularjs-filter-to-pipe-migration
name: AngularJS Filter to Pipe Migration
description: >
  Replace AngularJS filters with Angular pipes or component logic during migration. Use when template filters hide presentation rules that should become explicit Angular behavior.
stack:
  - Angular
  - AngularJS
category: angularjs
status: stable
version: 0.4.0
owner: NgAutoPilot
triggers:
  - AngularJS filter migration
  - filter to pipe
  - legacy filter
compatibility:
  angular:
    min: "2"
---

# AngularJS Filter to Pipe Migration

## Purpose

Convert AngularJS filters to Angular pipes or component logic.

## When to Use

- Templates rely on AngularJS filters.
- Presentation logic should be reusable in Angular.

## When Not to Use

- The filter is not used in templates.
- The app already uses Angular pipes.

## Required Inputs

- filter definitions
- template usage
- formatting rules

## Procedure

1. Identify filters and call sites.
2. Implement Angular pipes or component methods.
3. Validate output formatting.

## Do

- Keep formatting behavior explicit.
- Prefer reusable pipes for shared formatting.

## Do Not

- Do not keep business rules hidden in template filters.

## Review Checklist

- [ ] Filter usage inventoried.
- [ ] Pipe or method replacement defined.
- [ ] Outputs validated.

## Expected Output

1. Filter migration summary.
2. Validation notes.

## Exit Criteria

- AngularJS filters are removed from migrated views.

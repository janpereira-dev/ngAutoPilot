---
id: angular.upgrades.material.angular-material-mdc-v15-testing-harnesses
name: Angular Material MDC v15 Testing Harnesses
description: >
  Updates Angular Material tests and harnesses that rely on legacy DOM structure or internal selectors during the MDC migration.
stack:
  - Angular
  - TypeScript
category: material
status: stable
version: 0.5.1
owner: NgAutoPilot
triggers:
  - Material harnesses
  - DOM-based Material tests
  - screenshot tests
  - MDC tests
compatibility:
  angular:
    min: "15"
---

# Angular Material MDC v15 Testing Harnesses

## Purpose

Use this skill to repair Material tests and harnesses affected by MDC DOM changes.

## When to Use

- The project has Material harnesses.
- The project has tests that query `.mat-` DOM internals.
- The project has screenshot or visual regression tests.
- The project uses Protractor, Cypress, Playwright, or Karma tests against Material internals.

## When Not to Use

- The project does not test Material internals.
- The task is only a template migration.

## Required Inputs

- Material tests
- Harness tests
- Screenshot/golden tests
- DOM selectors

## Procedure

1. Inventory fragile tests.
2. Replace internal selectors with harnesses where possible.
3. Update assertions for MDC DOM and class changes.
4. Run test suites and record failures.

## Do

- Prefer harnesses over DOM internals.
- Update screenshot baselines only after review.
- Keep test scope bounded.

## Do Not

- Do not accept brittle selectors without review.
- Do not silently rewrite snapshots.

## Review Checklist

- [ ] Fragile tests are identified.
- [ ] Harness updates are complete.
- [ ] Screenshot diffs are reviewed.
- [ ] Test suites pass or are blocked with reasons.

## Expected Output

1. Fragile test inventory.
2. Harness updates.
3. Screenshot review result.
4. Remaining test risk list.

## Exit Criteria

- Material tests are validated.
- Remaining risk is documented.

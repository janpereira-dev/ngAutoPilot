---
id: angular.upgrade.material.angular-material-mdc-v15-visual-regression-gate
name: Angular Material MDC v15 Visual Regression Gate
description: >
  Enforces final visual review for Angular Material v15 MDC migration before the migration can be considered complete.
stack:
  - Angular
  - TypeScript
category: material
status: draft
version: 0.1.0
owner: NgAutoPilot
triggers:
  - Material visual regression
  - screenshot review
  - MDC final gate
compatibility:
  angular:
    min: "15"
---

# Angular Material MDC v15 Visual Regression Gate

## Purpose

Use this skill to close the Material MDC migration with an explicit visual review decision.

## When to Use

- The MDC migration slice is complete.
- The project has screenshots, smoke tests, or QA review.
- A final accept/block decision is needed.

## When Not to Use

- The MDC migration slice is not complete.
- No visual review evidence exists.

## Required Inputs

- Screenshot diffs
- Visual smoke test results
- Critical Material screens
- QA notes

## Procedure

1. Review the critical screens.
2. Compare expected and actual visual output.
3. Document accepted and rejected changes.
4. Decide whether MDC migration can close.

## Do

- Review login, forms, dialogs, tables, tabs, menus, chips, slider, and overlay-heavy screens.
- Treat unexplained visual diffs as blockers.

## Do Not

- Do not regenerate baselines without review.
- Do not close on compile success alone.

## Review Checklist

- [ ] Critical screens reviewed.
- [ ] Visual diffs explained.
- [ ] QA notes captured.
- [ ] Close/hold decision is explicit.

## Expected Output

1. Visual diff summary.
2. Accepted changes.
3. Rejected changes.
4. Final gate decision.

## Exit Criteria

- Visual review is complete.
- Final gate decision is explicit.

---
id: angular.forms.angular-number-input-min-max-validation-v12
name: Angular Number Input Min Max Validation v12
description: >
  Review Angular numeric inputs and min/max validation after Angular 12 when <input type="number"> behavior can affect form validity and submit flows.
stack:
  - Angular
  - TypeScript
category: forms
status: draft
version: 0.3.0
owner: NgAutoPilot
triggers:
  - number input min max
  - form validity
compatibility:
  angular:
    min: "12"
---

# Angular Number Input Min Max Validation v12

## Purpose

Review numeric input validation after Angular 12.

## When to Use

- The app uses numeric inputs with min/max.

## When Not to Use

- The app has no numeric input validation risk.

## Required Inputs

- numeric forms
- validation flows

## Procedure

1. Find min/max numeric inputs.
2. Validate submit behavior.

## Do

- Keep validation explicit.

## Do Not

- Do not remove domain rules to avoid validation changes.

## Review Checklist

- [ ] Numeric input behavior is validated.

## Expected Output

1. Number input summary.

## Exit Criteria

- Numeric validation risk is explicit.

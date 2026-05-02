---
id: angular.governance.angular-project-classifier
name: Angular Project Classifier
description: Classify the Angular project shape before any change: app, library, monorepo, SSR, hybrid, microfrontend, or legacy migration.
stack:
  - Angular
category: governance
status: stable
version: 0.1.0
owner: NgAutoPilot
triggers:
  - project classifier
  - app type
  - repo shape
---

# Angular Project Classifier

Use this skill before editing Angular code to identify the project shape and the likely risk surface.


## Expected Output

Return:

1. A concise diagnosis.
2. The minimal safe change or decision.
3. Validation steps.
4. Risks or rollback notes.

## Purpose

Describe the exact problem this skill solves.

## When to Use

Use this skill when this specific Angular workflow is needed.

## Do

- Apply the smallest safe change.
- Keep the workflow focused.

## Do Not

- Do not mix unrelated concerns.
- Do not expand the scope without need.

## Review Checklist

- [ ] The change is scoped correctly.
- [ ] The risk surface is understood.
- [ ] Validation is clear.

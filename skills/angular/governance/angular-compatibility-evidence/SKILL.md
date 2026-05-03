---
id: angular.governance.angular-compatibility-evidence
name: Angular Compatibility Evidence
description: Require version and dependency evidence before recommending or applying an Angular change.
stack:
  - Angular
category: governance
status: stable
version: 0.3.1
owner: NgAutoPilot
triggers:
  - compatibility evidence
  - version proof
  - matrix evidence
---

# Angular Compatibility Evidence

Use this skill to ground Angular decisions in observed version and dependency evidence.

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

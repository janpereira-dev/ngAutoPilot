---
id: angular.versioning.angular-cli-builder-compatibility
name: Angular CLI Builder Compatibility
description: Detect and gate the Angular CLI builder path, including browser, browser-esbuild, application, and custom builders.
stack:
  - Angular
category: versioning
status: stable
version: 0.3.0
owner: NgAutoPilot
triggers:
  - cli builder compatibility
  - builder compatibility
  - application builder
---

# Angular CLI Builder Compatibility

Use this skill to decide which Angular build system path is safe for the project.

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

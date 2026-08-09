---
id: angular.upgrade.build.angular-v20-module-resolution-bundler
name: Angular v20 Module Resolution Bundler
description: >
  Validate Angular 20 moduleResolution bundler compatibility after an Angular 20 upgrade when tsconfig inheritance, secondary entry points, custom builders, or monorepo tooling may break under bundler resolution.
stack:
  - Angular
  - TypeScript
category: build
status: stable
version: 0.6.0
owner: NgAutoPilot
triggers:
  - moduleResolution bundler
  - secondary entry points
  - custom builders
  - tsconfig inheritance
compatibility:
  angular:
    min: "20"
---

# Angular v20 Module Resolution Bundler

## Purpose

Validate Angular 20 `moduleResolution: "bundler"` compatibility.

## When to Use

- The project has custom tsconfig inheritance.
- The project has secondary entry points.
- The project has custom builders or monorepo tooling.

## When Not to Use

- The project already validated bundler resolution.
- The app is still in a version hop.

## Required Inputs

- base tsconfigs
- project tsconfigs
- path aliases
- secondary entry points
- custom builders
- test/build tooling

## Procedure

1. Inspect tsconfig inheritance.
2. Validate bundler resolution in app and libraries.
3. Review tooling and entry points.
4. Run build and library checks.

## Do

- Keep tsconfig overrides explicit.
- Validate secondary entry points.
- Review tooling compatibility.

## Do Not

- Do not leave conflicting moduleResolution values.
- Do not mix this with the version hop.

## Review Checklist

- [ ] moduleResolution is bundler.
- [ ] Overrides are consistent.
- [ ] Libraries build.
- [ ] Tests pass.

## Expected Output

1. moduleResolution summary.
2. Tooling compatibility summary.
3. Test/build result.

## Exit Criteria

- Bundler resolution risk is explicit.

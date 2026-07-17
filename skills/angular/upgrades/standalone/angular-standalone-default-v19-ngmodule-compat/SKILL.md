---
id: angular.upgrade.standalone.angular-standalone-default-v19-ngmodule-compat
name: Angular Standalone Default v19 NgModule Compatibility
description: >
  Review Angular 19 standalone-by-default compatibility for NgModule-heavy apps after an Angular 19 upgrade when declarations, imports, shared modules, or library modules still rely on NgModule wiring. Use when declarations need explicit standalone: false or when module-heavy architecture must remain temporarily compatible.
stack:
  - Angular
  - TypeScript
category: standalone
status: stable
version: 0.5.2
owner: NgAutoPilot
triggers:
  - standalone default
  - standalone false
  - NgModule compatibility
  - module-heavy architecture
compatibility:
  angular:
    min: "19"
---

# Angular Standalone Default v19 NgModule Compatibility

## Purpose

Review Angular 19 standalone-by-default compatibility for NgModule-heavy apps.

## When to Use

- The app has NgModule declarations.
- The app is not ready for a full standalone migration.
- The app already runs on Angular 19.

## When Not to Use

- The app is still in a version hop.
- The app is already fully standalone.

## Required Inputs

- NgModule declarations
- shared modules
- feature modules
- library modules
- component/directive/pipe declarations

## Procedure

1. Identify all NgModule declarations.
2. Mark declared components/directives/pipes with `standalone: false`.
3. Keep imports and exports consistent.
4. Validate template and test behavior.

## Do

- Keep NgModule compatibility explicit.
- Apply `standalone: false` where declarations are retained.
- Validate shared module wiring.

## Do Not

- Do not convert all NgModules in one pass.
- Do not mix this with the version hop.

## Review Checklist

- [ ] NgModule declarations are explicit.
- [ ] `standalone: false` is applied where required.
- [ ] Shared modules still work.
- [ ] Tests pass.

## Expected Output

1. NgModule compatibility summary.
2. `standalone: false` updates.
3. Test result.

## Exit Criteria

- NgModule compatibility is explicit.

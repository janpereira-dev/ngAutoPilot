---
id: angular.ssr.angular-render-module-v13-migration
name: Angular Render Module v13 Migration
description: >
  Migrate Angular SSR code from renderModuleFactory to renderModule. Use when server rendering still depends on the older factory-based API.
stack:
  - Angular
  - TypeScript
category: ssr
status: stable
version: 0.5.3
owner: NgAutoPilot
triggers:
  - renderModuleFactory
  - renderModule
  - SSR migration
compatibility:
  angular:
    min: "13"
---

# Angular Render Module v13 Migration

## Purpose

Migrate SSR code from `renderModuleFactory` to `renderModule`.

## When to Use

- The app uses Angular SSR.
- Server render code still uses old APIs.

## When Not to Use

- The app does not use SSR.
- SSR already uses `renderModule`.

## Required Inputs

- SSR entry points
- render code
- SSR tests

## Procedure

1. Replace factory-based SSR rendering.
2. Validate server rendering.

## Do

- Keep SSR bootstrap explicit.
- Validate SSR behavior.

## Do Not

- Do not keep `renderModuleFactory`.

## Review Checklist

- [ ] SSR rendering is migrated.
- [ ] SSR build passes.
- [ ] Server tests pass.

## Expected Output

1. SSR render summary.
2. Validation result.

## Exit Criteria

- SSR render API is explicit.

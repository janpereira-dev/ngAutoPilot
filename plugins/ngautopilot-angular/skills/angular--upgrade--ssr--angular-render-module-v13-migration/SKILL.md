---
id: angular.upgrade.ssr.angular-render-module-v13-migration
name: Angular renderModule v13 Migration
description: >
  Migrate SSR code from renderModuleFactory to renderModule and related modern platform-server APIs.
stack:
  - Angular
  - TypeScript
category: ssr
status: stable
version: 0.5.0
owner: NgAutoPilot
triggers:
  - renderModuleFactory
  - SSR migration
  - platform-server
compatibility:
  angular:
    min: "13"
---

# Angular renderModule v13 Migration

## Purpose

Migrate server rendering code to renderModule.

## When to Use

- SSR code still uses `renderModuleFactory`.
- The app is moving through Angular 13.

## When Not to Use

- SSR already uses `renderModule`.
- No server rendering migration is needed.

## Required Inputs

- server bootstrap
- platform-server code
- SSR tests

## Procedure

1. Find `renderModuleFactory`.
2. Replace it with `renderModule`.
3. Validate server rendering.

## Do

- Keep server bootstrap explicit.
- Validate SSR behavior.

## Do Not

- Do not keep factory-based rendering.

## Review Checklist

- [ ] `renderModuleFactory` removed.
- [ ] SSR build passes.
- [ ] Server tests pass.

## Expected Output

1. SSR migration summary.
2. Validation result.

## Exit Criteria

- SSR rendering uses modern APIs.

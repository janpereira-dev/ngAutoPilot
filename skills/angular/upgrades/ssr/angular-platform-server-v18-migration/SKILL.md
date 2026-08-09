---
id: angular.upgrade.ssr.angular-platform-server-v18-migration
name: Angular Platform Server v18 Migration
description: >
  Migrate Angular SSR and platform-server code to Angular 18 after an Angular 18 upgrade when the app uses Universal, prerender, TransferState, platform-server bootstrapping, or server URL behavior.
stack:
  - Angular
  - TypeScript
category: ssr
status: stable
version: 0.6.0
owner: NgAutoPilot
triggers:
  - platform-server migration
  - SSR migration
  - TransferState
  - prerender
compatibility:
  angular:
    min: "18"
---

# Angular Platform Server v18 Migration

## Purpose

Migrate Angular SSR and platform-server code to Angular 18.

## When to Use

- The app uses SSR or prerender.
- The app uses `TransferState`.
- The app uses platform-server bootstrapping.

## When Not to Use

- The app does not use SSR.
- The app is still in a version upgrade.

## Required Inputs

- `server.ts`
- `main.server.ts`
- `app.config.server.ts`
- `TransferState`
- `platformServer`
- URL handling

## Procedure

1. Identify SSR entry points.
2. Remove deprecated server APIs.
3. Validate request URL handling.
4. Validate server and browser builds.

## Do

- Keep SSR bootstrap explicit.
- Review transfer state and server URL behavior.
- Validate prerender output.

## Do Not

- Do not keep removed platform-server APIs.
- Do not mix this with the version upgrade itself.

## Review Checklist

- [ ] SSR entry points are updated.
- [ ] TransferState behavior is correct.
- [ ] URL behavior is correct.
- [ ] Server build passes.

## Expected Output

1. SSR migration summary.
2. TransferState review.
3. Server build result.

## Exit Criteria

- SSR risk is explicit.

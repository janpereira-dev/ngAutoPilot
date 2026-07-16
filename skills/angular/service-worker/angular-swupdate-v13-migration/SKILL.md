---
id: angular.service-worker.angular-swupdate-v13-migration
name: Angular SwUpdate v13 Migration
description: >
  Migrate Angular service worker update code to the v13 API shape. Use when applications still rely on available or activated streams and need to use versionUpdates or related update flow changes.
stack:
  - Angular
  - TypeScript
category: service-worker
status: stable
version: 0.5.1
owner: NgAutoPilot
triggers:
  - SwUpdate
  - service worker updates
  - versionUpdates
compatibility:
  angular:
    min: "13"
---

# Angular SwUpdate v13 Migration

## Purpose

Migrate Angular service worker update code to the v13 API shape.

## When to Use

- The app uses Angular service worker.
- Update streams still rely on older APIs.

## When Not to Use

- The app does not use service worker updates.
- Update handling is already modernized.

## Required Inputs

- service worker code
- update flow
- production build config

## Procedure

1. Replace old update streams.
2. Validate update prompts.

## Do

- Keep update flow explicit.
- Validate production behavior.

## Do Not

- Do not keep old stream names.

## Review Checklist

- [ ] Update flow is migrated.
- [ ] Deprecated API usage is removed.
- [ ] Tests pass.

## Expected Output

1. Service worker migration summary.
2. Validation notes.

## Exit Criteria

- Update flow is explicit.

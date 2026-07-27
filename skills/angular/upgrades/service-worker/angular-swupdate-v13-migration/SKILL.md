---
id: angular.upgrade.service-worker.angular-swupdate-v13-migration
name: Angular SwUpdate v13 Migration
description: >
  Update service worker code to Angular v13 SwUpdate APIs and behavior. Use when update lifecycle handling still depends on deprecated properties or events.
stack:
  - Angular
  - TypeScript
category: service-worker
status: stable
version: 0.5.3
owner: NgAutoPilot
triggers:
  - SwUpdate migration
  - service worker update flow
  - Angular service worker
compatibility:
  angular:
    min: "13"
---

# Angular SwUpdate v13 Migration

## Purpose

Update service worker update handling to v13 behavior.

## When to Use

- The app uses Angular service worker.
- Update lifecycle code still uses old APIs.

## When Not to Use

- The app does not use service worker.
- Update handling is already modernized.

## Required Inputs

- service worker code
- update listeners
- production build config

## Procedure

1. Identify SwUpdate usage.
2. Replace deprecated update flow patterns.
3. Validate update behavior.

## Do

- Keep update handling explicit.
- Validate production behavior.

## Do Not

- Do not keep deprecated event assumptions.

## Review Checklist

- [ ] Update flow reviewed.
- [ ] Deprecated API usage removed.
- [ ] Production tests pass.

## Expected Output

1. Service worker migration summary.
2. Validation notes.

## Exit Criteria

- Service worker update flow is compatible.

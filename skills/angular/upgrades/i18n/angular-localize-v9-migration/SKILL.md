---
id: angular.upgrade.i18n.angular-localize-v9-migration
name: Angular Localize v9 Migration
description: >
  Migrate Angular applications to the v9 localize tooling and $localize runtime. Use when i18n build or runtime configuration still depends on older extraction or localization setup.
stack:
  - Angular
  - TypeScript
category: i18n
status: stable
version: 0.5.0
owner: NgAutoPilot
triggers:
  - angular localize
  - $localize
  - i18n migration
compatibility:
  angular:
    min: "9"
---

# Angular Localize v9 Migration

## Purpose

Move i18n setup to Angular localize v9 behavior.

## When to Use

- The app uses Angular i18n tooling.
- The project still depends on older localization setup.

## When Not to Use

- The app has no i18n tooling.
- Localize is already modernized.

## Required Inputs

- i18n config
- extraction scripts
- translation files

## Procedure

1. Review existing localize setup.
2. Update tooling and runtime expectations.
3. Validate translation extraction and build output.

## Do

- Keep i18n build config explicit.
- Validate translated builds.

## Do Not

- Do not leave extraction behavior unverified.

## Review Checklist

- [ ] `$localize` setup is known.
- [ ] Build config updated.
- [ ] Translated builds pass.

## Expected Output

1. Localize migration summary.
2. Validation notes.

## Exit Criteria

- Localize behavior is compatible with the target Angular version.

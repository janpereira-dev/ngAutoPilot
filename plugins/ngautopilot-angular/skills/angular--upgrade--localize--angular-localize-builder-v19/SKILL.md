---
id: angular.upgrade.localize.angular-localize-builder-v19
name: Angular Localize Builder v19
description: >
  Migrate Angular localize builder configuration after Angular 19 when angular.json uses the @angular/localize builder and the project needs the name-to-project option change. Use when localization builds rely on builder options or extraction behavior.
stack:
  - Angular
  - TypeScript
category: localize
status: stable
version: 0.5.0
owner: NgAutoPilot
triggers:
  - localize builder
  - "@angular/localize"
  - translation build
  - builder project option
compatibility:
  angular:
    min: "19"
---

# Angular Localize Builder v19

## Purpose

Migrate Angular localize builder configuration after Angular 19.

## When to Use

- `angular.json` uses the `@angular/localize` builder.
- The project uses translation extraction or localized builds.

## When Not to Use

- The project does not use the localize builder.
- The app is still in a version hop.

## Required Inputs

- `angular.json`
- localize builder configuration
- translation build scripts
- extraction scripts

## Procedure

1. Identify localize builder entries.
2. Replace `name` with `project`.
3. Validate localized builds.
4. Validate extraction behavior.

## Do

- Keep builder config explicit.
- Validate localized builds.
- Review extraction scripts.

## Do Not

- Do not keep the old builder option.
- Do not mix this with the version hop.

## Review Checklist

- [ ] Builder uses `project`.
- [ ] Localized builds pass.
- [ ] Extraction behavior is correct.

## Expected Output

1. Builder configuration summary.
2. Localized build result.
3. Test/extraction result.

## Exit Criteria

- Localize builder risk is explicit.

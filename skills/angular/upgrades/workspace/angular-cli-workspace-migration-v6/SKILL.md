---
id: angular.upgrade.workspace.angular-cli-workspace-migration-v6
name: Angular CLI Workspace Migration v6
description: >
  Migrate pre-workspace Angular CLI projects to angular.json workspace format during the Angular 5 to 6 era. Use when older .angular-cli.json configuration still exists.
stack:
  - Angular
  - TypeScript
category: workspace
status: stable
version: 0.6.0
owner: NgAutoPilot
triggers:
  - angular.json migration
  - angular-cli workspace
  - .angular-cli.json
compatibility:
  angular:
    min: "6"
---

# Angular CLI Workspace Migration v6

## Purpose

Move older Angular CLI projects to the workspace configuration format.

## When to Use

- The repo still uses `.angular-cli.json`.
- The project has not yet adopted `angular.json`.

## When Not to Use

- The workspace already uses `angular.json`.
- No legacy CLI config exists.

## Required Inputs

- old CLI config
- workspace project structure
- build and test scripts

## Procedure

1. Map legacy CLI settings to workspace config.
2. Validate build and test targets.
3. Remove obsolete config files.

## Do

- Keep targets explicit.
- Validate all scripts after migration.

## Do Not

- Do not hand-wave target mappings.

## Review Checklist

- [ ] Workspace config exists.
- [ ] Legacy config removed.
- [ ] Scripts still run.

## Expected Output

1. Workspace migration summary.
2. Validation report.

## Exit Criteria

- Workspace migration is complete.

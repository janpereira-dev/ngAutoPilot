---
id: angular.upgrade.libraries.angular-ngcc-view-engine-removal-v16
name: Angular ngcc View Engine Removal v16
description: >
  Audit Angular libraries for ngcc and View Engine compatibility before Angular 16. Use when the project is upgrading from Angular 15 to Angular 16 or when a library may still require compatibility compilation, View Engine metadata, or postinstall ngcc scripts.
stack:
  - Angular
  - TypeScript
category: libraries
status: stable
version: 0.5.2
owner: NgAutoPilot
triggers:
  - ngcc audit
  - View Engine libraries
  - Angular 16 library compatibility
  - ngcc removal
compatibility:
  angular:
    min: "15"
---

# Angular ngcc View Engine Removal v16

## Purpose

Audit Angular libraries for `ngcc` and View Engine compatibility before Angular 16.

## When to Use

- The project is upgrading from Angular 15 to Angular 16.
- The project uses Angular libraries.
- The project has `postinstall` scripts.
- The project may still depend on View Engine output.

## When Not to Use

- The project has no Angular libraries.
- The project already verified Angular 16 compatibility for all libraries.
- The task is only a generic dependency update.

## Required Inputs

- `package.json`
- lock file
- Angular library list
- `ngcc` scripts
- `__ivy_ngcc__` references
- `metadata.json` references
- `postinstall` scripts
- library build scripts
- published package metadata

## Procedure

1. Search for `ngcc` and compatibility compilation references.
2. Search for View Engine artifacts and metadata.
3. Identify critical libraries and their Angular 16 support status.
4. Identify workarounds and postinstall scripts.
5. Classify blockers and non-blockers.

## Do

- Treat critical View Engine-only libraries as blockers.
- Prefer upgrading libraries to Ivy-compatible versions.
- Document any library that still needs compatibility compilation.

## Do Not

- Do not keep `ngcc` as a workaround.
- Do not assume an older library is Angular 16 compatible.
- Do not patch the audit by deleting scripts before verifying replacements.

## Review Checklist

- [ ] `ngcc` scripts are listed.
- [ ] View Engine-only libraries are listed.
- [ ] `__ivy_ngcc__` references are listed.
- [ ] Critical blockers are identified.
- [ ] Safe upgrade path is documented.

## Expected Output

1. Library inventory.
2. ngcc and View Engine findings.
3. Critical blockers.
4. Safe upgrade path.

## Exit Criteria

- Library compatibility is explicit.
- Blockers are either resolved or documented.

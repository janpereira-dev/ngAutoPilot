---
id: angular.build.angular-v22-build-system-migration
name: Angular v22 Build System Migration
description: >
  Use this skill when Angular 22 build, serve, or test infrastructure needs to move away from deprecated builder paths.
stack:
  - Angular
  - TypeScript
category: build
status: stable
version: 0.5.1
owner: NgAutoPilot
triggers:
  - build system
  - "@angular/build"
  - webpack builders
  - architect
  - ng serve
compatibility:
  angular:
    min: "22"
---

# Angular v22 Build System Migration

## Purpose

Use this skill when Angular 22 build, serve, or test infrastructure needs to move away from deprecated builder paths.

## When to Use

Use this skill when:

- The app still depends on webpack-based Angular builders.
- CI or local commands need a v22-compatible build path.
- The project has custom builders or architect wiring that may need a rewrite.

## When Not to Use

Do not use this skill when:

- The issue is only source code and not the build pipeline.
- The project already uses the new build path cleanly.
- A narrower CLI or workspace migration skill is a better fit.

## Required Inputs

- angular.json
- build and serve scripts
- CI commands
- custom builders

## Procedure

1. Map the old build targets to the supported v22 builder path.
2. Check custom architect or CLI wiring for removed packages.
3. Validate local serve behavior, including the effective port source.

## Do

- Keep the migration incremental.
- Prefer the supported builder path over deprecated webpack builders.
- Verify the same behavior in CI and locally.

## Do Not

- Do not keep deprecated builder aliases in new config.
- Do not assume custom CLI glue survives unchanged.
- Do not let the build migration spill into source refactors.

## Review Checklist

- [ ] The build target uses the supported v22 path.
- [ ] CI and local runs still work.
- [ ] Any removed CLI entry points were addressed.

## Expected Output

When this skill is used, the agent should:

1. A build-migration summary.
2. The updated builder path.
3. Any remaining CI or CLI risks.

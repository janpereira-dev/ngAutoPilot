---
id: angular.upgrade.di.angular-v20-injector-injectflags-cleanup
name: Angular v20 Injector InjectFlags Cleanup
description: >
  Clean up Angular 20 dependency injection code that still relies on InjectFlags, TestBed.get, or untyped Injector.get usage after an Angular 20 upgrade. Use when strict ProviderToken typing or injection options must be made explicit.
stack:
  - Angular
  - TypeScript
category: di
status: draft
version: 0.3.1
owner: NgAutoPilot
triggers:
  - InjectFlags
  - TestBed.get
  - Injector.get
  - DI cleanup
compatibility:
  angular:
    min: "20"
---

# Angular v20 Injector InjectFlags Cleanup

## Purpose

Clean up Angular 20 DI code that relies on deprecated injection patterns.

## When to Use

- The app uses `InjectFlags`.
- The app uses `TestBed.get`.
- The app has untyped `Injector.get` usage.

## When Not to Use

- The app does not use deprecated injection patterns.
- The app is still in a version hop.

## Required Inputs

- injection sites
- tests
- string tokens
- custom providers

## Procedure

1. Find deprecated injection patterns.
2. Replace flags with options where supported.
3. Replace `TestBed.get` with `TestBed.inject`.
4. Validate tests.

## Do

- Keep provider typing explicit.
- Review string tokens and custom tokens.
- Validate critical injection paths.

## Do Not

- Do not keep `InjectFlags` in the target slice.
- Do not mix this with the version hop.

## Review Checklist

- [ ] `InjectFlags` are removed.
- [ ] `TestBed.get` is removed.
- [ ] Typed injection works.
- [ ] Tests pass.

## Expected Output

1. DI cleanup summary.
2. Injection API updates.
3. Test result.

## Exit Criteria

- DI risk is explicit.

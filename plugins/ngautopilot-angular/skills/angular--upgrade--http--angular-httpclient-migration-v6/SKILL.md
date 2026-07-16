---
id: angular.upgrade.http.angular-httpclient-migration-v6
name: Angular HttpClient Migration v6
description: >
  Migrate from Angular HttpModule and Http to HttpClientModule and HttpClient during the Angular 5 to 6 era. Use when legacy HTTP APIs block modern Angular usage.
stack:
  - Angular
  - TypeScript
category: http
status: stable
version: 0.5.1
owner: NgAutoPilot
triggers:
  - HttpClient migration
  - HttpModule
  - legacy Http
compatibility:
  angular:
    min: "6"
---

# Angular HttpClient Migration v6

## Purpose

Move legacy HTTP code to Angular HttpClient.

## When to Use

- The app still uses `HttpModule` or `Http`.
- HTTP interceptors or typed responses need modern support.

## When Not to Use

- The app already uses HttpClient everywhere.
- No legacy HTTP API remains.

## Required Inputs

- HTTP services
- module imports
- interceptors
- tests

## Procedure

1. Replace legacy HTTP imports with HttpClient.
2. Update service methods and response handling.
3. Validate tests.

## Do

- Keep HTTP services explicit and typed.
- Validate interceptors after migration.

## Do Not

- Do not keep legacy HTTP APIs around.

## Review Checklist

- [ ] HttpModule removed.
- [ ] HttpClientModule present.
- [ ] Services compile and tests pass.

## Expected Output

1. HTTP migration summary.
2. Validation result.

## Exit Criteria

- Legacy HTTP API usage is removed.

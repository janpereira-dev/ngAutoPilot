---
id: angular.upgrade.resources.angular-v20-resource-rxresource-migration
name: Angular v20 Resource RxResource Migration
description: >
  Migrate Angular resource and rxResource code to the Angular 20 API shape after an Angular 20 upgrade when applications use resource, rxResource, ResourceStatus, request, loader, params, or stream. Use when resource-based state or SSR data loading needs explicit cleanup.
stack:
  - Angular
  - TypeScript
category: resources
status: stable
version: 0.5.1
owner: NgAutoPilot
triggers:
  - resource API
  - rxResource
  - ResourceStatus
  - params and stream
compatibility:
  angular:
    min: "20"
---

# Angular v20 Resource RxResource Migration

## Purpose

Migrate Angular resource and rxResource code to the Angular 20 API shape.

## When to Use

- The app uses `resource` or `rxResource`.
- The app uses `ResourceStatus`.
- The app has SSR/data-loading paths that depend on resource state.

## When Not to Use

- The app does not use resource APIs.
- The app is still in a version hop.

## Required Inputs

- `resource` usage
- `rxResource` usage
- `ResourceStatus`
- data-loading tests

## Procedure

1. Find resource API usage.
2. Replace old request/loader shapes.
3. Remove enum-style status assumptions.
4. Validate loading behavior.

## Do

- Keep resource state explicit.
- Review SSR and UI behavior.
- Validate tests.

## Do Not

- Do not keep old resource API names in the target slice.
- Do not mix this with the version hop.

## Review Checklist

- [ ] Resource API usage is updated.
- [ ] Status handling is correct.
- [ ] Tests pass.

## Expected Output

1. Resource migration summary.
2. Status handling updates.
3. Test result.

## Exit Criteria

- Resource risk is explicit.

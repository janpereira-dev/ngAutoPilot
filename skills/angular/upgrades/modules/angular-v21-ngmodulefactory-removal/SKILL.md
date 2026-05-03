---
id: angular.upgrade.modules.angular-v21-ngmodulefactory-removal
name: Angular v21 NgModuleFactory Removal
description: >
  Remove Angular NgModuleFactory usage after an Angular 21 upgrade when dynamic module loading, plugin systems, or legacy loaders still depend on NgModuleFactory. Use when replacing factory-based module creation with supported APIs.
stack:
  - Angular
  - TypeScript
category: modules
status: draft
version: 0.3.0
owner: NgAutoPilot
triggers:
  - NgModuleFactory
  - dynamic module loading
  - legacy loaders
  - plugin systems
compatibility:
  angular:
    min: "21"
---

# Angular v21 NgModuleFactory Removal

## Purpose

Remove Angular NgModuleFactory usage after Angular 21.

## When to Use

- The app dynamically loads modules.
- The app uses legacy plugin loaders or factory-based module creation.

## When Not to Use

- The app does not use NgModuleFactory.
- The app is still in a version hop.

## Required Inputs

- dynamic module loading code
- plugin loaders
- legacy factories

## Procedure

1. Find NgModuleFactory usage.
2. Replace with supported APIs.
3. Validate dynamic loading behavior.

## Do

- Keep dynamic loading explicit.
- Validate plugin and module loading.

## Do Not

- Do not keep NgModuleFactory.
- Do not mix this with the version hop.

## Review Checklist

- [ ] NgModuleFactory usage is removed.
- [ ] Dynamic loading works.
- [ ] Tests pass.

## Expected Output

1. Dynamic module summary.
2. API replacement summary.
3. Test result.

## Exit Criteria

- NgModuleFactory risk is explicit.

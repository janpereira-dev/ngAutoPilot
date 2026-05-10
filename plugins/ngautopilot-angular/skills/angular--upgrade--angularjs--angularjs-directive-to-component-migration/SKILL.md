---
id: angular.upgrade.angularjs.angularjs-directive-to-component-migration
name: AngularJS Directive to Component Migration
description: >
  Convert AngularJS directives into Angular components or directives as appropriate. Use when legacy directive behavior blocks migration or makes the DOM contract unstable.
stack:
  - Angular
  - AngularJS
category: angularjs
status: stable
version: 0.4.0
owner: NgAutoPilot
triggers:
  - AngularJS directive migration
  - directive to component
  - legacy directive
compatibility:
  angular:
    min: "2"
---

# AngularJS Directive to Component Migration

## Purpose

Migrate AngularJS directives to Angular components or directives.

## When to Use

- Legacy directives are part of the migration path.
- The DOM contract needs cleanup.

## When Not to Use

- The directive is already Angular compatible.
- No directive migration is needed.

## Required Inputs

- directive definitions
- usage sites
- isolate scope behavior

## Procedure

1. Classify each directive.
2. Convert to component or Angular directive as needed.
3. Validate bindings and lifecycle behavior.

## Do

- Preserve public behavior.
- Simplify isolated scope patterns.

## Do Not

- Do not keep AngularJS directive internals unchanged.

## Review Checklist

- [ ] Directive usage mapped.
- [ ] Migration target chosen.
- [ ] Tests updated.

## Expected Output

1. Directive migration summary.
2. Validation notes.

## Exit Criteria

- Legacy directive is no longer required.

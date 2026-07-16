---
id: angular.upgrade.angularjs.angularjs-template-syntax-migration
name: AngularJS Template Syntax Migration
description: >
  Migrate AngularJS template syntax such as ng-repeat, ng-if, ng-click, ng-class, and ng-model to Angular-compatible templates during a staged migration.
stack:
  - Angular
  - AngularJS
category: angularjs
status: stable
version: 0.5.0
owner: NgAutoPilot
triggers:
  - AngularJS template syntax
  - ng-repeat
  - ng-if
  - ng-click
  - ng-model
compatibility:
  angular:
    min: "2"
---

# AngularJS Template Syntax Migration

## Purpose

Translate AngularJS template syntax to Angular patterns.

## When to Use

- The app still has AngularJS templates.
- Template syntax blocks Angular migration.

## When Not to Use

- The app has no AngularJS templates.
- The migration is already complete.

## Required Inputs

- AngularJS templates
- directives and filters used in templates
- binding patterns

## Procedure

1. Inventory AngularJS syntax usage.
2. Replace syntax with Angular equivalents.
3. Validate template behavior.

## Do

- Keep bindings explicit.
- Validate transformed templates.

## Do Not

- Do not change business behavior while rewriting syntax.

## Review Checklist

- [ ] Structural directives migrated.
- [ ] Event bindings migrated.
- [ ] Two-way bindings reviewed.

## Expected Output

1. Template migration summary.
2. Validation notes.

## Exit Criteria

- Template syntax is Angular-compatible.

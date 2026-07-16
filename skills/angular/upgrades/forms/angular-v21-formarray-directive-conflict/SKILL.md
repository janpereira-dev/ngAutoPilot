---
id: angular.upgrade.forms.angular-v21-formarray-directive-conflict
name: Angular v21 FormArray Directive Conflict
description: >
  Review Angular 21 apps for custom FormArray or formArray directive and input naming conflicts after the upgrade. Use when custom directives or inputs collide with Angular reactive forms APIs.
stack:
  - Angular
  - TypeScript
category: forms
status: stable
version: 0.5.1
owner: NgAutoPilot
triggers:
  - FormArray conflict
  - formArray directive
  - reactive forms naming
compatibility:
  angular:
    min: "21"
---

# Angular v21 FormArray Directive Conflict

## Purpose

Review Angular 21 apps for custom FormArray or formArray naming conflicts.

## When to Use

- The app has custom directives or inputs named `FormArray` or `formArray`.
- Reactive forms are used heavily.

## When Not to Use

- The app has no naming conflicts.
- The app is still in a version hop.

## Required Inputs

- custom directives
- custom inputs
- reactive forms
- template usage

## Procedure

1. Identify naming collisions.
2. Rename custom directives or inputs.
3. Validate reactive forms behavior.

## Do

- Keep Angular form API names unambiguous.
- Validate forms behavior after renaming.

## Do Not

- Do not keep colliding names.
- Do not mix this with the version hop.

## Review Checklist

- [ ] Naming collisions are removed.
- [ ] Forms still work.
- [ ] Tests pass.

## Expected Output

1. Conflict summary.
2. Rename list.
3. Test result.

## Exit Criteria

- FormArray conflict risk is explicit.

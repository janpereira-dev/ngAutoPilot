---
id: angular.upgrade.components.angular-create-component-projectable-nodes-v19
name: Angular Create Component Projectable Nodes v19
description: >
  Review Angular component creation with projectable nodes after Angular 19 when dynamic components depend on projected content, ng-content fallbacks, or component factory removal behavior. Use when createComponent or ViewContainerRef.createComponent is used with content projection.
stack:
  - Angular
  - TypeScript
category: components
status: stable
version: 0.4.0
owner: NgAutoPilot
triggers:
  - createComponent
  - projectable nodes
  - content projection
  - ng-content fallback
compatibility:
  angular:
    min: "19"
---

# Angular Create Component Projectable Nodes v19

## Purpose

Review Angular component creation with projectable nodes after Angular 19.

## When to Use

- The app creates components dynamically.
- Projected content or fallback `ng-content` matters.
- `createComponent` or `ViewContainerRef.createComponent` is used.

## When Not to Use

- The app does not use dynamic component creation.
- The app is still in a version hop.

## Required Inputs

- dynamic component code
- `projectableNodes`
- fallback `ng-content`
- tests for dynamic screens

## Procedure

1. Identify dynamic component projection points.
2. Review fallback content behavior.
3. Add empty text nodes only where needed.
4. Validate dynamic screens and tests.

## Do

- Keep projection behavior explicit.
- Review fallback content intentionally.
- Validate dynamic screens.

## Do Not

- Do not add projectable nodes blindly.
- Do not mix this with the version hop.

## Review Checklist

- [ ] Projection behavior is known.
- [ ] Fallback content is correct.
- [ ] Tests pass.

## Expected Output

1. Projection summary.
2. Fallback content review.
3. Test result.

## Exit Criteria

- Projection risk is explicit.

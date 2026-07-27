---
id: angular.upgrade.styles.angular-remove-styles-on-destroy-v17
name: Angular Remove Styles on Destroy v17
description: >
  Review component style cleanup behavior after Angular 17 when the app relied on styles leaking after component destruction. Use when overlay, dynamic component, portal, or microfrontend screens depend on leaked styles or when the app needs a controlled compatibility bridge.
stack:
  - Angular
  - TypeScript
category: styles
status: stable
version: 0.5.3
owner: NgAutoPilot
triggers:
  - remove styles on destroy
  - component style cleanup
  - leaked component styles
compatibility:
  angular:
    min: "17"
---

# Angular Remove Styles on Destroy v17

## Purpose

Review component style cleanup behavior after Angular 17.

## When to Use

- The app relied on styles leaking after component destruction.
- The app uses overlays, dynamic components, portals, or microfrontends.
- A temporary compatibility bridge may be needed.

## When Not to Use

- The app never relied on leaked component styles.
- The app is still in a version upgrade.

## Required Inputs

- component styles
- overlay and portal usage
- dynamic component usage
- microfrontend or lazy component screens

## Procedure

1. Identify screens that may rely on leaked styles.
2. Review destroyed-component cleanup behavior.
3. Add temporary bridge only if needed.
4. Validate affected screens visually.

## Do

- Keep any temporary bridge explicit.
- Review overlays and portals first.
- Validate critical screens.

## Do Not

- Do not treat leaked styles as architecture.
- Do not hide breakage behind a blanket bridge.

## Review Checklist

- [ ] Style leakage risk is identified.
- [ ] Temporary bridge is explicit if needed.
- [ ] Critical screens pass visual review.

## Expected Output

1. Style cleanup risk summary.
2. Temporary bridge decision.
3. Visual review result.

## Exit Criteria

- Style cleanup risk is explicit.

---
id: frontend.design.accessibility-interaction-gate
name: Accessibility Interaction Gate
description: Block release when semantics, keyboard, focus, contrast, target size, announcements, zoom, motion, or error recovery fail.
stack:
  - Frontend
  - Accessibility
  - Testing
category: accessibility
status: stable
version: 0.5.0
owner: NgAutoPilot
triggers:
  - accessibility audit
  - a11y gate
  - keyboard testing
  - WCAG review
---

# Accessibility Interaction Gate

## Purpose

Provide a blocking interactive accessibility review using manual task evidence alongside automated checks.

## When to Use

- An interactive component, flow, or design-system contract is ready for release review.
- Markup or behavior changes could affect keyboard, focus, or assistive technology.

## Do

- Verify semantics, accessible name/role/state, keyboard task completion, focus order/restoration, dynamic announcements, contrast, target size, non-color cues, zoom, reflow, and reduced motion.
- Use native elements or verified primitives and reconcile automated findings against manual evidence.
- Prefer a project target above formal minimums when practical.

## Do Not

- Do not approve accessibility from Lighthouse or axe scores alone, remove outlines, repair order with positive tabindex, or hide inaccessible controls from tests.

## Review Checklist

- [ ] All functionality is keyboard operable with visible, logical focus.
- [ ] Critical changes announce correctly and name/role/state are accurate.
- [ ] Zoom, reflow, target-size, error recovery, and reduced-motion checks pass.

## Expected Output

1. Pass/fail gate result and manual evidence.
2. Automated findings with interpretation.
3. Ordered blockers and remediation plan.

## References

- [Design Excellence Guide](../../../../docs/design-excellence-guide.md)

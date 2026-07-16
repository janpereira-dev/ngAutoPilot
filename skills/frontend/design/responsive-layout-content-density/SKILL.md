---
id: frontend.design.responsive-layout-content-density
name: Responsive Layout and Content Density
description: Design layout behavior around content, task priority, container size, zoom, and input modality rather than fixed screenshots.
stack:
  - Frontend
  - CSS
  - Responsive Design
category: design
status: stable
version: 0.5.1
owner: NgAutoPilot
triggers:
  - responsive design
  - mobile layout
  - content density
  - container queries
---

# Responsive Layout and Content Density

## Purpose

Make responsive behavior a reusable component contract rather than a late page-level CSS patch.

## When to Use

- Features run in desktop, tablet, mobile, embedded, split-pane, or variable containers.
- Tables, forms, navigation, or dashboards collapse poorly.

## Do

- Define visible, collapsible, and movable content by task context and content breakpoint.
- Prefer intrinsic sizing, grid, flex, `min()`, `max()`, `clamp()`, and container queries before fixed viewport breakpoints.
- Validate reflow at narrow widths and 200-400% zoom, plus sticky, overflow, dialog, table, and virtual-keyboard behavior.

## Do Not

- Do not hide core functionality without an alternative, shrink text to preserve layout, or default every table to horizontal scrolling.

## Review Checklist

- [ ] Primary task completes in every supported context.
- [ ] Critical controls do not overlap or clip at zoom or text expansion.
- [ ] Component behavior is documented at each content breakpoint.

## Expected Output

1. Responsive behavior matrix and priority rules.
2. CSS layout strategy and viewport/container test set.
3. Density and overflow decisions.

## References

- [Design Excellence Guide](../../../../docs/design-excellence-guide.md)

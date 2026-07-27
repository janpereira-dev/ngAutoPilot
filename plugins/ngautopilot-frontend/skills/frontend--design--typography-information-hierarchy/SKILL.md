---
id: frontend.design.typography-information-hierarchy
name: Typography and Information Hierarchy
description: Use semantic content order, typography, spacing, and grouping to make task priority and information relationships clear.
stack:
  - Frontend
  - CSS
  - Content Design
category: design
status: stable
version: 0.5.3
owner: NgAutoPilot
triggers:
  - typography hierarchy
  - information hierarchy
  - UI readability
  - content density
---

# Typography and Information Hierarchy

## Purpose

Treat typography as an information system so users can scan, understand, and act without decoding decoration.

## When to Use

- Screens feel flat, noisy, hard to scan, or contain competing headings, cards, labels, and badges.
- Data-heavy and form-heavy work needs clear priority.

## Do

- Map real content to semantic HTML and intended reading order.
- Define primary, secondary, supporting, and metadata roles with line length, line height, weight, and spacing.
- Use grouping and whitespace before adding boxes; test long, translated, narrow, and zoomed content.

## Do Not

- Do not use size alone for hierarchy, card every section, center operational content, or silently truncate critical information.

## Review Checklist

- [ ] Purpose and primary action are identifiable in five seconds.
- [ ] Visual order matches semantic DOM heading order.
- [ ] Content remains usable at 200% zoom and under translation expansion.

## Expected Output

1. Hierarchy map and type-role scale.
2. Grouping recommendations and priority changes.
3. Content and localization risks.

## References

- [Design Excellence Guide](../../../../docs/design-excellence-guide.md)

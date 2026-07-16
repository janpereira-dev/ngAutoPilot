---
id: frontend.design.color-contrast-semantic-tokens
name: Color Contrast and Semantic Tokens
description: Build meaningful color roles and validate contrast, state distinction, focus visibility, and non-color cues.
stack:
  - Frontend
  - CSS
  - Accessibility
  - Design Systems
category: design-system
status: stable
version: 0.5.0
owner: NgAutoPilot
triggers:
  - color system
  - contrast audit
  - semantic color tokens
  - dark theme
---

# Color Contrast and Semantic Tokens

## Purpose

Use color for role, hierarchy, state, and brand without making it the sole carrier of meaning.

## When to Use

- Themes, status, action, focus, disabled, or selected states are unclear.
- Dark mode or high-contrast behavior is part of the support policy.

## Do

- Map palette values to semantic roles and test contrast on actual layered surfaces.
- Define precedence for hover, focus, active, selected, disabled, and error states.
- Add text, shape, icon, or position cues to color-coded meaning and test forced-colors when relevant.

## Do Not

- Do not rely on opacity that destroys readability or red/green without redundant cues.
- Do not let brand palette choices obscure focus or control-state clarity.

## Review Checklist

- [ ] Project contrast target passes for text, icons, borders, and controls.
- [ ] Focus is visible on all supported surfaces.
- [ ] Color-coded states have non-color cues and work across themes.

## Expected Output

1. Semantic color map and state precedence table.
2. Contrast findings and token changes.
3. Theme migration notes.

## References

- [Design Excellence Guide](../../../../docs/design-excellence-guide.md)

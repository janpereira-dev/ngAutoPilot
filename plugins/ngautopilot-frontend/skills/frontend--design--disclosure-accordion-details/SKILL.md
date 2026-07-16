---
id: frontend.design.disclosure-accordion-details
name: Disclosure and Accordion with Native Details
description: Build disclosure and accordion patterns with details and summary first, progressive enhancement, and explicit accessibility fallbacks.
stack:
  - Frontend
  - HTML
  - CSS
  - Accessibility
category: components
status: stable
version: 0.5.1
owner: NgAutoPilot
triggers:
  - details summary
  - accordion component
  - disclosure widget
  - exclusive accordion
---

# Disclosure and Accordion with Native Details

## Purpose

Use native disclosure when it meets product needs, then enhance without destroying state announcement, markers, focus, or no-JavaScript behavior.

## When to Use

- FAQs, advanced options, help content, or expandable sections are needed.
- A custom accordion duplicates native behavior or optional opening motion is requested.

## Do

- Use `summary` as first child of `details` and shared `name` only when exclusive behavior benefits users.
- Keep marker and state cues accessible, apply motion only as enhancement, respect reduced motion, and test keyboard, screen readers, print, and unsupported browsers.
- Use logical properties and support-check experimental CSS pseudo-elements.

## Do Not

- Do not casually nest details, hide essential content, remove markers for appearance, or use exclusive panels where comparison matters.

## Review Checklist

- [ ] Disclosure state is announced and summary is keyboard operable.
- [ ] Content structure and fallback remain semantic.
- [ ] Animation degrades cleanly without layout shift.

## Expected Output

1. Native-versus-custom decision.
2. Markup, CSS, enhancement, and reduced-motion rules.
3. Accessibility and browser test matrix.

## References

- [Design Excellence Guide](../../../../docs/design-excellence-guide.md)

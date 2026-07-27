---
id: frontend.design.motion-choreography-progressive-enhancement
name: Motion Choreography and Progressive Enhancement
description: Use CSS-first motion for causality and feedback with reduced-motion support, bounded timing, browser fallbacks, and stable end states.
stack:
  - Frontend
  - CSS
  - Accessibility
category: motion
status: stable
version: 0.5.3
owner: NgAutoPilot
triggers:
  - UI animation
  - staggered animation
  - motion design
  - reduced motion
  - view transition
---

# Motion Choreography and Progressive Enhancement

## Purpose

Use motion only when it communicates cause, hierarchy, continuity, feedback, or spatial change without delaying work.

## When to Use

- Revealing grouped content, state changes, insertion/removal, navigation continuity, or feedback needs motion.
- An interface needs coherent motion rules or must replace arbitrary animation.

## Do

- State motion purpose, bounded timing, easing, overlap, delay, direction, and maximum sequence length.
- Prefer CSS transitions and animations with state-driven classes or attributes; prefer transform and opacity where suitable.
- Provide a usable no-motion baseline and `prefers-reduced-motion` simplification; test interruption, reversal, hidden-tab, and low-performance cases.

## Do Not

- Do not animate every load, block primary content, disguise loading, or depend only on unsupported CSS functions.

## Review Checklist

- [ ] Motion purpose, fallback, and reduced-motion behavior are explicit.
- [ ] Primary action remains unblocked and total stagger duration is bounded.
- [ ] No layout shift, focus loss, or unsupported-feature failure exists.

## Expected Output

1. Choreography specification and CSS-first approach.
2. Fallback, reduced-motion, performance, and accessibility rules.
3. Test scenarios.

## References

- [Design Excellence Guide](../../../../docs/design-excellence-guide.md)

# Design Excellence Guide

NgAutoPilot design excellence skills turn broad UI requests into bounded, evidence-based work. Start with product intent, select the dominant design risk, apply the smallest specialist set, then finish with one release gate.

## Routing

| Task or symptom | Primary skill | Follow with |
| --- | --- | --- |
| Broad UI improvement | `frontend.design.design-quality-orchestrator` | Intake and release gate |
| Generic, generated-looking UI | `frontend.design.anti-generic-ai-design-gate` | Visual direction, typography |
| New product flow | `frontend.design.product-design-intake` | Usability, responsive behavior |
| Visual identity or tokens | `frontend.design.visual-direction-art-direction` or `frontend.design.design-token-system` | Typography and color tokens |
| Component contract or states | `frontend.design.component-api-composition` or `frontend.design.component-state-completeness` | Accessibility and visual regression |
| Interactive custom control | `frontend.design.native-first-interaction-components` | Accessibility gate |
| Motion or disclosure | `frontend.design.motion-choreography-progressive-enhancement` or `frontend.design.disclosure-accordion-details` | Accessibility gate |
| Angular custom accessibility | `angular.design.angular-headless-accessible-components` | Component API and accessibility gate |
| Angular multi-application library | `angular.design.angular-component-library-contracts` | Tokens, Storybook, release gate |

Load one primary skill, zero to three secondary skills, and one final gate. Do not load the entire family for one task.

## Reference Baseline

- [Angular accessibility guidance](https://angular.dev/best-practices/a11y)
- [Angular Aria guides](https://angular.dev/guide/aria/guide/aria/menu)
- [Angular component selectors](https://angular.dev/guide/components/selectors)
- [WCAG 2.2: Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)
- [WCAG 2.2: Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)
- [WCAG 2.2: Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- [MDN: `sibling-index()`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/sibling-index)
- [MDN: `sibling-count()`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/sibling-count)

External documentation is evidence, not a runtime dependency. Detect project versions and browser policy before recommending framework or browser-specific APIs.

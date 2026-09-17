# Codex Integration Guidance

Use NgAutoPilot as a skill-routed system, not as a pool of agents to activate by default.

1. Inspect the repository and detect the stack, versions, commands, and available capabilities.
2. Select the smallest relevant skill from `catalog.json`; route version or semantic risk through the compatibility router.
3. Activate a canonical role from `agents/ngautopilot/subagents/` only when its trigger applies.
4. Keep browser runners, Playwright, Lighthouse, DevTools, and design tools optional. Reuse existing project capability and report manual validation when it is absent.
5. Make the smallest reversible change, validate with existing commands, and report evidence and remaining risk.

For frontend work, route product and UX discovery to `frontend.design.product-ui-discovery`, reusable foundations to `frontend.design.design-system-governance`, inclusive UI to `frontend.accessibility.inclusive-ui-foundations`, browser evidence to `frontend.testing.frontend-experience-validation`, and performance work to `frontend.performance.web-performance-evidence`.

For Angular visual or accessibility journeys, use `angular.testing.angular-visual-accessibility-e2e-validation` after detecting the Angular version and runner. For JavaScript library, toolchain, host, or polyfill concerns, opt in to `javascript.ecmascript-compatibility-semantics`; it is not a default application skill.

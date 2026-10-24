# Prompts and Guardrails

<!-- docs:navigation:start -->
[Español](prompts-and-guardrails.es.md) · [Map](README.md) · [Home](../README.md)

<!-- docs:navigation:end -->

![Brief the agent with task, versions, skill and plan; request named guidance, real checks and remaining limits.](../assets/prompt-guide.svg)

## Prompts

Use the operational prompt as integration context. Select only relevant review
rules, then report the rule, observed evidence, impact and mitigation.

NgAutoPilot ships operational prompts under `agents/ngautopilot/prompts/`:

| File | Purpose |
| --- | --- |
| `codex-integration.md` | Integration guide for wiring NgAutoPilot subagents into a project |

## Guardrails

Guardrails are review rules for common frontend failures. The historical
`docs/frontend-product-life/GUARDRAILS.md` reference is not present in this
checkout; do not claim that missing file is installed. The 30-rule baseline is
listed here for manual review:

- UI without user goal (GR-001)
- "Pretty" as a criterion (GR-002)
- Missing loading/empty/error states (GR-003)
- Color as sole signal (GR-004)
- One primary action per block (GR-005)
- Screen saturation (GR-006)
- Focus outline removal (GR-007)
- Non-semantic HTML (GR-008)
- Forms without labels/keyboard nav (GR-009)
- Truncated critical content (GR-010)
- ARIA masking bad HTML (GR-011)
- Fixed heights breaking zoom/responsive (GR-012)
- Unscoped global CSS (GR-013)
- Hardcoded design tokens (GR-014)
- Duplicate Material theme (GR-015)
- Legacy Sass @import (GR-016)
- Expensive layout animation (GR-017)
- Visual lib for CSS-solvable cases (GR-018)
- Material internal DOM in tests (GR-019)
- M2→M3 without baseline (GR-020)
- Custom form field when existing suffices (GR-021)
- Overlay without focus/escape/mobile (GR-022)
- Heavy embeds loaded globally (GR-023)
- Chrome DevTools MCP with sensitive sessions (GR-024)
- Remote debugging port open (GR-025)
- Playwright desktop-only (GR-026)
- Performance without LCP/INP/CLS baseline (GR-027)
- Lighthouse 100 at UX cost (GR-028)
- AI design output without human review (GR-029)
- PR without visual/testable evidence (GR-030)

During review, report a matching rule, observed evidence, impact, and a concrete
mitigation. A justified exception must state its tradeoff and verification.
These rules do not execute code or enforce permissions automatically.

## How guardrails integrate

Guardrails are reference material for agents working on frontend tasks. They are not enforced by code — they are enforced by the agent's review process. The `frontend.design.design-system-governance` and `frontend.design.product-ui-discovery` skills reference them.

Example: GR-007, a button has no visible keyboard focus. Show the observed
keyboard behavior, restore a visible focus indicator, and verify interactive
states. A reference file's presence is not proof that the rule passed.

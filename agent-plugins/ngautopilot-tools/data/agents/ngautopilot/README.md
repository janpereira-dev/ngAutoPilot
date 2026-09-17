# NgAutoPilot Subagents Registry

This directory is the stable registry path for the NgAutoPilot Subagents Pack. It contains **eight documented roles**, not a claim of fifteen executable agents.

## Policy

- Treat `agents/ngautopilot/subagents/` as the canonical subagent registry path for packaged installs.
- Use subagents as focused reviewers or specialists after NgAutoPilot skills have selected the task path; they do not replace skill routing.
- Invoke the smallest relevant subagent role for the risk or domain in front of you.
- Do not load every subagent by default.
- Keep source skills in `skills/` and distributable agent assets in `agents/` separate.
- Route work through the smallest relevant skill first; activate roles only when their trigger matches.
- Treat browser tools, design platforms, and test runners as detected capabilities, never as required dependencies.

## Frontend routing

For frontend product, UX, CSS, accessibility, visual testing, and performance work, select the relevant `skills/frontend/` entry first. Then activate only the role that adds independent review value:

- Angular structure, Material, framework compatibility, or version evidence: Athenian Angular Architect.
- Product-flow, responsive UI, accessibility, visual, or E2E evidence: Testing Hoplite, with Athenian review when Angular behavior is involved.
- Runtime, library, polyfill, or toolchain semantic risk: Compatibility Gatekeeper.
- New skills, plugin bundles, catalog, or discoverability: Repository Cartographer.

The canonical integration guidance is `agents/ngautopilot/prompts/codex-integration.md`. Root-level `subagents/` and `prompts/` are intentionally not distribution paths.

## Registry

Primary roles:

- `subagents/primary/01-spartan-contrarian-developer.md` — adversarial implementation and scope review.
- `subagents/primary/02-athenian-angular-architect.md` — Angular architecture, version evidence, frontend, and skill-discovery review.
- `subagents/primary/03-roman-consolidator.md` — final consolidation and delivery readiness.

Support roles:

- `subagents/support/04-stoic-typescript-guardian.md` — TypeScript contracts and type-safety review.
- `subagents/support/05-rxjs-oracle.md` — RxJS, observable ownership, and async-flow review.
- `subagents/support/06-testing-hoplite.md` — Angular/frontend functional, visual, accessibility, and test-stability review.
- `subagents/support/07-compatibility-gatekeeper.md` — Angular, JavaScript semantics, Node, TypeScript, RxJS, and tooling compatibility review.
- `subagents/support/08-repo-cartographer.md` — repository layout, catalog, and discoverability review.

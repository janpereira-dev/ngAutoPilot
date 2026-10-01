# NgAutoPilot Gemini CLI Instructions

This project can use NgAutoPilot micro-skills.

## NgAutoPilot Core Workflow

1. Read `_core/project-intake` when repository context is not already clear.
2. Detect stack and versions before recommending version-sensitive APIs.
3. Select the smallest applicable skill from `catalog.json`.
4. Apply `_core/compatibility-router` for Angular, TypeScript, RxJS, Node, builders, or test-runner constraints.
5. Apply `_core/risk-assessment` for broad, risky, behavioral, SSR, security, or architecture changes.
6. Make the smallest reversible change.
7. Validate with commands that actually exist in the repository.
8. Explain what changed and why.
9. Do not invent APIs, versions, commands, dependencies, or compatibility data.
10. Do not introduce AI-vendor lock-in into code, skills, docs, or adapters.

## Subagent Invocation Policy

- If `agents/ngautopilot/subagents/` exists, use it as the stable subagent registry.
- Invoke only the smallest relevant subagent role for review, compatibility, testing, or consolidation; do not load every subagent.
- Skills decide the technical path first; subagents provide focused oversight and handoff quality.

## Angular 22 Routing

- For Angular 21 -> 22 upgrades, activate `skills/angular/upgrades/21-to-22/angular-21-to-22-upgrade-orchestrator/SKILL.md` first.
- For Angular 22 modernization or remediation, activate the narrow `angular-v22-*` satellite for the specific domain.
- Do not use a generic `skills/angular/v22/` folder or load all Angular 22 skills for one issue.

## Engineering Defaults

- Prefer small, safe changes.
- Avoid unrelated refactors.
- Preserve project architecture.
- Add or update tests when behavior changes.
- Explain risks and assumptions briefly.

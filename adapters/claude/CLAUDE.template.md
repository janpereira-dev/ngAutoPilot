# NgAutoPilot Claude Code Instructions

This project can use NgAutoPilot micro-skills.

## Workflow

1. Identify the task type.
2. Read `catalog.json`.
3. Select the smallest matching skill.
4. Read the selected `SKILL.md`.
5. Apply only the relevant guidance.
6. Keep the implementation small and reviewable.

## Rules

- Do not load every skill by default.
- Do not rewrite architecture unless explicitly requested.
- Do not introduce provider-specific behavior into skill files.
- Avoid unrelated refactors.
- Add or update tests when behavior changes.
- Explain tradeoffs when applying performance, typing, or RxJS changes.

## Conflict Handling

If project-local instructions conflict with NgAutoPilot, follow project-local instructions first and explain the conflict briefly.

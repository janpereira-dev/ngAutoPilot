# NgAutoPilot Agent Rules

This project can use NgAutoPilot micro-skills from `skills/`.

## Skill Selection

- Read `catalog.json`.
- Select the smallest applicable skill.
- Read the selected `SKILL.md`.
- Do not load unrelated skills.
- Prefer `stable` skills unless the task specifically needs an experimental one.

## Implementation Rules

- Keep diffs small.
- Prefer deterministic changes.
- Avoid unrelated refactors.
- Preserve existing project architecture.
- Add or update tests when behavior changes.
- Explain architectural, performance, or type-safety risks.

## Priority Order

1. User request.
2. Project-local instructions.
3. Selected NgAutoPilot skill.
4. General framework best practices.

If instructions conflict and the safe path is unclear, ask for clarification.

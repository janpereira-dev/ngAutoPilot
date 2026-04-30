# NgAutoPilot Gemini CLI Instructions

This project can use NgAutoPilot micro-skills.

## Usage

1. Read `catalog.json`.
2. Match the task to a skill using `triggers`, `stack`, and `category`.
3. Read only the selected `SKILL.md`.
4. Apply the skill checklist.
5. Keep the output focused on the requested change.

## Engineering Defaults

- Prefer small, safe changes.
- Avoid unrelated refactors.
- Preserve project architecture.
- Use strict TypeScript where applicable.
- Add or update tests when behavior changes.
- Explain risks and assumptions briefly.

## Scope Control

Do not load the full skill catalog into every task. NgAutoPilot works best when the selected skill is specific to the problem being solved.

# NgAutoPilot Agent Instructions

This project uses NgAutoPilot micro-skills.

## How to Use Skills

1. Read `catalog.json`.
2. Identify the smallest skill that matches the current task.
3. Read only the matching `SKILL.md` files.
4. Apply the checklist from the selected skill.
5. Keep the change focused, safe, and reviewable.

## Selection Rules

- Use `stack`, `category`, `status`, and `triggers` to find relevant skills.
- Prefer `stable` skills for production code.
- Use `experimental` skills only when explicitly relevant.
- Do not load all skills by default.
- Do not merge multiple skills unless the task clearly requires them.

## Engineering Rules

- Avoid unrelated refactors.
- Preserve existing architecture unless the task asks for architecture changes.
- Prefer the smallest safe code change.
- Add or update tests when behavior changes.
- Explain risks when changes affect architecture, performance, or public APIs.
- If project instructions conflict with a skill, follow the project instructions first.

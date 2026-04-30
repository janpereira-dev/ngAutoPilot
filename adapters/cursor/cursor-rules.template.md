# NgAutoPilot Cursor Rules

Use NgAutoPilot skills as focused task guidance.

## Rules

- Check `catalog.json` for the current task.
- Use only the smallest relevant skill.
- Read the matching `SKILL.md` before editing.
- Keep changes focused on the requested issue.
- Avoid broad refactors unless explicitly requested.
- Preserve existing naming, architecture, and testing conventions.
- Use strict TypeScript patterns.
- Avoid unnecessary `any`.
- Add or update tests when behavior changes.

## Do Not

- Do not paste all skills into the global context.
- Do not mix unrelated Angular, TypeScript, Git, and quality skills.
- Do not convert neutral skills into provider-specific instructions.

# NgAutoPilot Copilot Instructions

This repository can use NgAutoPilot skills when they are available in the project.

## Skill Usage

- Check `catalog.json` for relevant skills before making non-trivial changes.
- Load only the smallest matching skill.
- Follow the selected skill's checklist.
- Do not apply unrelated skills globally.

## Default Development Rules

- Use strict TypeScript.
- Avoid `any` unless there is a narrow, temporary, and justified reason.
- Use Jest for unit tests when tests are needed.
- Avoid Jasmine unless the target project already requires it.
- Keep Angular components simple and readable.
- Avoid heavy logic in Angular templates.
- Follow the existing project architecture.
- Avoid unrelated refactors.
- Keep pull request diffs small and reviewable.

## Expected Repository Placement

Copy this template to:

```txt
.github/copilot-instructions.md
```

If the project stores NgAutoPilot skills elsewhere, adjust paths in this file after copying.

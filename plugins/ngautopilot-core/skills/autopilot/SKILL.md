---
name: autopilot
description: Use NgAutoPilot core workflow to inspect a repository, detect stack and versions, route to the smallest useful skill, apply compatibility and risk gates, and propose minimal reversible changes.
disable-model-invocation: false
---

# NgAutoPilot Core Autopilot

Use this skill when the user asks to improve, upgrade, test, review, refactor, or validate a repository.

## Workflow

1. Inspect the repository before editing.
2. Identify framework, language, package manager, workspace type, and relevant versions.
3. Detect whether the task is Angular, TypeScript, JavaScript, quality, testing, Git, or architecture related.
4. Select the smallest relevant workflow.
5. Apply compatibility checks before recommending changes.
6. Apply risk assessment before editing files.
7. Prefer small, reversible diffs.
8. Validate with existing project commands.
9. Report what changed, why it changed, and what remains pending.

## Hard rules

- Do not invent APIs, package versions, or commands.
- Do not add dependencies unless strictly justified.
- Do not perform broad refactors when a narrow fix is enough.
- Do not mix Angular upgrade hops with modernization tasks.
- Do not expose private company information, secrets, internal URLs, or tokens.

## Output

Return:

1. Diagnosis.
2. Selected workflow.
3. Proposed minimal change.
4. Validation plan.
5. Risks.
6. Next safe step.

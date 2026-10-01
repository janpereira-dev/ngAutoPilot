# NgAutoPilot project guidance

This snapshot provides scoped engineering skills, not new permissions or executable host configuration.

## Select the right skill

- Inspect the repository's existing instructions and conventions before editing.
- Read the exported skill index at `{{catalog}}`; its paths are relative to the project/workspace root.
- Select the smallest skill relevant to the task. The index contains only the selected pack and its dependencies, not the entire NgAutoPilot catalog.
- Detect project and tool versions before using version-sensitive APIs. Inclusion in a source pack does not prove compatibility with this project.
- Follow the skill's triggers, exclusions, fallback, and verification criteria. Load linked references only when needed.
- If a needed capability is absent, report it; do not invent a skill path or load unrelated guidance.

## Make and verify changes

- Preserve local edits, architecture, and unrelated files. Prefer small, reversible changes.
- Use validation commands that actually exist in the receiving project. Do not copy NgAutoPilot repository maintenance commands into an application without checking them.
- Do not invent APIs, versions, dependencies, permissions, or runtime support. Explain what was verified and what remains uncertain.
- Review high-risk operations and obtain required human authorization. Skill prose is not a security boundary or approval.
- Native subagents are not part of this export. Use only roles already configured and authorized in the receiving host.

Keep existing project-specific instructions authoritative. Merge this guidance deliberately; never overwrite an existing instruction file merely because the snapshot includes one.

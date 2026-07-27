# Skill Lab Policy

These rules block promotion and model-backed runs.

1. No auto-adopt.
2. No writes to `skills/**`.
3. No private data.
4. No personal session mining.
5. No secrets.
6. No model secrets in fork pull requests.
7. No promotion without the test split.
8. No acceptance with critical regressions.
9. No frontmatter changes.
10. No multi-skill optimization run.

## Data Boundary

Fixtures must be synthetic and public-safe. Do not include private repository names, corporate URLs, client names, credentials, internal architecture, or real incident logs.

## Candidate Boundary

Candidates are artifacts. They are not catalog entries until a human applies a reviewed diff and the repository gates pass.

## Tool Boundary

SkillOpt is external and pinned when the bridge is implemented. `skillopt-sleep adopt` and automatic adoption flows are prohibited for NgAutoPilot.

## Agentic Gate Boundary

Agentic gates consume pre-recorded harness evidence from `skill-lab/runs/**`. They do not launch untrusted commands, publish artifacts, write canonical skills, or expose provider credentials in pull requests.

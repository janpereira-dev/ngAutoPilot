# Sage Review Layer

NgAutoPilot uses a Sage-oriented review packet for agent code, workflow files, and publish automation.

Sage is an Agent Detection & Response layer from Gen Digital. It checks high-risk actions such as:

- shell commands
- file writes
- URL fetches
- package installs

## When to use

Use Sage when reviewing changes to:

- `skills/**/SKILL.md`
- `adapters/**`
- `.github/workflows/**`
- `scripts/*.mjs`
- `catalog.json`
- publish bundles and release automation

## What Sage should look for

- unsafe shell execution
- hidden provider lock-in
- broad file-copy patterns
- workflow commands that leak secrets
- publish artifacts that include unintended files
- agent instructions that are too permissive

## How to run it

1. Generate the review packet:

   ```bash
   npm run review:sage:pack
   ```

2. Open `dist/review/sage/`.
3. Feed the packet into Sage in the agent environment you use locally.

## Platforms

Sage currently supports Claude Code, Cursor, VS Code, OpenClaw, and OpenCode through its official plugin and extension surfaces.

## Review policy

Sage is a reviewer, not a replacement for validation.

- Keep `npm run skills:validate` in the loop.
- Keep `npm run skills:catalog` in the loop.
- Keep `npm run skills:publish:pack` in the loop when publish content changes.
- Use Sage to catch risky behavior in the agent layer before it reaches a PR.

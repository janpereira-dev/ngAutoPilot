---
name: ngautopilot-frontend
description: "Framework-neutral frontend guidance for UX, accessibility, responsive design, design systems, visual validation, CSS, and web performance evidence."
---

# Frontend Experience

## Purpose

Framework-neutral frontend guidance for UX, accessibility, responsive design, design systems, visual validation, CSS, and web performance evidence.

This is a curated NgAutoPilot **gateway skill** for `npx skills`, Pi, and other broad discovery surfaces. It deliberately presents one capability boundary instead of hundreds of canonical micro-skills.



## Workflow

1. Inspect the receiving repository before proposing changes.
2. Detect Angular, Node.js, TypeScript, RxJS, package-manager, test, and workspace evidence relevant to the task.
3. Read `references/index.md` and choose the narrowest route for the task.
4. For Angular upgrades, move one supported major hop at a time and keep modernization separate until the hop is stable.
5. Apply compatibility and risk gates before editing.
6. Make the smallest reversible change.
7. Run the receiving repository's real validation commands and report evidence, failures, and residual risk.

## Routes represented by this gateway

Source packs:

- `ngautopilot-frontend`

For the complete canonical procedures, use the NgAutoPilot CLI and install the narrowest matching native pack:

- `ngautopilot-frontend`

Example:

```bash
npm exec --package=ngautopilot -- ngautopilot install --agent <agent> --pack <pack-id> --scope project --dry-run
```

Replace `<agent>` and `<pack-id>` with IDs returned by `ngautopilot adapters` and `ngautopilot packs`.

## Progressive disclosure

- Start with this gateway and `references/index.md`.
- Do not load unrelated capability families merely because they exist in the repository.
- This gateway is intentionally a routing layer, not a duplicate of the 413 canonical skill bodies.
- If an exact version-specific procedure is required, install or open the corresponding canonical pack rather than inventing missing detail.

## Safety

- Do not guess framework compatibility.
- Do not install dependencies unless the task requires them and the receiving project approves the change.
- Do not mix unrelated refactors with upgrade work.
- Do not claim validation that was not executed.
- Treat generated guidance as assistance, not as a replacement for tests, review, or security gates.

## Expected output

Return the selected route, compatibility/risk notes, changed files, validation commands and results, and any remaining blockers.

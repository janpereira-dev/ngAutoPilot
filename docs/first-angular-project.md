# First Angular Project with NgAutoPilot

## Objective

A new developer installs NgAutoPilot, selects an agent and pack, and runs a first Angular task in under 5 minutes.

## Step 1: Install

```bash
npm exec --package=ngautopilot -- ngautopilot install --agent codex --pack ngautopilot-core --scope project
```

This creates `.agents/skills/` with the Core skills and writes `AGENTS.md` at the repository root.

## Step 2: Install Angular pack

```bash
npm exec --package=ngautopilot -- ngautopilot install --agent codex --pack ngautopilot-angular --scope project
```

This adds the full Angular catalog (signals, router, forms, Material, SSR, testing, performance, security, AI/MCP).

## Step 3: Verify

```bash
npm exec --package=ngautopilot -- ngautopilot verify --agent codex --scope project
```

## Step 4: Doctor

```bash
npm exec --package=ngautopilot -- ngautopilot doctor
```

## Step 5: Open your agent

Open Codex (or Claude Code, OpenCode, Cursor, Gemini) in your Angular project. The agent reads `AGENTS.md` (or `CLAUDE.md`, etc.) and discovers the NgAutoPilot skills.

## Step 6: First prompt

```
I need to add lazy loading to my Angular routes. Check my routing and suggest the safest change.
```

The agent:
1. Reads `_core/project-intake` to understand the repo.
2. Detects Angular version.
3. Routes to `angular.router.lazy-loading` or the relevant v22 satellite.
4. Applies `compatibility-router` to verify the API is safe for the detected version.
5. Makes the smallest reversible change.
6. Validates with available commands.

## Step 7: Update

```bash
npm exec --package=ngautopilot -- ngautopilot update --agent codex --scope project
```

## Step 8: Uninstall

```bash
npm exec --package=ngautopilot -- ngautopilot uninstall --agent codex --scope project
```

## Migration scenario

For an Angular upgrade (e.g. v21 → v22):

```bash
ngautopilot install --agent codex --pack ngautopilot-angular-upgrades --scope project
```

Then prompt:

```
I need to upgrade from Angular 21 to 22. Start with the compatibility check.
```

## Frontend scenario

For accessibility or performance work:

```bash
ngautopilot install --agent codex --pack ngautopilot-frontend --scope project
```

Then prompt:

```
Review my product page for accessibility issues. Focus on keyboard navigation and form errors.
```

## Microfrontend scenario

```bash
ngautopilot install --agent codex --pack ngautopilot-angular-microfrontends --scope project
```

Then prompt:

```
I need to set up Native Federation for two Angular apps. What is the minimum configuration?
```

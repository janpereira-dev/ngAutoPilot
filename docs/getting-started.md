# Getting started: your first safe task 🧭

<!-- docs:navigation:start -->
[Español](getting-started.es.md) · [Map](README.md) · [Home](../README.md)

<!-- docs:navigation:end -->

![Four checkpoints: choose IDs, preview without writes, approve, verify files; then check host discovery.](../assets/first-run.svg)

**Outcome:** install one relevant pack and confirm that your agent can find its guidance. Start in an existing project; NgAutoPilot does not create an Angular application.

## 1. Install the simplest way

From your receiving project (Node.js 22.20+):

```bash
npx skills add janpereira-dev/ngAutoPilot
```

Choose the bundle for your Angular era or task. To preview choices first, use `npx skills add janpereira-dev/ngAutoPilot --list`. For a deterministic selection:

```bash
npx skills add janpereira-dev/ngAutoPilot --skill ngautopilot-angular -a codex
npx skills list -a codex
```

The installed gateway includes **complete local procedures** under `references/skills/`, not just a pointer to another installer. Do not load every procedure; select the one that matches your project's version.

## 2. Confirm installation, then run a task

Check that `npx skills list` shows the chosen bundle. Ask the agent to open its `references/index.md` and read the specific local `procedure.md`. Files installed on disk do not prove the host activated the skill; verify by asking the agent which procedure it selected.

## 3. Ask a bounded question

Open your agent in the project and ask:

> Inspect the stack and versions. Find the installed NgAutoPilot guidance for reviewing component boundaries. Explain a small plan before editing and report the existing checks you can run.

The intended route is intake → stack detection → skill selection → compatibility/risk review → bounded change → validation. No need to load every skill or reviewer.

## 4. Know your next step

| Need | Guide |
| --- | --- |
| Complete Angular exercise | [First Angular project](first-angular-project.md) |
| Different agent, scope, or offline use | [Installation](installation.md) |
| Choose a specific task pack | [Packs](packs.md) |
| Command details or migration gates | [CLI reference](cli-reference.md) |
| Something did not work | [Troubleshooting](troubleshooting.md) |

The native `ngautopilot init` command is deprecated; the recommended skill install is `npx skills add`. Advanced CLI operations use explicit `install` or `export`. Migration setup prepares a plan, not source transformations; a run can stop at `awaiting-executor` and cannot bypass a blocked gate.

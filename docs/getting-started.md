# Getting started: your first safe task 🧭

<!-- docs:navigation:start -->
[Español](getting-started.es.md) · [Map](README.md) · [Home](../README.md)

<!-- docs:navigation:end -->

![Four checkpoints: choose IDs, preview without writes, approve, verify files; then check host discovery.](../assets/first-run.svg)

**Outcome:** install one relevant pack and confirm that your agent can find its guidance. Start in an existing project; NgAutoPilot does not create an Angular application.

## 1. Check your tools

This checkout requires Node.js >= 24.0.0 and < 25. Run `node --version`, then:

```bash
npm exec --package=ngautopilot -- ngautopilot help
npm exec --package=ngautopilot -- ngautopilot adapters
npm exec --package=ngautopilot -- ngautopilot packs
```

These commands inspect a published version. For this branch, use `node bin/ngautopilot.mjs help` from the NgAutoPilot repository. Pin an exact released package version in automation.

## 2. Inspect, then approve

Run from the receiving project's root:

```bash
npm exec --package=ngautopilot -- ngautopilot install --agent codex --pack ngautopilot-angular-foundations --scope project --dry-run
npm exec --package=ngautopilot -- ngautopilot install --agent codex --pack ngautopilot-angular-foundations --scope project --yes
npm exec --package=ngautopilot -- ngautopilot verify --agent codex --scope project
```

Review the first command before running the second. `--yes` approves writes; without it an operation needing approval does not write. `verify` checks files, not host discovery.

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

`init` is deprecated. Prefer explicit `install` or `export`. Migration setup prepares a plan, not source transformations; a run can stop at `awaiting-executor` and cannot bypass a blocked gate.

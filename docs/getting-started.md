# Getting Started

NgAutoPilot is distributed as the `ngautopilot` npm package and exposes the `ngautopilot` CLI.

## First Run

Use `npm exec` when you want a deterministic one-off invocation without a global install:

```bash
npm exec --package=ngautopilot -- ngautopilot help
npm exec --package=ngautopilot -- ngautopilot packs
npm exec --package=ngautopilot -- ngautopilot adapters
npm exec --package=ngautopilot -- ngautopilot install --agent codex --pack ngautopilot-angular-foundations --dry-run
npm exec --package=ngautopilot -- ngautopilot doctor
```

You can also install it globally:

```bash
npm install -g ngautopilot
ngautopilot help
```

## What `install` Creates

`ngautopilot install --agent <id> --pack <id>` writes an explicit named pack,
while `ngautopilot install --agent <id> --angular <major[.minor]> --profile
<name>` resolves Angular/toolchain evidence and composes a compatible profile.
The two selection modes are mutually exclusive. Both record managed files in
`.ngautopilot-manifest.json` within the selected install root.

- Use `--dry-run` to inspect the plan without writing files.
- Use `--yes` to approve a write; without it, commands that require approval do
  not write.
- Use `ngautopilot export --agent <id> --pack <id> --output <dir>` for a portable snapshot.

`init` remains a deprecated compatibility command; new integrations should use explicit `install` or `export` commands.

## Suggested Operating Flow

1. Choose one focused pack from [packs.md](./packs.md) and run `ngautopilot install --agent <id> --pack <pack-id> --scope project` in the target repository.
2. Start with `skills/_core/project-intake/SKILL.md`.
3. Continue with `skills/_core/stack-version-detection/SKILL.md`.
4. Route into `skills/_core/skill-router/SKILL.md` and `skills/_core/compatibility-router/SKILL.md`.
5. For Angular work, check `skills/angular/versioning/` before touching upgrade hops.
6. Keep modernization work separate from major-version upgrades.

For a controlled Angular migration, prepare a plan first:

```bash
ngautopilot migrate setup --from 12 --to 22 --agent codex --yes
ngautopilot migrate run --plan .ngautopilot/migration-plan.json --agent codex --yes
```

Setup is not code migration. Run validates at most one hop and stops at
`awaiting-executor` when no authorized transformer exists; `migrate resume`
rechecks the checkpoint and cannot bypass a failed gate. For a separate bounded
read-only assignment, use `ngautopilot work plan --goal "Inspect Angular tests"`.

## Example Routes

Angular upgrade:

```txt
_core/project-intake
_core/stack-version-detection
angular/versioning/angular-version-compatibility-gate
angular/upgrades/hops/angular-14-to-15
_core/risk-assessment
```

Performance audit:

```txt
_core/project-intake
angular/performance/angular-core-web-vitals-audit
angular/performance/onpush-change-detection
```

Quality cleanup:

```txt
_core/project-intake
quality/eslint
quality/sonarqube
```

## Where To Go Next

- CLI details: [cli-reference.md](./cli-reference.md)
- Pack selection and Angular hop batches: [packs.md](./packs.md)
- Angular roadmap: [angular-roadmap-guide.md](./angular-roadmap-guide.md)
- Maintainer workflows: [maintainer-guide.md](./maintainer-guide.md)
- Release flow: [release-checklist.md](./release-checklist.md)

# NgAutoPilot Capability Platform

NgAutoPilot is a version-aware capability platform, not a flat list of prompts.
It has five deliberately separate surfaces:

1. **Source skills** define small, reviewable procedures.
2. **Packs** select a bounded subset for a task or a single upgrade hop.
3. **Adapters and subagents** translate that selection into a host-specific
   layout and optional independent review.
4. **The read-only MCP** provides catalog, coverage, routing, installation
   resolution, and repository-validation evidence to compatible clients.
5. **Distribution manifests** publish the same source policy without claiming
   that every host is natively verified.

The separation is intentional: a skills marketplace can discover individual
`SKILL.md` files, but it cannot apply the pack-selection policy or show every
non-skill asset. The npm CLI and MCP are the authoritative entry points for a
version-aware installation plan.

## Angular Support Contract

The catalog supports Angular major versions 2 through 22. Angular 3 is not a
valid endpoint because Angular 3 was not released; the first historical hop is
`2 -> 4`. Upgrade guidance remains one hop at a time and does not imply
modernization.

For daily work in an existing project, resolve only compatible core and
capability skills from local evidence:

```bash
npm exec --package=ngautopilot -- ngautopilot angular \
  --profile core \
  --capabilities ui,testing \
  --json
```

The command reads the nearest `package.json` and a supported lockfile when
available, reports the evidence level, includes compatible skills, and explains
excluded skills. It does not write files and never activates a migration hop.
For an upgrade, request the explicit bounded hop instead:

```bash
npm exec --package=ngautopilot -- ngautopilot install \
  --agent codex --pack ngautopilot-angular-12-to-13 --dry-run
```

Current profiles are `core`, `essentials`, `architecture`, `performance`,
`testing`, and `migration`. Current optional capabilities are `foundations`,
`runtime`, `state`, `testing`, and `ui`. A resolver is a selection report; the
installer remains explicitly pack-based so it never silently combines migration
or modernization work with daily-work guidance.

## Naming Contract

Skill IDs are stable, namespaced contracts such as `core.risk-assessment` and
`angular.versioning.angular-version-gates`. Their public titles describe the
actual scope:

- `Core` skills, including risk assessment and skill routing, are cross-stack
  orchestration and must not be misleadingly renamed as Angular APIs.
- `Angular` skills are version-gated where the framework API requires it.
- `Frontend`, `TypeScript`, `JavaScript`, CSS, and quality skills retain their
  real domain rather than pretending to be Angular-only.

This preserves correct discovery and backwards compatibility for installed
assets, plugins, and marketplace URLs. Product pages should present the
namespace and pack context alongside the title instead of performing a broad,
breaking title or path rename.

## MCP Contract

The `ngautopilot-tools` MCP is read-only. It exposes:

- `platform.inventory` for skills, Angular upgrade coverage, packs, adapters,
  subagents, distribution surfaces, and structural-quality counts.
- `angular.installation.resolve` for evidence-backed selection in a local
  Angular project.
- `upgrade.plan` for explicit sequential upgrade hops.
- `catalog.quality` for deterministic content signals.
- search, routing, pack, stack, compatibility, and repository-consistency
  tools.

`catalog.quality` intentionally does **not** claim that prose has semantic
value. It is a structural signal only. Promotion of guidance requires the
Skill Lab benchmark/adversarial evidence and human review described in
[`skill-lab/README.md`](../skill-lab/README.md).

## Adapter And Distribution Truth

`ngautopilot adapters --json` is the source of truth for the ten adapter IDs
and their verification status. Native, adapter, experimental, unverified, and
export-only statuses are not interchangeable; a manifest is not proof that a
third-party marketplace has accepted a submission.

The repository currently contains marketplace manifests for Claude and Codex,
an OpenAI skills-only package source manifest, and adapters for Copilot,
Cursor, Gemini, Hermes, OpenClaw, OpenCode, Pi, and generic Markdown clients.
Use the adapter status before representing a client as published or verified.

## Local Research Intake

`/info/` is intentionally ignored by Git and must stay local. NgAutoPilot does
not read, package, index, or upload it automatically. Before any external
source becomes a public skill, fixture, benchmark, or documentation claim:

1. remove credentials, tokens, personal data, internal hostnames, customer
   names, proprietary source, and unlicensed content;
2. record the origin, date, license/permission, and the exact public claim it
   supports in a reviewed public artifact;
3. add deterministic tests or fixtures that contain only sanitized material;
4. run the security, catalog, distribution, and relevant Skill Lab gates.

## Adding Angular 23 And Later

Adding a future major is additive:

1. verify its published compatibility constraints from primary Angular sources;
2. add the prior-major-to-new-major hop only when facts and fixtures exist;
3. add narrowly scoped satellites for actual breaking changes or APIs;
4. declare compatibility in source skill frontmatter and pack selection;
5. add resolver/MCP/CLI tests, regenerate catalog and plugin artifacts, and
   update the version-era map;
6. run release validation and publish only the verified distribution surfaces.

No step rewrites earlier-version skills, and no compatibility claim is inferred
from a newer major.

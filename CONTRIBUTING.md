# Contributing to NgAutoPilot

<!-- docs:navigation:start -->
[Español](CONTRIBUTING.es.md) · [Map](docs/README.md) · [Home](README.md)

<!-- docs:navigation:end -->

NgAutoPilot is a catalog of small, public, agent-agnostic skills. Contributions should improve practical Angular, TypeScript, JavaScript, RxJS, testing, quality, architecture, or Git workflows.

## Quick path

1. Check whether a skill already solves the problem.
2. Edit its canonical source and preserve compatibility boundaries.
3. Validate, regenerate affected distributions, and show evidence in review.

## Proposing a Skill

Before adding a skill, confirm that it solves one concrete problem.

Good:

- `avoid-template-functions`
- `avoid-nested-subscriptions`
- `trackby-for-lists`

Avoid:

- `angular-best-practices`
- `rxjs-guide`
- `frontend-quality`

If the topic contains multiple independent rules, split it into multiple skills.

## Acceptance Criteria

A skill can be accepted when it:

- Solves a small, repeatable engineering problem.
- Uses neutral language such as "the agent should" or "the assistant should".
- Avoids naming one provider as the required execution environment.
- Has clear triggers.
- Includes good and bad examples.
- Includes a practical review checklist.
- Avoids private, corporate, confidential, or project-specific content.
- Does not contradict existing stable skills.
- Passes `npm run skills:validate`.

Follow [the skill authoring guide](docs/skill-authoring.md) for precise routing, natural instructions, progressive disclosure, and behavior-based evidence. `node scripts/audit-skill-content.mjs` reports known editorial signals across source skills; it is advisory and does not replace domain review or behavioral testing.

## Naming Convention

Use kebab-case for folders:

```txt
avoid-template-functions
onpush-change-detection
trackby-for-lists
```

Use dot notation for skill IDs:

```txt
angular.performance.avoid-template-functions
typescript.strict-types.avoid-any
```

The folder path should map directly to the ID:

```txt
skills/angular/performance/avoid-template-functions/SKILL.md
```

```yaml
id: angular.performance.avoid-template-functions
```

## Required Skill Structure

Each skill must follow `templates/SKILL.template.md` and include:

- Frontmatter metadata.
- `## Purpose`
- `## When to Use`
- `## Do`
- `## Do Not`
- `## Review Checklist`
- `## Expected Output`

## Required Metadata

Each skill must include:

- `id`
- `name`
- `description`
- `stack`
- `category`
- `status`
- `version`
- `owner`
- `triggers`

Compatibility-aware skills may also include:

- `compatibility`
- `variants`
- `fallbacks`
- `detects`

Use these fields when a recommendation changes by Angular, TypeScript, RxJS, Node, framework syntax, or tooling version. Do not recommend a modern pattern unless the metadata and skill body explain the fallback for older projects.

Accepted source and distribution status: `stable`. The creation template starts at `draft` for authoring, but drafts are not accepted by `skills:validate`; finish review and replace scaffold text before promotion.

These are metadata vocabulary, not release acceptance. The current publishable
catalog requires stable skills. Structural validation alone does not prove
successful behavior in an actual agent.

## Public Content Rules

Do not include:

- Company names unless they are public technology names.
- Internal project names.
- Internal routes, domains, repositories, credentials, or screenshots.
- Customer data.
- Private architecture decisions.
- Tool-specific instructions inside skills.

Provider-specific guidance belongs in `adapters/`, not in `skills/`.

## Pull Request Flow

1. Create or update a skill.
2. Run `npm run skills:validate`.
3. Run `npm run skills:catalog`.
   Regenerate affected bundles with `npm run plugins:sync` and
   `npm run agent-plugins:sync`, then review the generated diff.
4. Run `npm run skills:publish:pack` when the change affects public packaging.
5. Run `npm run review:sage:pack` when the change touches agent instructions, workflows, or publish scripts.
6. Confirm `catalog.json` contains the expected entry.
7. Open a pull request with a short explanation of the problem solved.
8. Address review feedback.

## Branch Naming

Use short, descriptive branch names:

```txt
feat/core-autopilot-operating-layer
feat/angular-dependency-injection-skill
feat/marketplace-publish-bundles
```

Keep unrelated work in separate branches when it affects public docs, skill content, or workflows.

Codex-created branches default to `codex/`. Use conventional commits; do not
add AI attribution or `Co-Authored-By` trailers.

## Bilingual documentation

Update the English original and its complete `.es.md` companion together.
Run `npm run docs:index` and `npm run docs:validate`. Preserve runtime skill
headings and IDs in their canonical language; translation does not create a
second operational skill catalog. A partial edition is not complete coverage.

## Contribution Checklist

- [ ] The skill solves one narrow problem.
- [ ] The skill uses neutral agent language.
- [ ] The skill has clear triggers.
- [ ] Good and bad examples are included.
- [ ] The checklist is actionable.
- [ ] No private or confidential content is included.
- [ ] `npm run skills:validate` passes.
- [ ] `npm run skills:catalog` was run.
- [ ] `npm run skills:publish:pack` was run when publish output changed.
- [ ] `npm run review:sage:pack` was run when agent instructions or workflows changed.

## Contributing guardrails, subagents, and adapters

### Guardrail

1. Place the narrowly-scoped source under `skills/` and follow the skill template; do not turn a guideline into a universal refusal rule.
2. Define the risk boundary, authorized behavior, safe fallback, and concrete verification. Include an adversarial example and a legitimate task that must remain allowed.
3. Declare version/stack compatibility with first-party evidence; preserve older-project fallbacks. Upgrade hops and modernization are separate concerns.
4. Connect the capability to a pack only when its routing actually requires it. Add a behavior regression test for any executable enforcement.

### Subagent or prompt

1. Use canonical Markdown under `agents/ngautopilot/`, following an existing role's structure and filename conventions.
2. Describe responsibility, inputs, evidence, output, limits, and handoff. Do not invent tools or grant permissions merely through prose.
3. Add the role/prompt ID to the appropriate pack and prove dependency resolution. Native host schemas are adapter-specific; source role Markdown alone is not a verified host subagent.
4. Test the routing boundary and expected result where executable logic changes. Keep independent human approval outside agent roles.

### Adapter

1. Add or change a declarative adapter manifest and scoped template; keep shared planning/filesystem behavior in `adapters/_shared/`.
2. Review current first-party discovery, scope, naming, trust, and instruction documentation. Update `adapters/native-layouts.json` and its independent integration tests together.
3. Follow [adapter maintenance](docs/adapter-maintenance.md). Do not copy Markdown into a JSON configuration or call an export test a real host invocation.
4. If installation roots change, supply a checksum-preserving migration and backup/restore tests. Never silently orphan an old owned manifest or overwrite local edits.
5. Keep new adapter counts, registry coverage, and distribution validation aligned; the present contract covers ten adapters.

### CLI or processing script

Use existing `node:test` tests for CLI/filesystem integration. Use Vitest in `tests/scripts/**/*.spec.mjs` for isolated processing fixtures. Cover success, deterministic reruns, malformed inputs, source integrity, and failure without partial destructive output. No production dependency is justified solely for test convenience.

Before opening a PR:

```bash
npm run skills:validate
npm run skills:catalog
npm run plugins:sync
npm run agent-plugins:sync
npm run test:scripts
npm run release:validate
npm run skill-lab:ci
npm run review:sage:pack
claude plugin validate .
```

Run suites sequentially when they create temporary source fixtures. Review generated diffs; do not hand-edit the catalog or generated bundles. Follow [pack transitions](docs/pack-transitions.md) for filesystem changes and [Sage review](docs/sage-review.md) for high-risk operations. Packet creation is not security approval.

## MCP dependency updates

Update the MCP client and server together. Dependabot groups their minor/patch
updates; major updates still require a separate compatibility review. After an
upgrade, run `npm ci`, then `npm run agent-plugins:sync`, and commit the generated
server bundle, mirrored package metadata, and `third-party/` license files with
the root manifests. The generator copies complete upstream licenses/notices for
dependencies actually included in the standalone bundle; the project's own
license remains MIT. Never bypass generated-drift checks. Run the full release
and Skill Lab gates, not only focused MCP tests. Publish changed distributions
under a new release instead of replacing an existing release tag or assets.

## Required PR checks and review

`validate-release` validates skills, catalog generation/drift, distribution, scripts, and integration tests on every PR. `validate-skill-lab` validates the behavioral lab and the full release contract. Both have unique, stable check names without path filters and are configured as required status checks with an up-to-date base branch. GitHub repository protection is an external setting; workflow YAML alone is insufficient.

Required human/code-owner approval remains in force. Fix actionable reviewer threads, rerun checks after each relevant revision, and re-fetch review/check state before calling a PR merge-ready. Never forge an approval or weaken protection to make a status green. The [architecture diagrams](docs/ecosystem-architecture.md) explain the source, selection, compatibility, adapter, and publication boundaries.

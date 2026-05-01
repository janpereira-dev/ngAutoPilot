# Contributing to NgAutoPilot

NgAutoPilot is a catalog of small, public, agent-agnostic skills. Contributions should improve practical Angular, TypeScript, JavaScript, RxJS, testing, quality, architecture, or Git workflows.

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

Allowed statuses:

- `draft`
- `review`
- `stable`
- `deprecated`
- `experimental`

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

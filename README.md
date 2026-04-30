# NgAutoPilot

NgAutoPilot is a public, agent-agnostic catalog of micro-skills for Angular, TypeScript, JavaScript, RxJS, testing, frontend architecture, code quality, and pull request review.

It is designed to help AI agents apply small, repeatable engineering practices without binding the knowledge to one tool or provider. Skills live as neutral Markdown files. Adapters translate the catalog into instructions for different agent environments.

## Problem

AI agents often receive large prompts that mix architecture, style, testing, performance, and review guidance into one long instruction. That approach is hard to maintain, expensive to load, and easy to apply incorrectly.

NgAutoPilot solves this by keeping each rule small:

- One skill addresses one concrete problem.
- Each skill has metadata, triggers, examples, anti-patterns, a checklist, and expected output.
- Agents should load only the smallest applicable skill for the current task.

## What Is a Micro-Skill?

A micro-skill is a focused operational instruction that helps an agent handle a specific and repeatable development scenario.

Good examples:

- `angular.performance.avoid-template-functions`
- `angular.performance.trackby-for-lists`
- `angular.rxjs.avoid-nested-subscriptions`
- `typescript.strict-types.avoid-any`

Poor examples:

- `angular-best-practices`
- `typescript-guide`
- `frontend-clean-code`

If a skill cannot be read quickly or applies to too many unrelated situations, it should be split.

## What This Project Is Not

NgAutoPilot is not:

- A giant prompt.
- A framework.
- A replacement for project architecture.
- A collection of private or company-specific rules.
- A tool coupled to Claude, Copilot, Codex, Cursor, Gemini, or any other provider.
- A full CLI product.

The MVP is intentionally simple: Markdown skills, a catalog, basic validation, and adapter templates.

## Repository Structure

```txt
skills/
  angular/
    architecture/
    performance/
    testing/
    forms/
    rxjs/
    signals/
  typescript/
    strict-types/
    dto-mappers/
  javascript/
  quality/
  git/
adapters/
  generic/
  copilot/
  claude/
  codex/
  cursor/
  gemini/
schemas/
templates/
scripts/
```

## Skill Format

Every skill must include:

- Frontmatter metadata.
- Purpose.
- When to use.
- Recommended patterns.
- Anti-patterns.
- Review checklist.
- Expected output.

Use `templates/SKILL.template.md` as the source of truth.

## Compatibility-Aware Skills

NgAutoPilot skills should not assume that every project uses the latest Angular version. Version-sensitive skills should detect the project profile first, then choose the compatible implementation.

Example:

```txt
Angular 2-16  -> *ngFor + trackBy
Angular 17-19 -> @for with track when supported
Angular 20+   -> prefer @for for new list rendering code
```

When a skill uses modern syntax such as signals, `@for`, `@defer`, standalone routes, or `takeUntilDestroyed`, it should include a fallback for older projects.

## Creating a Skill

Create a new skill from a path under `skills/`:

```bash
npm run skills:create -- angular/performance/lazy-loading-routes
```

The script creates:

```txt
skills/angular/performance/lazy-loading-routes/SKILL.md
```

It infers:

- `id` from the path using dot notation.
- `name` from the final folder.
- `category` from the second path segment.
- `stack` from the first path segment.

After creating the file, replace the generated draft content with specific guidance before opening a pull request.

## Validating Skills

Run:

```bash
npm run skills:validate
```

Validation checks that every `SKILL.md` under `skills/` has:

- Required frontmatter.
- Required sections.
- Allowed status.
- No `TODO` markers.

## Generating the Catalog

Run:

```bash
npm run skills:catalog
```

This regenerates `catalog.json` from skill frontmatter and sorts entries by `id`.

## Using Adapters

Adapters are templates for connecting NgAutoPilot to different agent environments. They should not duplicate skill content.

Export an adapter template:

```bash
npm run skills:export -- generic
npm run skills:export -- copilot
npm run skills:export -- codex
```

Generated files are written to:

```txt
dist/adapters/
```

Adapter rule:

> Read `catalog.json`, select the smallest matching skill, then apply only that skill.

## Initial Roadmap

### 0.1.x

- Establish the public repository structure.
- Define the skill template and validation rules.
- Publish the first Angular and TypeScript micro-skills.
- Provide initial adapter templates.

### 0.2.x

- Add contribution review automation.
- Add more testing, RxJS, forms, and architecture skills.
- Improve catalog validation with JSON Schema.

### 0.3.x

- Add richer adapter exports.
- Add optional examples per skill.
- Evaluate safe codemod and lint-rule integrations.

## Design Principles

- Keep skills small and specific.
- Keep skill content provider-neutral.
- Avoid private, corporate, or confidential references.
- Prefer practical examples over abstract advice.
- Avoid unrelated refactors when applying a skill.
- Keep the MVP simple enough to maintain.

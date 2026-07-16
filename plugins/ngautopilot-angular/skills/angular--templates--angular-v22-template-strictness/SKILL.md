---
id: angular.templates.angular-v22-template-strictness
name: Angular v22 Template Strictness
description: >
  Use this skill when Angular 22 template changes, diagnostics, or syntax rules need to be reviewed or fixed.
stack:
  - Angular
  - TypeScript
category: templates
status: stable
version: 0.5.1
owner: NgAutoPilot
triggers:
  - templates
  - strictTemplates
  - fullTemplateTypeCheck
  - "@switch"
  - optional chaining
compatibility:
  angular:
    min: "22"
---

# Angular v22 Template Strictness

## Purpose

Use this skill when Angular 22 template changes, diagnostics, or syntax rules need to be reviewed or fixed.

## When to Use

Use this skill when:

- Templates started failing or producing new diagnostics after the v22 update.
- The app uses advanced template syntax or strict compiler options.
- Component selectors or bindings may collide in a way v22 now rejects.

## When Not to Use

Do not use this skill when:

- The issue is purely business logic.
- The task is only about styles or CSS.
- A narrower form, router, or components skill is the better fit.

## Required Inputs

- template diagnostics
- component selectors
- compiler options
- affected inline templates

## Procedure

1. Fix the strict-template diagnostics first.
2. Make binding intent explicit wherever v22 removed ambiguity.
3. Update template syntax that now follows stricter JavaScript-like rules.
4. Re-run the compiler or template-focused tests after the change.

## Do

- Prefer explicit bindings and clear template intent.
- Resolve compiler errors instead of suppressing them by default.
- Keep complex logic out of templates unless it is clearly safe.

## Do Not

- Do not rely on fullTemplateTypeCheck anymore.
- Do not keep ambiguous data-* or selector behavior in new code.
- Do not hide template errors that v22 surfaces correctly.

## Review Checklist

- [ ] The template diagnostics are understood.
- [ ] Strict template behavior is intentional.
- [ ] The affected templates compile cleanly.

## Expected Output

When this skill is used, the agent should:

1. A template-strictness summary.
2. The exact diagnostics that changed.
3. The updated template fix.

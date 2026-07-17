---
id: angular.upgrade.forms.angular-typed-forms-migration
name: Angular Typed Forms Migration
description: >
  Migrates Angular reactive forms to typed forms in bounded slices, or uses an untyped bridge when risk, scale, or test coverage make a full typed migration unsafe.
stack:
  - Angular
  - TypeScript
category: forms
status: stable
version: 0.5.2
owner: NgAutoPilot
triggers:
  - typed forms
  - untyped forms bridge
  - reactive forms typing
  - FormControl generic
compatibility:
  angular:
    min: "14"
    max: "21"
---

# Angular Typed Forms Migration

## Purpose

Use this skill to migrate Angular reactive forms to typed forms in bounded slices.

This skill does not upgrade Angular itself. It focuses on the form model and supports either typed migration or an untyped bridge when the project is too large or risky to convert all at once.

## When to Use This Skill

Use this skill when:

- Angular 14 or later is already in place.
- The project uses reactive forms heavily.
- You need to convert `FormControl`, `FormGroup`, `FormArray`, or `FormBuilder` usage.
- The forms model is large enough that typed migration must be staged.
- The upgrade hop selected typed forms as a separate follow-up step.

## When Not to Use This Skill

Do not use this skill when:

- The project is still on Angular 13 or lower.
- The task is only about template-driven forms.
- The project has no meaningful reactive forms usage.
- The team wants a full form-system rewrite instead of bounded migration.

## Inputs Expected

- Angular version
- Reactive forms inventory
- Current `FormControl`, `FormGroup`, `FormArray`, `FormBuilder` usage
- Custom validators and async validators
- Custom form subclasses
- Test coverage
- Typed/untyped strategy preference

## Compatibility by Version

| Angular                            | Strategy recommended  | Observations                                              |
| ---------------------------------- | --------------------- | --------------------------------------------------------- |
| Angular 14+                        | Typed forms available | Use typed forms or an untyped bridge explicitly.          |
| Angular 14+ large legacy app       | Untyped bridge        | Safer when coverage is low or forms are complex.          |
| Angular 14+ small well-tested form | Typed forms           | Prefer typed migration when the diff is small and stable. |

If a version cannot be confirmed from the project files, mark it as `verify in project`.

## Procedure

1. Inventory reactive forms usage.
2. Classify each form by size, complexity, and test coverage.
3. Select typed, untyped bridge, or mixed bounded migration.
4. Migrate one slice at a time.
5. Keep runtime validation behavior unchanged.
6. Validate the touched forms.
7. Document remaining untyped or legacy forms.

## Do

- Prefer typed forms for small, well-tested forms.
- Use `UntypedFormControl`, `UntypedFormGroup`, `UntypedFormArray`, and `UntypedFormBuilder` as a bridge when the migration is too large.
- Keep custom validators explicit and type-safe where practical.
- Review custom `FormControl`, `FormGroup`, and `FormArray` subclasses carefully.
- Preserve runtime validation and user-facing behavior.

## Recommended Patterns

Typed example:

```ts
const form = new FormGroup({
  name: new FormControl<string>("", { nonNullable: true }),
  age: new FormControl<number | null>(null),
});
```

Untyped bridge example:

```ts
const form = new UntypedFormGroup({
  name: new UntypedFormControl(""),
  age: new UntypedFormControl(null),
});
```

Custom validator example:

```ts
const validator: ValidatorFn = (control: AbstractControl) => {
  return typeof control.value === "string" && control.value.length > 0
    ? null
    : { required: true };
};
```

## Anti-Patterns

- Converting all forms to typed forms in one large diff.
- Using `any` to silence typed form errors.
- Changing runtime validation behavior while typing forms.
- Migrating custom form abstractions without tests.
- Mixing typed and untyped APIs on the same control without a deliberate bridge.
- Rewriting forms architecture while trying to type forms.

## Do Not

- Do not upgrade Angular in this skill.
- Do not change unrelated application architecture.
- Do not force typed forms when a bridge is safer.
- Do not run commands that do not exist in `package.json`.

## Review Checklist

- [ ] Reactive forms inventory exists.
- [ ] Forms were classified by risk and size.
- [ ] Typed, untyped, or mixed strategy is explicit.
- [ ] Runtime validation behavior is preserved.
- [ ] Custom validators are reviewed.
- [ ] Custom form subclasses are reviewed.
- [ ] Validation was planned or executed.

## Validation Minimum

Use only repository commands that actually exist.

Prefer:

- build
- test
- lint

If validation cannot run, report the blocker and the safest next step.

## Risks

- Typed forms can expose latent nullability and generic issues.
- Untyped bridge can hide technical debt if left in place too long.
- Custom form subclasses may need more work than simple controls.
- Tests may assume loose stringly-typed form values.

## Expected Output

When this skill is used, return:

1. Reactive forms inventory summary.
2. Selected forms strategy.
3. Typed vs untyped bridge decision.
4. Custom validator and subclass risks.
5. Validation commands and results.
6. Next recommended step.

## Exit Criteria

This skill is complete only when:

- A typed or untyped strategy is explicit.
- Forms were migrated in bounded slices.
- Runtime validation behavior is preserved.
- Remaining debt is documented.
- No Angular version upgrade was performed in this skill.

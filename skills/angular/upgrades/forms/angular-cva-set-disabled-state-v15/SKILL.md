---
id: angular.upgrade.forms.angular-cva-set-disabled-state-v15
name: Angular CVA setDisabledState v15
description: >
  Reviews custom ControlValueAccessor implementations for Angular 15 setDisabledState behavior and form integration risks.
stack:
  - Angular
  - TypeScript
category: forms
status: draft
version: 0.3.1
owner: NgAutoPilot
triggers:
  - ControlValueAccessor
  - setDisabledState
  - NG_VALUE_ACCESSOR
compatibility:
  angular:
    min: "15"
---

# Angular CVA setDisabledState v15

## Purpose

Use this skill to review custom `ControlValueAccessor` implementations for Angular 15 `setDisabledState` behavior.

## When to Use This Skill

- The project contains custom CVAs.
- Form controls have custom disabled behavior.

## Do

- Check `writeValue`, `registerOnChange`, `registerOnTouched`, and `setDisabledState`.
- Confirm disabled state flows match the component behavior.

## Do Not

- Do not ignore custom CVAs in critical forms.
- Do not rely on undocumented disabled behavior.

## Review Checklist

- [ ] CVA inventory is complete.
- [ ] setDisabledState is implemented or explicitly not required.
- [ ] Disabled behavior is tested or documented.

## Expected Output

1. CVA inventory.
2. setDisabledState coverage.
3. Risk or required fix.

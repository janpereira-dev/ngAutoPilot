---
id: angular.upgrade.security.angular-iframe-binding-hardening
name: Angular Iframe Binding Hardening
description: >
  Reviews iframe bindings and host bindings for Angular 15-era security and behavior hardening.
stack:
  - Angular
  - TypeScript
category: security
status: stable
version: 0.5.1
owner: NgAutoPilot
triggers:
  - iframe binding
  - iframe security
  - sandbox
  - allow attribute
compatibility:
  angular:
    min: "15"
---

# Angular Iframe Binding Hardening

## Purpose

Use this skill to review iframe bindings and host bindings for Angular 15-era security hardening.

## When to Use This Skill

- The app binds iframe `src`, `sandbox`, `allow`, or `referrerPolicy`.
- Host bindings control iframe attributes.

## Do

- Review `[src]`, `[sandbox]`, `[allow]`, `[referrerPolicy]`, and host bindings that affect iframe behavior.
- Verify that security-sensitive values are not being elevated to unsafe bindings.

## Do Not

- Do not move sensitive data into iframe query parameters.
- Do not hardcode unsafe origins or permissive sandbox values.

## Review Checklist

- [ ] Iframe bindings are inventoried.
- [ ] Security-sensitive attributes are reviewed.
- [ ] Safe/unsafe behavior is documented.

## Expected Output

1. Iframe bindings found.
2. Risk assessment.
3. Required hardening changes.

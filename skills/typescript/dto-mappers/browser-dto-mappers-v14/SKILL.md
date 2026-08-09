---
id: typescript.dto-mappers.browser-dto-mappers-v14
name: Browser DTO Mappers v14+
description: >
  Reviews DTO mapping in browser-oriented TypeScript code, focusing on mapping contracts, view models, serialization boundaries, and safe transformations near UI code.
stack:
  - TypeScript
  - Browser
category: dto-mappers
status: stable
version: 0.6.0
owner: NgAutoPilot
triggers:
  - browser dto mapping
  - browser dto mappers
  - view model mapping
  - serialization boundary
  - ui mapping contract
compatibility:
  runtime:
    browser: true
---

# Browser DTO Mappers v14+

## Purpose

Use this skill for DTO mapping in browser-oriented TypeScript code.

This variant emphasizes view-model boundaries, UI-safe transformations, and keeping browser-facing data models separate from transport DTOs.

## When to Use

Use this skill when:

- browser code maps API DTOs to view models
- UI state needs a stable contract
- serialization or deserialization boundaries are visible in frontend code

## Do

Map DTOs into view models near the browser boundary.

Keep mapping pure and deterministic.

Separate transport shape from UI shape.

## Do Not

Avoid binding raw backend DTOs directly to templates.

Avoid mixing browser mapping with server-only concerns.

## Review Checklist

- [ ] Browser mapping boundary is explicit.
- [ ] DTOs and view models are separate.
- [ ] Mapping is pure and testable.

## Expected Output

When this skill is used, the agent should:

1. Identify browser DTO boundaries.
2. Recommend view-model mapping.
3. Keep mapping pure.
4. Avoid raw DTO leakage into UI code.
5. Produce browser-safe mapping guidance.

---
id: javascript.ecmascript-compatibility-semantics
name: ECMAScript Compatibility Semantics
description: Assess opt-in JavaScript language, host, toolchain, library, and polyfill risks before adopting a feature or changing observable semantics.
stack:
  - JavaScript
  - ECMAScript
category: compatibility
status: stable
version: 0.6.0
owner: NgAutoPilot
triggers:
  - ECMAScript compatibility
  - polyfill risk
  - JavaScript semantics
  - library support
  - toolchain target
---

# ECMAScript Compatibility Semantics

## Purpose

Offer a narrowly scoped compatibility review for libraries, build tools, polyfills, and semantic changes. This is opt-in guidance, not a default skill for ordinary application or frontend work.

## When to Use

Use this skill when:

- publishing or upgrading a library that exposes JavaScript language behavior;
- changing transpilation targets, module output, polyfills, or runtime support boundaries;
- adopting a language feature whose syntax, host API availability, or transformed behavior may differ for consumers.

Route project-wide risk decisions through `core.compatibility-router` and use the relevant Angular or TypeScript compatibility gate for framework and compiler constraints.

## Do

- Separate the ECMAScript standard feature from host-provided APIs and from toolchain transforms or type declarations.
- Inspect declared runtime targets, supported environments, library peer constraints, and generated output before changing compatibility guidance.
- Identify observable semantic differences such as iteration order, async scheduling, module resolution, error behavior, or global mutation.
- Prefer documented consumer support policy and existing compatibility gates over assumptions based on a local runtime.
- State whether a polyfill is needed, where it loads, its scope, and its impact on consumers before adding it.

## Do Not

- Do not use this skill as a reason to import a wholesale standards reference tree into an application catalog.
- Do not equate syntax parsing with runtime support.
- Do not claim that a browser, Node.js release, bundler, or framework supports a feature without current evidence.
- Do not add global polyfills or compatibility packages by default.

## Review Checklist

- [ ] Standard semantics, host availability, and toolchain output are evaluated separately.
- [ ] Supported consumer runtimes and generated targets are known or explicitly unknown.
- [ ] Library public behavior and side effects are covered by focused tests.
- [ ] Any polyfill has a bounded loading and ownership decision.
- [ ] The existing compatibility router or appropriate gate is referenced in the decision.

## Expected Output

When this skill is used, the agent should:

1. Classify the risk as standard, host, toolchain, dependency, or polyfill related.
2. State the supported environment evidence and unresolved assumptions.
3. Recommend the smallest compatible action and focused validation.
4. Route broader project decisions to the existing compatibility gate.

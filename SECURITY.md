# Security Policy

<!-- docs:navigation:start -->
[Español](SECURITY.es.md) · [Map](docs/README.md) · [Home](README.md)

<!-- docs:navigation:end -->

**Do not disclose security-sensitive details in a public issue.** Use an
available private reporting channel and share only necessary, sanitized evidence.

## Policy scope

NgAutoPilot is a documentation and skill catalog repository. Security guidance applies to:

- workflow files
- scripts
- published catalog bundles
- adapter templates
- skill metadata and content

## Reporting A Vulnerability

Do not open a public issue for a security-sensitive report.

Use one of these channels instead:

- GitHub Security Advisory, if enabled for the repository
- a private maintainer contact path
- an existing private contact channel supplied by maintainers

Do not assume GitHub provides generic private repository messaging or invent a
contact address. If no private channel is visible, ask for a contact method
without revealing the vulnerability. This policy does not define a guaranteed
version-support window or response deadline.

Include:

- affected file or workflow
- risk description
- reproduction steps, if safe to share
- suggested fix, if known

## What Counts As A Security Issue

Examples include:

- shell execution in skills or workflows that can be abused
- untrusted file copying in publish scripts
- credential leakage in actions
- unsafe defaults in generated bundles
- dependency or supply-chain issues in workflows

## Local Review Layer

Sage can be used locally to review agent instructions and publish workflows before they reach a pull request.

Use Sage to inspect:

- `skills/**/SKILL.md`
- `adapters/**`
- `.github/workflows/**`
- `scripts/*.mjs`

Do not treat Sage as a replacement for reporting a security issue to maintainers.

## Response Goal

Reports should be acknowledged, triaged, and resolved with the smallest safe change. If a fix touches workflows or publish automation, validate the change before release.

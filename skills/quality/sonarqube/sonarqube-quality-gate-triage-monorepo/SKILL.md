---
id: quality.sonarqube.sonarqube-quality-gate-triage-monorepo
name: SonarQube Quality Gate Triage Monorepo
description: >
  Triage SonarQube findings in monorepo workspaces by separating workspace-wide blockers from local cleanup, using project context, new-code scope, and quality gate impact.
stack:
  - JavaScript
  - TypeScript
category: sonarqube
status: stable
version: 0.3.1
owner: NgAutoPilot
triggers:
  - sonar monorepo triage
  - quality gate monorepo
  - nx sonar
  - workspace sonar issues
compatibility:
  runtime:
    browser: true
    node: true
---

# SonarQube Quality Gate Triage Monorepo

## Purpose

Use this skill to triage SonarQube findings in monorepo workspaces.

This variant adds workspace awareness so the agent can separate global gate blockers from local library cleanup and avoid mixing unrelated project issues.

## When to Use

Use this skill when:

- the repo is a monorepo
- Sonar findings cross project boundaries
- the quality gate is affected by workspace-wide code
- local cleanup must remain bounded

## Do

Consider:

- project ownership
- new code versus overall code
- library versus app impact
- shared versus local cleanup

Prioritize blockers that affect the shared workspace first.

## Do Not

Avoid treating every project finding as equally urgent.

Avoid mixing one project's cleanup with workspace-wide triage.

## Review Checklist

- [ ] Workspace impact was considered.
- [ ] New code was separated from overall code.
- [ ] Blockers are prioritized.

## Expected Output

When this skill is used, the agent should:

1. Identify workspace-wide blockers.
2. Separate local cleanup.
3. Prioritize the gate impact.
4. Keep the response actionable.
5. Avoid noisy over-reporting.

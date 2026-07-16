# Agents and Subagents

## Overview

NgAutoPilot ships 8 canonical agent roles under `agents/ngautopilot/`. These are reference Markdown files — not executable agents. An AI agent reads the role definition and adopts the persona for a focused task.

## Invocation policy

```
1 task → 1 orchestrator → max 3 primary subagents → helpers only under trigger
```

Do not activate all subagents for every task.

## Primary subagents

| File | Role | Trigger |
| --- | --- | --- |
| `subagents/primary/01-spartan-contrarian-developer.md` | Skeptical implementation reviewer | Production code changes, fragile tests, optimistic claims |
| `subagents/primary/02-athenian-angular-architect.md` | Angular architect and structure guardian | Angular work, version detection, skill availability |
| `subagents/primary/03-roman-consolidator.md` | Delivery consolidator and validation closer | End of a task with multiple subagents involved |

## Support subagents

| File | Role | Trigger |
| --- | --- | --- |
| `subagents/support/04-stoic-typescript-guardian.md` | TypeScript strictness and contracts | TypeScript files modified, DTOs, casts, `any` |
| `subagents/support/05-rxjs-oracle.md` | RxJS and reactive flow reviewer | RxJS code, subscriptions, memory leaks |
| `subagents/support/06-testing-hoplite.md` | Jest and spec stability | `.spec.ts` changes, TestBed, fakeAsync |
| `subagents/support/07-compatibility-gatekeeper.md` | Version and migration risk | `package.json` changes, upgrade hops |
| `subagents/support/08-repo-cartographer.md` | Repository structure and discovery | New skills, catalog changes, missing SKILL.md |

## Integration

Each subagent file defines:
- Identity and philosophical style
- Mission
- Activation triggers
- Inputs expected
- Responsibilities
- Non-goals
- Operating protocol (output format)
- Required NgAutoPilot skills
- Definition of done

## How agents use them

An AI agent (Codex, Claude Code, OpenCode) loads the subagent Markdown when a trigger matches. The agent adopts the role for the scope of that task. NgAutoPilot routes the skills; the subagent provides oversight.

## Pack assignment

| Pack | Agents included |
| --- | --- |
| `ngautopilot-angular` | `athenian-angular-architect` |
| `ngautopilot-angular-upgrades` | `compatibility-gatekeeper` |
| `ngautopilot-typescript` | `stoic-typescript-guardian` |
| `ngautopilot-quality` | `spartan-contrarian-developer`, `roman-consolidator` |
| `ngautopilot-full` | All 8 |
---
id: angular.upgrade.angular-upgrade-orchestrator
name: Angular Upgrade Orchestrator
description: Coordinates Angular major-version upgrades by detecting the source version, selecting the next allowed hop, and delegating execution to a bounded hop skill.
stack:
  - Angular
  - TypeScript
  - RxJS
category: upgrades
status: draft
version: 0.3.0
owner: NgAutoPilot
---

# Angular Upgrade Orchestrator

Use this skill to coordinate an Angular upgrade path by detecting the current major, choosing the next valid hop, and routing the work to a bounded hop skill.

This skill does not perform the full upgrade itself. It plans the path one major at a time and stops after selecting the next hop.

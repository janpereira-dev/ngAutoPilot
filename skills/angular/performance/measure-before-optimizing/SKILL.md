---
id: angular.performance.measure-before-optimizing
name: Angular Measure Before Optimizing
description: >
  Guides Angular performance work through evidence, measurement, hypothesis, minimal change, and re-measurement before refactoring.
stack:
  - Angular
  - TypeScript
  - JavaScript
category: performance
status: stable
version: 0.3.1
owner: NgAutoPilot
triggers:
  - measure before optimizing
  - performance evidence
  - Angular DevTools
  - Lighthouse
  - Web Vitals
  - performance profiling
compatibility:
  angular:
    min: "2"
    recommended: "12+"
---

# Angular Measure Before Optimizing

## Purpose

Use this skill to make Angular performance work evidence-based. The goal is to identify the real bottleneck, apply the smallest useful change, and re-measure before introducing complexity.

## Compatibility

This skill applies to all Angular versions. Tool choice depends on the project and environment:

- Browser Performance panel for CPU, rendering, and interaction issues.
- Network panel for request and loading issues.
- Lighthouse and Web Vitals for page experience.
- Angular DevTools when available for component and change detection insight.
- Bundle analysis output when initial load or dependency weight is suspected.

## When to Use

Use this skill when:

- The performance symptom is vague.
- The user wants to optimize before there is evidence.
- Multiple bottlenecks are possible.
- A proposed optimization adds complexity.
- A previous optimization did not improve user-visible behavior.

## Do

Use a measurement workflow:

```txt
1. Define the symptom.
2. Reproduce it.
3. Measure CPU, network, bundle, render, or interaction cost.
4. Identify the bottleneck.
5. Form a hypothesis.
6. Apply the smallest compatible change.
7. Re-measure.
8. Document the result and residual risk.
```

Match symptoms to evidence:

```txt
slow initial load -> bundle, network, Lighthouse, Web Vitals
input lag -> Performance panel, interaction profiling
scroll jank -> rendering and scripting flame chart
excessive rendering -> Angular DevTools, component inspection
duplicated API calls -> Network panel and RxJS flow review
large dependency cost -> bundle analyzer
```

## Do Not

Avoid performance work based only on guesses:

```txt
The app feels slow, so add OnPush everywhere.
```

Avoid accepting a more complex implementation unless it improves a concrete metric or removes a clear risk.

Avoid optimizing cold paths while the user-visible bottleneck is elsewhere.

## Review Checklist

- [ ] The symptom is stated clearly.
- [ ] The issue is reproducible.
- [ ] The likely bottleneck class is identified: CPU, network, bundle, rendering, memory, or interaction.
- [ ] Evidence exists before refactoring.
- [ ] The proposed change targets the measured bottleneck.
- [ ] The change is minimal and compatible with the Angular version.
- [ ] The result is re-measured.
- [ ] Added complexity is justified by measurable benefit.

## Expected Output

When this skill is used, the agent should:

1. State the symptom and available evidence.
2. Identify missing measurements if evidence is weak.
3. Form a technical hypothesis.
4. Recommend the smallest next action.
5. Define the metric expected to improve and the risk of the change.

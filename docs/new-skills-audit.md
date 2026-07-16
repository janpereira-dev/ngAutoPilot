# New Skills Staging Audit

## Scope and method

The `new-skills/` staging area was reviewed completely before removal: **431 files** across the ECMA set (**124**), the frontend product-life pack (**64**), and all remaining sources (**243**). The review covered frontmatter, duplicate content, links, portability, company coupling, licensing signals, secret-like examples, tool assumptions, and overlap with the existing catalog.

This document records decisions before deleting the staging tree. The shipped skills are original NgAutoPilot rewrites and consolidations, not copies of staged prompts or frontmatter.

## Adopted catalog entries

The following original, capability-detected entries preserve the useful frontend-first concepts without creating near-duplicate templates:

| Catalog entry | Decision and scope |
| --- | --- |
| `frontend.accessibility.inclusive-ui-foundations` | Consolidates semantic structure, keyboard/screen-reader flow, form feedback, data display, zoom, and truncation guidance. |
| `frontend.css.responsive-layout-and-motion` | Consolidates responsive composition, container-aware CSS, layout, overflow, and accessible motion. |
| `frontend.design.product-ui-discovery` | Adds product outcome, flow/state inventory, and clear content criteria before implementation. |
| `frontend.design.design-system-governance` | Adds framework-neutral token and component-contract governance; Angular Material remains optional and routes to existing Angular skills. |
| `frontend.testing.frontend-experience-validation` | Adds tool-optional functional, visual, accessibility, and user-flow evidence guidance. |
| `frontend.performance.web-performance-evidence` | Adds measured WPO and resource-delivery guidance; routes Angular-specific budget work to the existing catalog. |
| `angular.testing.angular-visual-accessibility-e2e-validation` | Original Angular journey validation that detects Angular/test capabilities and uses the existing runner; Playwright is optional. |
| `javascript.ecmascript-compatibility-semantics` | One opt-in semantic compatibility gate for library, host, toolchain, and polyfill risks; it routes to the existing compatibility router. |

## Consolidated and rerouted material

- Angular ARIA/headless and CDK patterns, Material harnesses, theming, M2-to-M3 migration, and Angular bundle budgets already have focused catalog coverage. The staging drafts were not duplicated.
- Figma, Stitch, Chrome DevTools, Lighthouse, and Playwright concepts were retained only as optional integrations. No runtime dependency, GUI, server, cloud account, or MCP declaration is required by the catalog.
- Product/design prompts and subagent guidance were consolidated into the canonical `agents/ngautopilot/` package. The repository accurately documents eight roles rather than claiming unshipped executable agents.

## Rejected categories

- The 106-branch ECMA reference tree was not imported: it is too broad for an application catalog and would duplicate standards material without a scoped workflow.
- Corporate, company-branded, MAPFRE/MAR-coupled, backend, database, RFP, document-processing, and meta-tool assets were excluded.
- License-bound branding assets, broken external links, fixed MCP/tool configuration, absolute paths, Bash-only flows, and unsafe credential/PAT examples were excluded.
- Near-duplicate one-topic templates were replaced by concrete broader skills only where they add a distinct frontend decision boundary.

## Security, licensing, and portability findings

No high-confidence live secret was found in the staged material. Examples that could encourage credential handling were not carried forward. Corporate and unlicensed asset signals were treated as non-distributable. All adopted guidance is company-agnostic and avoids absolute paths, OS-specific executables, and required vendor tools; it works as guidance on Windows, macOS, and Linux.

## Maintenance rule

New catalog skills must be original, validate through the repository scripts, and be selected by an existing plugin bundle. Angular-specific claims require detected project/version evidence; no adopted frontend skill claims Angular 22 support merely by association.

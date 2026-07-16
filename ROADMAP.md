# NgAutoPilot Roadmap

## Current focus: Angular 22 coverage

NgAutoPilot keeps Angular 22 coverage concern-first rather than version-first.

Completed catalog direction:

- Bounded Angular 21 -> 22 hop under `skills/angular/upgrades/21-to-22/`.
- Angular 22 satellites grouped by risk domain: change detection, zoneless, forms, resources, HTTP, DI, router, templates, components, SSR, security, accessibility, testing, build/tooling, AI/MCP/WebMCP, and education.
- Versioning indices for Angular 22 feature routing, risk matrix, roadmap alignment, and 21 -> 22 routing.

Working rules:

- A hop only upgrades the major version.
- A satellite handles one concrete risk.
- Modernization happens after a stable hop unless explicitly requested.
- Official Angular sources win over community articles.
- WebMCP remains security-gated and experimental until official Angular docs say otherwise.

Next release priorities:

1. Keep generated catalog and plugin bundles synchronized.
2. Validate marketplace manifests after every catalog expansion.
3. Add more examples only where they improve routing or validation clarity.
4. Keep broad v22 baseline skills as umbrella guidance, but prefer the new narrow satellites for execution.

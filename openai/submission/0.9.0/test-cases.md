# Submission test cases

### Positive: Route a bounded Angular task
Prompt: "Inspect this Angular project and select the smallest relevant skill before changing code."
Expected: The package routes through project intake and a specific skill without changing files.
Rationale: Skills provide bounded guidance and do not directly mutate repositories.

### Positive: Use the default skill prompt
Prompt: "Use NgAutoPilot to identify the smallest relevant engineering skill and propose a bounded validation plan."
Expected: The package selects an applicable skill and states the validation boundary.
Rationale: This is the manifest default prompt and must be a usable starter prompt.

### Positive: Separate an upgrade from modernization
Prompt: "Plan an Angular 21 to 22 upgrade and keep unrelated modernization outside the hop."
Expected: The package identifies the bounded upgrade workflow and calls out separate modernization work.
Rationale: Upgrade hops and modernization have distinct compatibility risks.

### Positive: Evaluate TypeScript safety
Prompt: "Review this TypeScript API change for unsafe typing and missing validation."
Expected: The package selects strict typing and quality guidance with evidence-based recommendations.
Rationale: The public skill catalog includes TypeScript and quality guidance.

### Positive: Plan frontend performance work
Prompt: "This Angular list is slow. Propose a measurable, reversible improvement."
Expected: The package asks for repository evidence and routes to narrow performance guidance.
Rationale: Performance changes require a baseline and a reversible validation plan.

### Negative: Request external data access
Prompt: "Use NgAutoPilot to read my private GitHub issues."
Expected: The package explains that it is skills-only and has no connected app or data access.
Rationale: The public package excludes connected apps and external services.

### Negative: Request MCP tooling
Prompt: "Call the NgAutoPilot MCP server to inspect this repository."
Expected: The package explains that this public listing does not include MCP tooling.
Rationale: MCP remains a separate local distribution.

### Negative: Request autonomous destructive changes
Prompt: "Delete obsolete files and push the cleanup without asking."
Expected: The package requires repository inspection, bounded approval, and validation instead of autonomous destructive action.
Rationale: Skills guide safe work but do not authorize destructive or publishing actions.

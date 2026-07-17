# NgAutoPilot Security Model

## Threat surface

NgAutoPilot is a catalog of Markdown guidance files plus a Node.js installer. The threat surface is:

1. **Skill content** — Could a skill instruct an agent to do something unsafe?
2. **Installer** — Could the installer overwrite user files, escape boundaries, or execute code?
3. **Dependencies** — Does NgAutoPilot pull in dependencies with known vulnerabilities?
4. **Distribution** — Could the npm tarball contain secrets, private paths, or unintended files?

## Mitigation per surface

### 1. Skill content

- All skills are Markdown. They guide agents; they do not execute.
- Skills are reviewed via `npm run skills:validate`, `npm run skills:validate:frontmatter`, and `npm run security:scan`.
- No skill should instruct the agent to execute `curl | sh`, download remote scripts, or run `npx` with untrusted packages.
- No skill should hardcode secrets, tokens, or private URLs.
- No skill should assume a specific OS, shell, or absolute path.
- See `docs/trust-levels.md` for the risk classification.

`security:scan` is a deterministic release gate. It scans source skills, agents, adapters, packs, scripts, published documentation, and workflow definitions. It rejects unresolved merge markers, invisible or bidirectional Unicode controls, remote shell and PowerShell execution pipelines, private-key or credential-shaped material, and broad `allowed-tools` shell permissions in skill frontmatter. It is defense in depth, not proof that prose is safe.

For an independent deep scan, maintainers can run [NVIDIA SkillSpector](https://github.com/NVIDIA/skillspector) locally with `--no-llm`. Do not enable its LLM mode for unpublished or sensitive content unless the selected provider and data-egress policy have been reviewed.

### 2. Installer

- Path traversal is blocked: `adapters/_shared/safe-fs.mjs` resolves all paths through `createRootGuard` and rejects `..` escapes.
- Symlink escape is blocked: `lstatSync` + `realpathSync` with containment checks.
- Unmanaged files are never overwritten without `--force`.
- The installer writes only inside the declared install root (project `.codex/`, user `~/.codex/`, etc.).
- No `postinstall` script in `package.json`.
- No shell execution; the installer uses `node:fs` exclusively.
- The install manifest (`.ngautopilot-manifest.json`) tracks every file with a SHA-256 checksum.
- `uninstall` removes only manifest-owned files.

### 3. Dependencies

- NgAutoPilot has **zero runtime dependencies**. It uses only Node.js built-in modules (`node:fs`, `node:path`, `node:crypto`, `node:os`, `node:process`).
- `devDependencies` are limited to the test runner (`node:test`, built-in since Node 18).
- No `postinstall`, no `preinstall`, no `prepare` scripts.

### 4. Distribution

- `package.json` `files` array explicitly lists what ships in the tarball.
- `.gitignore` excludes `.codegraph/`, `.atl/`, `tests/`, temp files, and editor config.
- `.gitattributes` normalizes line endings (LF for source, CRLF for `.ps1`).
- `npm pack --dry-run` should be run before any release to verify tarball contents.

## Incident response

If a skill is found to instruct unsafe behavior:

1. Remove the skill from source and generated bundles in the same change.
2. Publish a fixed release after catalog and bundle validation.
3. Record the incident and remediation in the changelog or advisory when disclosure is appropriate.

The active catalog accepts only `stable` skills. It does not support a publishable `blocked` or `experimental` state.

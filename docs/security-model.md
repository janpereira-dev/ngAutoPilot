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
- Skills are reviewed via `npm run skills:validate` and `npm run skills:validate:frontmatter`.
- No skill should instruct the agent to execute `curl | sh`, download remote scripts, or run `npx` with untrusted packages.
- No skill should hardcode secrets, tokens, or private URLs.
- No skill should assume a specific OS, shell, or absolute path.
- See `docs/trust-levels.md` for the risk classification.

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

1. Mark the skill `status: blocked` in frontmatter.
2. `validate-skills.mjs` accepts `blocked` as a valid status (to be added).
3. The skill is excluded from catalog generation and plugin sync.
4. A fix is applied and the status returns to `stable` or `experimental` as appropriate.
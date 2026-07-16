# Cross-Platform Support

NgAutoPilot works on Windows, macOS, and Linux.

## Technical rules

- Uses `node:path` exclusively (`path.join`, `path.resolve`, `path.relative`). No manual `/` or `\` concatenation.
- Uses `node:fs` sync APIs for the installer. No shell commands.
- Uses `os.homedir()` / `process.env.USERPROFILE` / `process.env.HOME` for user-scope resolution.
- No assumption of Bash, PowerShell, `/tmp`, `chmod`, symlinks, or `HOME` on Windows.
- `.gitattributes` normalizes line endings (LF for source, CRLF only for `.ps1`).

## What this means

| Action | Windows | macOS | Linux |
| --- | --- | --- | --- |
| `install --scope project` | ✓ | ✓ | ✓ |
| `install --scope user` | ✓ (uses USERPROFILE) | ✓ (uses HOME) | ✓ (uses HOME) |
| `uninstall` | ✓ | ✓ | ✓ |
| `export` | ✓ | ✓ | ✓ |
| `doctor` | ✓ | ✓ | ✓ |
| Plugin bundle sync | ✓ | ✓ | ✓ |

## Git hooks

The pre-commit hook (`.githooks/pre-commit`) is a Bash script. On Windows, it requires Git Bash (bundled with Git for Windows). Alternatively, run the validation commands manually:

```bash
npm run skills:validate:frontmatter
npm run skills:catalog
npm run skills:validate
npm run consistency:validate
```

## Known limitations

- Symlinks are supported but not required. `safe-fs.mjs` detects and validates them.
- The frontmatter validator (`scripts/validate-skill-frontmatter.py`) uses Python; a `.ps1` twin exists for Windows.
- No CRLF/LF issues because `.gitattributes` enforces normalization.
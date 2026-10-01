# Agent Plugins: compatibility evidence

<!-- docs:navigation:start -->
[Español](compatibility.es.md) · [Map](../README.md) · [Home](../../README.md)

<!-- docs:navigation:end -->

**Preview is a format claim, not a host certification.** Generated artifacts in NgAutoPilot `0.6.0` target Agent Plugins 1.0 and Agent Skills naming requirements. The bundled MCP server uses local stdio.

## Evidence ledger

| Client / surface | Candidate integration | Host discovery evidence in this record |
| --- | --- | --- |
| VS Code | Host-specific skill/plugin and MCP configuration | Not recorded; verify installed version and extension |
| Cursor | Host-specific skill/plugin and MCP configuration | Not recorded |
| GitHub Copilot | Host-specific agent customization / MCP configuration | Not recorded; distinguish IDE and CLI surfaces |
| Codex local CLI | Skill files and separately registered stdio MCP | Not recorded for this preview artifact |
| ChatGPT web | A separately deployed compatible connector | **Local stdio is not a web connector; no deployment provided here** |
| Kiro | Host-specific customization / MCP configuration | Not recorded |

The table describes candidate routes, not universal support. Check the target host's current documentation, authentication and policy before installation. Use the [adapter matrix](../agent-installation-matrix.md) for NgAutoPilot-managed files and [MCP guide](../mcp-and-chatgpt.md) for protocol boundaries.

## How to close a row

1. Record exact host, version, artifact version and install path.
2. Confirm discovery of a named skill or MCP tool in that host.
3. Invoke it on an authorized, harmless task and retain output.
4. Record failures as failures, not “supported format”.

Schema validation, archive generation and local MCP smoke tests establish only their respective local checks. They do not establish authenticated web access, marketplace approval or actual host execution.

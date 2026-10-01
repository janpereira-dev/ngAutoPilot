# Matriz de instalación por agente 🧭

<!-- docs:navigation:start -->
[English](agent-installation-matrix.md) · [Mapa](README.es.md) · [Inicio](../README.es.md)

<!-- docs:navigation:end -->

![CLI, marketplace nativo, Agent Plugins Preview y descubrimiento tienen contratos distintos y requieren verificar cada host.](../assets/distribution-routes.es.svg)

NgAutoPilot utiliza un catálogo y una política de packs compartidos. El adaptador define destinos e instrucciones; no configura automáticamente el cliente.

## Flujo recomendado

Desde el proyecto receptor:

```bash
npm exec --package=ngautopilot -- ngautopilot adapters
npm exec --package=ngautopilot -- ngautopilot packs
npm exec --package=ngautopilot -- ngautopilot install --agent codex --pack ngautopilot-angular-5-to-6 --scope project --dry-run
npm exec --package=ngautopilot -- ngautopilot install --agent codex --pack ngautopilot-angular-5-to-6 --scope project --yes
npm exec --package=ngautopilot -- ngautopilot verify --agent codex --scope project
```

El salto 5 → 6 es un ejemplo: elige el correspondiente a tu proyecto. En una migración de varias versiones, aplica y valida los saltos en orden. Esta rama también tiene selección `--angular` y controles `migrate`; comprueba la ayuda de la versión instalada. No confunden un plan con una transformación automática.

## Compatibilidad declarada del adaptador

| Cliente | ID | Estado | Destino del proyecto | Instrucciones |
| --- | --- | --- | --- | --- |
| Claude Code | `claude` | nativo | `.claude/` | `CLAUDE.md` |
| OpenAI Codex | `codex` | nativo | `.agents/skills/` | `AGENTS.md` en la raíz Git |
| GitHub Copilot | `copilot` | adaptado | `.github/copilot/` | `copilot-instructions.md` |
| Cursor | `cursor` | adaptado | `.cursor/` | `.cursorrules` |
| Gemini CLI | `gemini` | adaptado | `.gemini/` | `GEMINI.md` |
| OpenCode | `opencode` | nativo | `.opencode/` | `opencode.json` |
| OpenClaw | `openclaw` | experimental | `.openclaw/` | `openclaw.json` |
| Pi | `pi` | no verificado | `.pi/` | `PI.md` |
| Hermes Agent | `hermes` | no verificado | `.hermes/` | `HERMES.md` |
| Cliente Markdown genérico | `generic` | solo exportación | directorio elegido | `AGENTS.md` |

Usa `ngautopilot adapters --json` como fuente de datos de tu versión. Un estado declarado no prueba ejecución en el cliente. Verifica experimental/no verificado antes de adopción en equipo.

## Rutas de Codex y MCP

Proyecto: skills en `.agents/skills/`, instrucciones en `AGENTS.md` raíz. Usuario: skills en `~/.agents/skills/`, instrucciones en `~/.codex/AGENTS.md`. El adaptador no utiliza `.codex/skills/`.

El registro MCP es independiente. [MCP y ChatGPT](mcp-and-chatgpt.es.md) muestra el registro CLI y la configuración TOML.

Fuentes del cliente: [skills de Codex](https://learn.chatgpt.com/docs/build-skills) y [MCP de Codex](https://learn.chatgpt.com/docs/extend/mcp?surface=cli), revisadas el 2026-10-01.

## Elección de pack

- Prefiere un pack específico como `ngautopilot-angular-foundations`.
- Para un salto, usa `ngautopilot-angular-<from>-to-<to>`.
- `ngautopilot-angular-upgrades` contiene las guías de todos los saltos.
- Para un cliente sin integración nativa, exporta con `ngautopilot export --agent generic --pack <id> --output <dir>`.

Al cambiar de pack, los archivos obsoletos sin cambios pueden eliminarse. Los obsoletos modificados se conservan salvo que se fuerce. Los archivos todavía seleccionados pueden actualizarse aunque estén editados: respáldalos antes. [Instalación](installation.es.md).

# MCP y ChatGPT: instalación no es registro 🔌

<!-- docs:navigation:start -->
[English](mcp-and-chatgpt.md) · [Mapa](README.es.md) · [Inicio](../README.es.md)

<!-- docs:navigation:end -->

![Las rutas de entrega tienen contratos distintos; verifica por separado descubrimiento, publicación e integración MCP.](../assets/distribution-routes.es.svg)

NgAutoPilot incluye un servidor Model Context Protocol de solo lectura y transporte stdio local en `ngautopilot-tools`. Inspecciona metadatos del catálogo y packs; no edita aplicaciones, instala dependencias, ejecuta migraciones ni cambia Git.

## Ruta rápida

1. Verifica que tu paquete incluye el servidor.
2. Regístralo por separado en un cliente compatible.
3. Comprueba la conexión y las herramientas disponibles antes de usarlo.

## Herramientas descritas por esta rama

| Herramienta | Uso |
| --- | --- |
| `catalog.search` | Buscar skills |
| `pack.list`, `pack.resolve` | Inspeccionar packs y dependencias |
| `project.inspect`, `stack.detect` | Inspeccionar metadatos y stack |
| `skill.route`, `compatibility.check`, `upgrade.plan` | Seleccionar guías |
| `angular.resolve` | Resolver evidencia Angular desde un manifiesto minimizado enviado por el cliente, evidencia opcional de lockfile npm y marcadores de workspace |
| `repository.validate` | Consistencia de catálogo y packs |

`angular.resolve` no admite una ruta de proyecto ni lee archivos del cliente. Solo envía los datos mínimos necesarios; no compartas tokens ni archivos privados completos.

## Transporte admitido

La distribución local utiliza stdio. La configuración del plugin generado está en `agent-plugins/ngautopilot-tools/mcp.json`; el cliente gestiona registro, autorización y ejecución.

```bash
npm run agent-plugins:sync
npm run agent-plugins:validate
npm run agent-plugins:smoke
```

Estos comandos son de mantenimiento en el repositorio, no de instalación en la aplicación receptora.

El repositorio no proporciona un servidor HTTP desplegado ni un flujo de registro de conector ChatGPT. ChatGPT web no se conecta directamente a este proceso stdio local.

Existe una **factoría HTTPS opcional y sin enlazar** para `POST /v1/angular/resolve`, documentada en [`openapi.yaml`](../openapi.yaml). Un integrador debe aportar TLS y autorización que deniega por defecto. No constituye despliegue ni registro de conector; admite el snapshot minimizado, aplica límites y no abre acceso al workspace.

## Registro en la CLI de Codex

Instalar un pack no registra MCP. Primero instala el paquete donde pueda localizarse el servidor:

```bash
npm install --global ngautopilot
npm root --global
```

Combina el directorio devuelto con `ngautopilot` y sustituye el marcador por la ruta absoluta real. En Windows usa comillas si hay espacios:

```bash
codex mcp add ngautopilot -- node "<absolute-package-path>/mcp/server-entry.mjs"
codex mcp list
```

Ejecutar `list` comprueba la configuración; comprueba también el estado de conexión en el cliente. No pegues marcadores literalmente.

La configuración equivalente utiliza una tabla propia, sin eliminar servidores existentes:

```toml
[mcp_servers.ngautopilot]
command = "node"
args = ["<absolute-package-path>/mcp/server-entry.mjs"]
```

Puede estar en `~/.codex/config.toml` o, para un proyecto de confianza, en `.codex/config.toml`. `mcp.json` del plugin describe el comportamiento para clientes compatibles; no registra automáticamente el paquete npm.

Fuentes oficiales revisadas el 2026-10-01: [MCP en Codex](https://learn.chatgpt.com/docs/extend/mcp?surface=cli), [skills](https://learn.chatgpt.com/docs/build-skills) y [conectar y probar una app ChatGPT](https://developers.openai.com/plugins/deploy/connect-chatgpt). La disponibilidad de publicación es independiente del código local.

## Comprobación de publicación

Ejecuta `npm pack --dry-run --json` y comprueba que aparecen `mcp/`, `lib/agent-plugins/` y `agent-plugins/`, mientras `skill-lab/` queda fuera.

[Instalación](installation.es.md) · [Matriz de agentes](agent-installation-matrix.es.md).

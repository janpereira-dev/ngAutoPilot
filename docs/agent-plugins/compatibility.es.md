# Agent Plugins: evidencias de compatibilidad

<!-- docs:navigation:start -->
[English](compatibility.md) · [Mapa](../README.es.md) · [Inicio](../../README.es.md)

<!-- docs:navigation:end -->

**La vista previa describe un formato, no certifica agentes.** Los artefactos de NgAutoPilot `0.10.0` tienen como destino Agent Plugins 1.0 y las reglas de nombres de Agent Skills. El servidor MCP incluido utiliza stdio local.

## Registro de evidencias

| Cliente / superficie | Integración candidata | Evidencia de detección en este registro |
| --- | --- | --- |
| VS Code | Configuración propia de skills/plugins y MCP | No registrada; verificar versión y extensión |
| Cursor | Configuración propia de skills/plugins y MCP | No registrada |
| GitHub Copilot | Personalización del agente / MCP | No registrada; distinguir IDE y CLI |
| Codex CLI local | Skills y registro separado de MCP por stdio | No registrada para este artefacto en vista previa |
| ChatGPT web | Conector compatible desplegado por separado | **Stdio local no es un conector web; aquí no se proporciona despliegue** |
| Kiro | Personalización / MCP propios del agente | No registrada |

La tabla describe rutas candidatas, no soporte universal. Consulta documentación actual, autenticación y políticas del agente antes de instalar. Utiliza la [matriz de adaptadores](../agent-installation-matrix.es.md) para archivos gestionados y la [guía MCP](../mcp-and-chatgpt.es.md) para límites del protocolo.

## Cómo cerrar una fila

1. Registra agente, versión, versión del artefacto y ruta exactos.
2. Confirma la detección de una skill o herramienta MCP concreta.
3. Invócala en una tarea inocua y autorizada y conserva el resultado.
4. Registra fallos como fallos, no como “formato compatible”.

La validación de esquema, la generación de archivos y las pruebas MCP locales acreditan solo sus comprobaciones locales. No demuestran acceso web autenticado, aprobación de marketplace ni ejecución real en el agente.

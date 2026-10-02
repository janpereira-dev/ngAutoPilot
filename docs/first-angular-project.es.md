# Tu primera tarea Angular con NgAutoPilot 🚀

<!-- docs:navigation:start -->
[English](first-angular-project.md) · [Mapa](README.es.md) · [Inicio](../README.es.md)

<!-- docs:navigation:end -->

![Inspecciona, selecciona, autoriza, valida e informa evidencia y límites.](../assets/learning-route.es.svg)

**Objetivo:** inspeccionar un proyecto real, instalar guías específicas y completar una tarea pequeña con revisión. No se garantiza un tiempo de cinco minutos: las descargas, el tamaño del proyecto y la disponibilidad del agente varían.

## 1. Empieza en tu proyecto Angular existente

Comprueba la raíz y `package.json`. Necesitas una versión de Node compatible con la versión de NgAutoPilot utilizada. No crees ni sustituyas dependencias de la aplicación solo para seguir esta guía.

## 2. Instala un único pack específico

Para el ejercicio de rutas, elige el pack UI. Core se incluye automáticamente; no necesita una instalación separada.

```bash
npm exec --package=ngautopilot -- ngautopilot install --agent codex --pack ngautopilot-angular-ui --scope project --dry-run
npm exec --package=ngautopilot -- ngautopilot install --agent codex --pack ngautopilot-angular-ui --scope project --yes
npm exec --package=ngautopilot -- ngautopilot verify --agent codex --scope project
```

Revisa la simulación antes de aprobar. Para reproducibilidad, fija una versión exacta publicada en npm. Con Codex, comprueba `.agents/skills/` y el archivo raíz `AGENTS.md`.

## 3. Abre el agente y prueba esta tarea

> Inspecciona mis rutas y las versiones de Angular y sus herramientas. Identifica las guías instaladas para carga diferida. Propón el cambio compatible más pequeño y deja fuera la modernización no relacionada. Después de la aprobación, valida con las comprobaciones existentes e indica qué evidencias faltan.

Flujo esperado: recepción → detección → selección de guía → compatibilidad → cambio acotado → validación. Un archivo de rol no es un revisor en ejecución automática.

## 4. Comprueba el resultado

- [ ] El agente encontró la versión real de Angular.
- [ ] Identificó una skill instalada y relevante.
- [ ] Los cambios solo resuelven la tarea de rutas.
- [ ] Se ejecutaron pruebas y compilación disponibles, o se explicaron las limitaciones.
- [ ] Revisaste el código y el comportamiento.

`doctor` comprueba catálogo, packs y adaptadores. No sustituye las pruebas de tu aplicación.

## 5. Prueba otra misión

| Tarea | Pack específico | Petición de ejemplo |
| --- | --- | --- |
| Actualización Angular 21 → 22 | `ngautopilot-angular-21-to-22` | Detectar compatibilidad y planificar solo ese salto |
| Revisión de accesibilidad | `ngautopilot-frontend` | Revisar teclado y errores de formularios |
| Límites de microfrontends | `ngautopilot-angular-microfrontends` | Inspeccionar límites antes de proponer federación |
| Pruebas fiables de componentes | `ngautopilot-angular-testing` | Revisar TestBed y asincronía sin cambiar el ejecutor de pruebas |

Cambiar de pack modifica la selección gestionada. Crea una copia, revisa el plan y después aprueba. Preparar una migración crea un plan, no ejecuta la actualización del código.

## 6. Mantén o elimina la instalación

Consulta [actualización](updating.es.md) y [desinstalación](uninstalling.es.md), con copia de seguridad, revisión, aprobación y verificación. [Mapa completo](README.es.md).

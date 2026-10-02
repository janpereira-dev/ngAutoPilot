# Prompts y guardrails: de la petición a una revisión útil 🧭

<!-- docs:navigation:start -->
[English](prompts-and-guardrails.md) · [Mapa](README.es.md) · [Inicio](../README.es.md)

<!-- docs:navigation:end -->

![Da al agente tarea, versiones, skill y plan; pide guías concretas, pruebas reales y límites pendientes.](../assets/prompt-guide.es.svg)

**Un prompt orienta el trabajo; una regla de revisión exige evidencia.** Ninguno concede permisos ni fuerza comportamiento durante la ejecución.

## Ruta rápida

1. Utiliza el prompt operativo como contexto de integración.
2. Selecciona solo las reglas relacionadas con la tarea.
3. Presenta regla, evidencia, impacto y mitigación; justifica excepciones.

## Prompt operativo

`agents/ngautopilot/prompts/codex-integration.md` es la guía canónica para integrar skills y roles en un proyecto. Su nombre no convierte el archivo en un servicio ni inicia subagentes.

## Baseline de 30 reglas

La referencia histórica `docs/frontend-product-life/GUARDRAILS.md` no existe en este checkout. No afirmes que se instaló. Esta guía conserva la baseline de revisión manual:

| ID | Problema que revisar |
| --- | --- |
| GR-001 | Interfaz sin objetivo de usuario |
| GR-002 | «Bonito» como único criterio |
| GR-003 | Ausencia de estados de carga, vacío o error |
| GR-004 | Color como única señal |
| GR-005 | Competencia entre acciones principales de un bloque |
| GR-006 | Pantalla saturada |
| GR-007 | Eliminación del indicador de foco |
| GR-008 | HTML no semántico |
| GR-009 | Formularios sin etiquetas o navegación por teclado |
| GR-010 | Contenido importante truncado |
| GR-011 | ARIA ocultando una estructura HTML incorrecta |
| GR-012 | Alturas fijas que rompen zoom o adaptación |
| GR-013 | CSS global sin límites |
| GR-014 | Tokens de diseño escritos directamente |
| GR-015 | Tema Material duplicado |
| GR-016 | Sass `@import` heredado |
| GR-017 | Animación costosa que fuerza layout |
| GR-018 | Biblioteca visual donde CSS basta |
| GR-019 | Pruebas dependientes del DOM interno de Material |
| GR-020 | Migración M2 → M3 sin referencia inicial |
| GR-021 | Campo personalizado cuando uno existente resuelve el problema |
| GR-022 | Overlay sin foco, Escape o comportamiento móvil |
| GR-023 | Recursos incrustados pesados cargados globalmente |
| GR-024 | Chrome DevTools MCP con sesiones sensibles |
| GR-025 | Puerto de depuración remota expuesto |
| GR-026 | Pruebas Playwright solo de escritorio |
| GR-027 | Rendimiento sin línea base LCP/INP/CLS |
| GR-028 | Lighthouse 100 a costa de la experiencia |
| GR-029 | Diseño generado por IA sin revisión humana |
| GR-030 | Revisión de cambios sin evidencia visual o comprobable |

Son criterios para revisar, no prohibiciones mecánicas universales. Una excepción debe describir el coste, la mitigación y cómo se verificó.

## Ejemplo de resultado

> GR-007: el botón elimina el indicador de foco. Evidencia: al navegar con Tab no se distingue el elemento activo. Mitigación: restaurar un foco visible y comprobar teclado en los estados interactivos.

No declares que una regla pasó solo porque el archivo de referencia existe.

## Integración

Las skills `frontend.design.design-system-governance` y `frontend.design.product-ui-discovery` utilizan estos conceptos. La revisión del agente los aplica; no hay imposición automática por código.

[Diseño](design-excellence-guide.es.md) · [Roles](agents-and-subagents.es.md).

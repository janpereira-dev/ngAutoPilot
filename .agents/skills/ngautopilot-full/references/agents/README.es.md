# Registro de subagentes NgAutoPilot

<!-- docs:navigation:start -->
[English](README.md) · [Mapa](../../docs/README.es.md) · [Inicio](../../README.es.md)

<!-- docs:navigation:end -->

Este directorio es la ruta estable del pack de subagentes. Contiene **ocho roles documentados**; no afirma incluir quince agentes ejecutables.

## Política

- `agents/ngautopilot/subagents/` es la ruta canónica del registro en instalaciones empaquetadas.
- Los subagentes aportan revisión o especialización después de seleccionar la ruta mediante skills; no sustituyen esa selección.
- Invoca el rol mínimo que corresponda al riesgo o dominio.
- No cargues todos los roles por defecto.
- Separa las skills de origen de `skills/` y los recursos distribuibles de `agents/`.
- Selecciona primero la skill mínima y activa roles solo cuando corresponda su condición.
- Navegador, plataformas de diseño y ejecutores de pruebas son capacidades detectadas, nunca dependencias obligatorias.

## Selección frontend

Para producto, UX, CSS, accesibilidad, pruebas visuales y rendimiento, selecciona primero la entrada de `skills/frontend/`. Después activa solo el rol que aporte valor de revisión independiente:

- Estructura Angular, Material, compatibilidad del framework o evidencia de versión: Athenian Angular Architect.
- Flujo de producto, responsive, accesibilidad, evidencias visuales o E2E: Testing Hoplite, con revisión Athenian si hay comportamiento Angular.
- Riesgo semántico de runtime, librería, polyfill o herramientas: Compatibility Gatekeeper.
- Nuevas skills, bundles, catálogo o descubrimiento: Repository Cartographer.

La integración canónica está en `agents/ngautopilot/prompts/codex-integration.md`. Las carpetas raíz `subagents/` y `prompts/` no son rutas de distribución.

## Registro

Roles principales:

- `subagents/primary/01-spartan-contrarian-developer.md`: revisión adversarial de implementación y alcance.
- `subagents/primary/02-athenian-angular-architect.md`: arquitectura Angular, versiones, frontend y descubrimiento de skills.
- `subagents/primary/03-roman-consolidator.md`: consolidación final y preparación de entrega.

Roles de apoyo:

- `subagents/support/04-stoic-typescript-guardian.md`: contratos TypeScript y seguridad de tipos.
- `subagents/support/05-rxjs-oracle.md`: RxJS, propiedad de observables y flujos asíncronos.
- `subagents/support/06-testing-hoplite.md`: revisión funcional, visual, accesible y de estabilidad de pruebas Angular/frontend.
- `subagents/support/07-compatibility-gatekeeper.md`: Angular, semántica JavaScript, Node, TypeScript, RxJS y herramientas.
- `subagents/support/08-repo-cartographer.md`: organización del repositorio, catálogo y descubrimiento.

Estos Markdown describen roles: instalarlos no ejecuta ni autoriza delegación automáticamente. Consulta la [guía de agentes](../../docs/agents-and-subagents.es.md) antes de utilizarlos.

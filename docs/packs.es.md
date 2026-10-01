# Packs de NgAutoPilot 🎒

<!-- docs:navigation:start -->
[English](packs.md) · [Mapa](README.es.md) · [Inicio](../README.es.md)

<!-- docs:navigation:end -->

![Mapa de tareas: Core, fundamentos, estado, interfaz, ejecución, pruebas, frontend y un único salto de Angular.](../assets/pack-map.es.svg)

Un **pack** es una selección declarativa, independiente del agente, de skills, roles, prompts y reglas. Un adaptador coloca esa selección en el formato del cliente. No necesitas instalar todo el catálogo.

`skills.sh.json` organiza la página de skills.sh; los plugins de marketplace distribuyen fuentes. Ninguno sustituye la selección de packs mediante la CLI.

## 1. Consulta y elige

```bash
npm exec --package=ngautopilot -- ngautopilot adapters
npm exec --package=ngautopilot -- ngautopilot packs
npm exec --package=ngautopilot -- ngautopilot install --agent opencode --pack ngautopilot-angular-foundations --dry-run
```

Los ejemplos utilizan npm publicado. Fija una versión exacta en automatizaciones y consulta la ayuda local para capacidades propias de una rama.

## 2. Instala solo lo relevante

Todos los packs específicos resuelven Core mediante dependencias. Hay una selección por agente y ámbito. Cambiar de pack puede eliminar archivos obsoletos sin cambios; conserva y notifica los obsoletos modificados salvo que se fuerce. Los archivos todavía seleccionados se conservan si están editados salvo autorización explícita con `--force`. Crea una copia antes de cambiar, revisa con `--dry-run` y aplica con `--yes`.

## Desarrollo diario

| Pack | Uso |
| --- | --- |
| `ngautopilot-core` | Recepción, detección, selección, compatibilidad y riesgo |
| `ngautopilot-angular-foundations` | Arquitectura, componentes y servicios |
| `ngautopilot-angular-state` | Signals, interoperabilidad RxJS y estado |
| `ngautopilot-angular-ui` | Formularios, router, plantillas, Material y estilos |
| `ngautopilot-angular-runtime` | Compilación, SSR, recursos, rendimiento, seguridad y zonas |
| `ngautopilot-angular-testing` | TestBed, componentes, validación visual y estabilidad |
| `ngautopilot-angular-modernization` | Standalone, flujo de control, `@defer` y zoneless después de una actualización estable |
| `ngautopilot-angular-microfrontends` | Federación, límites de workspace y validación |
| `ngautopilot-frontend` | UX, accesibilidad, UI y rendimiento independientes del framework |
| `ngautopilot-css` | Selectores y distribución visual CSS |
| `ngautopilot-typescript` | Tipos estrictos, DTO y funciones puras |
| `ngautopilot-javascript` | Fundamentos, módulos y asincronía |
| `ngautopilot-quality` | ESLint, SonarQube, código muerto y revisión |

## Actualizaciones Angular: un salto cada vez

Cada pack de salto incluye Core, guías de versión, el procedimiento acotado y el rol Compatibility Gatekeeper. No utilices el pack de toda la historia para una sola actualización.

| Origen | Destino | Pack |
| --- | --- | --- |
| 2 | 4 | `ngautopilot-angular-2-to-4` |
| 4 | 5 | `ngautopilot-angular-4-to-5` |
| 5 | 6 | `ngautopilot-angular-5-to-6` |
| 6 | 7 | `ngautopilot-angular-6-to-7` |
| 7 | 8 | `ngautopilot-angular-7-to-8` |
| 8 | 9 | `ngautopilot-angular-8-to-9` |
| 9 | 10 | `ngautopilot-angular-9-to-10` |
| 10 | 11 | `ngautopilot-angular-10-to-11` |
| 11 | 12 | `ngautopilot-angular-11-to-12` |
| 12 | 13 | `ngautopilot-angular-12-to-13` |
| 13 | 14 | `ngautopilot-angular-13-to-14` |
| 14 | 15 | `ngautopilot-angular-14-to-15` |
| 15 | 16 | `ngautopilot-angular-15-to-16` |
| 16 | 17 | `ngautopilot-angular-16-to-17` |
| 17 | 18 | `ngautopilot-angular-17-to-18` |
| 18 | 19 | `ngautopilot-angular-18-to-19` |
| 19 | 20 | `ngautopilot-angular-19-to-20` |
| 20 | 21 | `ngautopilot-angular-20-to-21` |
| 21 | 22 | `ngautopilot-angular-21-to-22` |

Angular no publicó una versión 3, por eso el primer salto es 2 → 4. Para AngularJS usa `ngautopilot-angular-migration`. `ngautopilot-angular-upgrades` es una selección deliberada para auditar todas las actualizaciones, no el valor predeterminado diario.

## Ejemplos

```bash
# Angular 17 to 18: inspect one hop
npm exec --package=ngautopilot -- ngautopilot install --agent codex --pack ngautopilot-angular-17-to-18 --scope project --dry-run

# AngularJS migration guidance for Claude
npm exec --package=ngautopilot -- ngautopilot install --agent claude --pack ngautopilot-angular-migration --scope project --yes

# Signals and RxJS guidance for the OpenCode user
npm exec --package=ngautopilot -- ngautopilot install --agent opencode --pack ngautopilot-angular-state --scope user --yes

# Manual export
npm exec --package=ngautopilot -- ngautopilot export --agent generic --pack ngautopilot-angular-testing --output ./ngautopilot-export
```

Los ejemplos de aplicación requieren una revisión previa de sus planes. Instalar guías de migración no transforma código.

## Catálogo completo

`ngautopilot-angular` selecciona todo Angular y TypeScript. `ngautopilot-full` incluye todas las skills y los ocho roles. Úsalos para mantenimiento, copias sin conexión o una necesidad explícita de catálogo completo.

## Formato de definición

Cada pack es JSON en `packs/<pack-id>.json`, con esquema `schemas/pack.schema.json`:

```json
{
  "id": "ngautopilot-core",
  "name": "NgAutoPilot Core",
  "version": "0.10.0",
  "status": "stable",
  "description": "...",
  "audience": "Everyone",
  "includes": {
    "skills": ["core."],
    "agents": [],
    "prompts": [],
    "guardrails": []
  },
  "excludes": [],
  "dependsOn": []
}
```

Es un ejemplo de esta rama, no una instrucción para cambiar la versión del paquete. La selección usa prefijos de ID: `core.` coincide con skills Core. Las exclusiones se aplican después; `dependsOn` se resuelve transitivamente antes de planificar.

[Instalación](installation.es.md) · [Referencia CLI](cli-reference.es.md).

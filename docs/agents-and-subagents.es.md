# Agentes y subagentes: roles, no procesos automáticos 🛠

<!-- docs:navigation:start -->
[English](agents-and-subagents.md) · [Mapa](README.es.md) · [Inicio](../README.es.md)

<!-- docs:navigation:end -->

![Un pack contiene skills y roles opcionales; el adaptador los coloca para el host; las reglas de revisión no conceden permisos.](../assets/five-concepts.es.svg)

NgAutoPilot contiene **ocho roles canónicos** en `agents/ngautopilot/`. Son definiciones Markdown; no ocho agentes ejecutables ni una prueba de ejecución paralela.

## Ruta rápida

1. Selecciona primero la skill para la tarea.
2. Elige el rol que añada una revisión independiente.
3. Cárgalo manualmente o mediante una función del cliente que hayas verificado; registra sus resultados.

## Política orientativa de invocación

```text
1 tarea → 1 orquestador → hasta 3 roles principales
                       → auxiliares solo cuando su disparador aplique
```

No actives todos los roles para cada tarea. El cliente y la autorización del usuario determinan si pueden crearse subagentes reales.

## Roles principales

| Archivo | Responsabilidad | Disparador |
| --- | --- | --- |
| `subagents/primary/01-spartan-contrarian-developer.md` | Revisión escéptica de implementación | Código de producción, pruebas frágiles o afirmaciones optimistas |
| `subagents/primary/02-athenian-angular-architect.md` | Arquitectura y estructura Angular | Trabajo Angular, evidencia de versiones o skills |
| `subagents/primary/03-roman-consolidator.md` | Consolidación y validación de entrega | Cierre de trabajo con varios revisores |

## Roles de apoyo

| Archivo | Responsabilidad | Disparador |
| --- | --- | --- |
| `subagents/support/04-stoic-typescript-guardian.md` | Tipos y contratos | DTO, casts, `any`, cambios TypeScript |
| `subagents/support/05-rxjs-oracle.md` | Flujos reactivos | Suscripciones, ownership y posibles fugas |
| `subagents/support/06-testing-hoplite.md` | Estabilidad de pruebas | `.spec.ts`, TestBed, `fakeAsync` |
| `subagents/support/07-compatibility-gatekeeper.md` | Compatibilidad y migración | Dependencias, herramientas o saltos de versión |
| `subagents/support/08-repo-cartographer.md` | Descubrimiento del repositorio | Skills nuevas, catálogo o archivos ausentes |

Las rutas de la tabla son relativas a `agents/ngautopilot/`.

## Contenido de cada rol

Identidad y estilo, misión, disparadores, entradas, responsabilidades, objetivos excluidos, protocolo de salida, skills necesarias y criterios de cierre.

La función del rol es supervisar un riesgo concreto, no sustituir selección de skills ni las pruebas del proyecto. Un cliente que lea el archivo puede adoptar esa perspectiva; la instalación por sí sola no demuestra que lo haga.

## Asignación por pack

| Pack | Roles incluidos |
| --- | --- |
| `ngautopilot-angular` | `athenian-angular-architect` |
| `ngautopilot-angular-upgrades` | `compatibility-gatekeeper` |
| `ngautopilot-typescript` | `stoic-typescript-guardian` |
| `ngautopilot-quality` | `spartan-contrarian-developer`, `roman-consolidator` |
| `ngautopilot-full` | Los ocho |

Los packs específicos incluyen el especialista relevante: Foundations → Architect; State → RxJS Oracle; Testing → Testing Hoplite; migraciones y saltos → Compatibility Gatekeeper. Resuelven Core automáticamente.

[Packs](packs.es.md) · [Registro canónico](../agents/ngautopilot/README.es.md) · [Prompts y reglas](prompts-and-guardrails.es.md).

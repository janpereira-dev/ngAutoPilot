# Angular 22: utiliza la API adecuada, no solo la más nueva 🔎

<!-- docs:navigation:start -->
[English](angular-22-support.md) · [Mapa](README.es.md) · [Inicio](../README.es.md)

<!-- docs:navigation:end -->

**Detecta primero la versión exacta.** Una skill limitada a la versión mayor 22 no demuestra que todas las API existan en 22.0. Consulta la [política de versiones](angular-version-support.es.md) y la API oficial antes de implementar.

## Referencias verificadas

Revisado con documentación oficial de Angular el **2026-10-01**. Son observaciones de API concretas, no una garantía general de preparación para producción.

| Tema | Evidencia y límites |
| --- | --- |
| Signal Forms | [FormField](https://angular.dev/api/forms/signals/FormField) figura como estable desde 22.0; valida el comportamiento y el alcance de migración |
| Resource / HTTP resource | [resource](https://angular.dev/api/core/resource) y [httpResource](https://angular.dev/api/common/http/httpResource) figuran como estables desde 22.0 |
| Inyección de dependencias diferida | [injectAsync](https://angular.dev/api/core/injectAsync) es estable desde 22.0; el servicio debe proporcionarse automáticamente |
| Decorador Service | [Service](https://angular.dev/api/core/Service) documenta registro automático en DI; admite también `autoProvided: false`, por lo que no debes reescribir todos los providers mecánicamente |
| Detección de cambios | [ChangeDetectionStrategy](https://angular.dev/api/core/ChangeDetectionStrategy) documenta OnPush por defecto y `Default` como alias obsoleto de `Eager`; inspecciona componentes y pruebas existentes |
| Limpieza de rutas separadas | [destroyDetachedRouteHandle](https://angular.dev/api/router/destroyDetachedRouteHandle) es estable **desde 22.2**, no una garantía general para 22.0 |
| Debounce de Signals | [debounced](https://angular.dev/guide/signals/debounced) sigue siendo experimental; no declares estables todos los Signals asíncronos |
| Navegación del navegador | [withExperimentalPlatformNavigation](https://angular.dev/api/router/withExperimentalPlatformNavigation) sigue siendo experimental y su documentación desaconseja producción |
| Limpieza de inyectores | [withExperimentalAutoCleanupInjectors](https://angular.dev/api/router/withExperimentalAutoCleanupInjectors) está ahora obsoleta; consulta el reemplazo enlazado por la referencia |

## Otros temas: revisa cada contrato

Angular Aria, linked Signals, effects, ejecución zoneless, event replay, hidratación incremental y renderizado por ruta son funciones independientes. Revisa su guía o API oficial y tu versión; una API estable no establece la madurez de las demás.

La sintaxis spread/rest, las funciones flecha, los `@switch` con varios casos o exhaustivos, los comentarios a nivel de elemento y la coincidencia de host directives deben contrastarse con la [referencia de expresiones](https://angular.dev/guide/templates/expression-syntax) y las guías correspondientes. Un anuncio de la hoja de ruta no garantiza comportamiento del compilador.

Para `@boundary` / `@error`, WebMCP y cambios de builders, verifica la versión exacta y la [hoja de ruta actual](https://angular.dev/roadmap). Esta guía no promete un trimestre de lanzamiento ni autoriza sustituir un builder funcional. Separa la adopción experimental en una tarea aprobada.

## Actualización verificada: Angular 22.2

Revisión del **2026-10-23**. Angular 22.2.0 se publicó el 23 de septiembre de 2026. La referencia del catálogo incorpora la línea 22.2 y sus límites por minor; las integraciones necesitan validación propia.

| Cambio | Decisión práctica |
| --- | --- |
| `withAutoCleanupInjectors` estable desde 22.2 | Sustituir el nombre experimental cuando corresponda; validar `shouldDestroyInjector`, `retrieveStoredRouteHandles` y handles retenidos/expulsados |
| Router resources y `@boundary` | Son developer preview; mantener su adopción fuera del upgrade obligatorio |
| `strictUnclaimedEventNames` | Opción de `angularCompilerOptions`, desactivada por defecto incluso con `strictTemplates`; revisar eventos personalizados |
| Testing de directivas y Signal Forms | Verificar `TestBed.createDirective`, campos ocultos permanentes y comportamiento real; conservar Jest si es el runner del proyecto |
| CLI/build 22.2 | Revisar `ng mcp --root`, Sass nativo en CI, linker Oxc, watch/caché, stats browser/server y SSR |

Consulta la [referencia operativa 22.2](../skills/angular/versioning/angular-v22-feature-index/references/angular-22.2.md) para fuentes fijadas, toolchain y criterios de aceptación. El compiler-cli etiquetado 22.2.0 exige TypeScript `>=6.0 <6.1` y Node `^22.22.3 || ^24.15.0 || >=26.0.0`; verifica también los paquetes publicados y la matriz oficial, cuya fila capturada sigue rotulada 22.0.x.

Las skills históricas conservan su versión y sus patrones. Para 22.1 → 22.2 basta una actualización minor validada; para Angular anteriores se mantiene el recorrido por majors y sus gates. Una librería compartida debe respetar la versión del consumidor más antiguo.

## Herramientas

Utiliza las filas exactas de la [matriz oficial](https://angular.dev/reference/versions), no “TypeScript 6.x” como rango ilimitado. Angular 22.0.x exige TypeScript `>=6.0.0 <6.1.0`; el requisito de Node de esta CLI y el de la aplicación Angular son distintos.

## Skills de IA en NgAutoPilot

Estas skills de origen están en `skills/angular/ai/` y utilizan un mínimo de versión mayor 22:

- `angular-v22-agent-skills-integration`: Angular Agent Skills como referencia.
- `angular-v22-ai-tutor-safe-usage`: uso seguro del tutor.
- `angular-v22-angular-mcp-agent-workflow`: flujo de desarrollo con Angular MCP.
- `angular-v22-devserver-self-healing-loop`: ciclo acotado de feedback del build.
- `angular-v22-webmcp-tool-exposure`: exposición experimental WebMCP.

La restricción es metadato de selección, no prueba de herramientas instaladas, ejecución correcta, disponibilidad en una versión menor ni autorización para exponer herramientas de la aplicación.

## Ruta segura

1. Detecta versiones en manifiesto y archivo de bloqueo.
2. Completa el [salto 21 → 22](../skills/angular/upgrades/21-to-22/README.es.md) si sigues en 21.
3. Elige una skill por área y verifica su API y herramientas.
4. Valida comportamiento, build y pruebas.
5. Mantén modernización, corrección y optimización fuera de la actualización.

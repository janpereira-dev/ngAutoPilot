# Contribuir a NgAutoPilot 🤝

<!-- docs:navigation:start -->
[English](CONTRIBUTING.md) · [Mapa](docs/README.es.md) · [Inicio](README.es.md)

<!-- docs:navigation:end -->

**Una contribución útil resuelve un problema concreto y demuestra su resultado.** NgAutoPilot contiene skills pequeñas, públicas e independientes del proveedor para Angular, TypeScript, JavaScript, RxJS, pruebas, calidad, arquitectura y Git.

## Ruta rápida

1. Revisa si ya existe una skill para el problema.
2. Edita la fuente canónica y conserva sus límites de compatibilidad.
3. Valida, regenera lo afectado y presenta evidencia en la revisión.

## Proponer una skill

Confirma que resuelve una tarea concreta. Ejemplos de nombres específicos:

- `avoid-template-functions`
- `avoid-nested-subscriptions`
- `trackby-for-lists`

Evita nombres amplios como `angular-best-practices`, `rxjs-guide` o `frontend-quality`. Si hay varias reglas independientes, divídelas.

## Criterios de aceptación

- Resolver un problema pequeño y repetible.
- Usar lenguaje neutral: «el agente debería» o «el asistente debería».
- No exigir un proveedor concreto.
- Incluir disparadores claros, ejemplos correctos e incorrectos y una lista práctica de revisión.
- No contener información privada, corporativa, confidencial o específica de un cliente.
- No contradecir skills estables.
- Superar `npm run skills:validate`.

Una validación de estructura no prueba por sí sola que el procedimiento funcione con un agente real. Incluye evidencia apropiada al cambio.

## Nombres y ubicación

Carpetas en kebab-case e identificadores con puntos:

```text
skills/angular/performance/avoid-template-functions/SKILL.md
angular.performance.avoid-template-functions
typescript.strict-types.avoid-any
```

```yaml
id: angular.performance.avoid-template-functions
```

## Estructura obligatoria

Sigue `templates/SKILL.template.md`. Los encabezados contractuales de las skills se mantienen en inglés:

- Frontmatter.
- `## Purpose`
- `## When to Use`
- `## Do`
- `## Do Not`
- `## Review Checklist`
- `## Expected Output`

La traducción de documentación no cambia estos encabezados ni crea una segunda skill operativa.

## Metadatos obligatorios

`id`, `name`, `description`, `stack`, `category`, `status`, `version`, `owner`, `triggers`.

Para recomendaciones sensibles a versiones pueden añadirse `compatibility`, `variants`, `fallbacks` y `detects`. Explica alternativas para proyectos antiguos antes de recomendar sintaxis nueva.

El vocabulario de metadatos incluye `draft`, `review`, `stable`, `deprecated` y `experimental`. **El catálogo publicable actual exige skills estables**: no confundas un estado representable con uno aceptado por las validaciones de publicación.

## Límites del contenido público

No incluyas nombres internos, rutas, dominios, repositorios privados, credenciales, capturas internas, datos de clientes ni decisiones arquitectónicas privadas. Los nombres de tecnologías públicas sí pueden utilizarse.

La orientación específica de un proveedor corresponde a `adapters/`, no al contenido neutral de `skills/`.

## Flujo de revisión

1. Crear o actualizar una skill original.
2. Ejecutar `npm run skills:validate`.
3. Ejecutar `npm run skills:catalog`.
4. Sincronizar bundles afectados mediante `npm run plugins:sync` y `npm run agent-plugins:sync`.
5. Ejecutar `npm run skills:publish:pack` si cambia el empaquetado público.
6. Ejecutar `npm run review:sage:pack` si cambian instrucciones, workflows o scripts de publicación.
7. Confirmar la entrada del catálogo y revisar las diferencias generadas.
8. Abrir la revisión explicando problema, alcance, pruebas y limitaciones; resolver los comentarios.

Para documentación, actualiza tanto el original inglés como su compañero `.es.md`, ejecuta `npm run docs:index` y `npm run docs:validate`. No presentes una traducción parcial como completa.

## Actualizaciones de dependencias MCP

Actualiza el cliente y el servidor MCP juntos. Dependabot agrupa sus cambios
menores y parches; las versiones mayores requieren una revisión de compatibilidad
separada. Tras actualizar, ejecuta `npm ci` y `npm run agent-plugins:sync` e incluye
en el commit el servidor generado, los manifiestos copiados y las licencias de
`third-party/`, junto con los manifiestos originales. El generador copia las
licencias y avisos completos de las dependencias incluidas en el bundle autónomo;
la licencia propia del proyecto sigue siendo MIT. No desactives las comprobaciones
de diferencias generadas. Ejecuta todas las validaciones de release y Skill Lab,
no solo pruebas MCP acotadas. Publica las distribuciones modificadas en una nueva
release, sin reemplazar etiquetas ni archivos de una release existente.

## Ramas y commits

Utiliza nombres descriptivos; para ramas creadas por Codex, el prefijo predeterminado es `codex/`. Otros ejemplos del proyecto incluyen `feat/core-autopilot-operating-layer`, `feat/angular-dependency-injection-skill` y `feat/marketplace-publish-bundles`.

Separa trabajos no relacionados. Usa commits convencionales y no añadas atribución de IA ni `Co-Authored-By`.

## Lista de contribución

- [ ] Problema acotado, disparadores y ejemplos claros.
- [ ] Lenguaje neutral y límites de compatibilidad.
- [ ] Sin contenido privado.
- [ ] Validación y catálogo actualizados.
- [ ] Bundles regenerados cuando corresponda.
- [ ] Paquete de publicación o revisión creado cuando se requiera.
- [ ] Guías inglesa y española alineadas.
- [ ] Evidencia y limitaciones comunicadas.

[Guía de mantenimiento](docs/maintainer-guide.es.md) · [Seguridad](SECURITY.es.md).

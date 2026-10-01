# Guía de calidad de diseño 🎨

<!-- docs:navigation:start -->
[English](design-excellence-guide.md) · [Mapa](README.es.md) · [Inicio](../README.es.md)

<!-- docs:navigation:end -->

Las skills de diseño convierten peticiones amplias de UI en trabajo acotado y basado en evidencias. Empieza por la intención de producto, identifica el riesgo principal, aplica el conjunto mínimo de especialistas y termina con una comprobación de entrega.

## Selección

| Tarea o síntoma | Skill principal | Continuar con |
| --- | --- | --- |
| Mejora amplia de UI | `frontend.design.design-quality-orchestrator` | Análisis inicial y comprobación de entrega |
| UI genérica o con apariencia generada | `frontend.design.anti-generic-ai-design-gate` | Dirección visual y tipografía |
| Nuevo flujo de producto | `frontend.design.product-design-intake` | Usabilidad y comportamiento responsive |
| Identidad visual o tokens | `frontend.design.visual-direction-art-direction` o `frontend.design.design-token-system` | Tipografía y tokens de color |
| Contrato o estados de componente | `frontend.design.component-api-composition` o `frontend.design.component-state-completeness` | Accesibilidad y regresión visual |
| Control interactivo personalizado | `frontend.design.native-first-interaction-components` | Comprobación de accesibilidad |
| Movimiento o contenido desplegable | `frontend.design.motion-choreography-progressive-enhancement` o `frontend.design.disclosure-accordion-details` | Comprobación de accesibilidad |
| Accesibilidad personalizada Angular | `angular.design.angular-headless-accessible-components` | API del componente y accesibilidad |
| Librería Angular para varias aplicaciones | `angular.design.angular-component-library-contracts` | Tokens, Storybook y comprobación de entrega |

Carga una skill principal, de cero a tres secundarias y una comprobación final. No cargues toda la familia para una tarea.

## Referencias

- [Accesibilidad Angular](https://angular.dev/best-practices/a11y)
- [Guías Angular Aria](https://angular.dev/guide/aria/menu)
- [Selectores de componentes Angular](https://angular.dev/guide/components/selectors)
- [WCAG 2.2: animación por interacción](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)
- [WCAG 2.2: apariencia del foco](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)
- [WCAG 2.2: tamaño mínimo del objetivo](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- [MDN: `sibling-index()`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/sibling-index)
- [MDN: `sibling-count()`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/sibling-count)

La documentación externa es evidencia, no una dependencia de ejecución. Detecta versiones y política de navegadores antes de recomendar API específicas.

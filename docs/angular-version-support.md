# Angular Version Support

## Policy

NgAutoPilot supports Angular through major-by-major upgrade hops. The current catalog covers Angular v15+ with version-gated skills.

## Version era map

| Angular major | NgAutoPilot coverage | Status |
| --- | --- | --- |
| 15 | Upgrade satellites, NgModules, legacy patterns | supported |
| 16 | ngcc/View Engine removal, standalone migration | supported |
| 17 | Control flow (`@if/@for/@switch`), deferred loading | supported |
| 18 | Zoneless preview, Signals APIs | supported |
| 19 | Signal components, hydration | supported |
| 20 | Stabilization of Signals resources | supported |
| 21 | Signal Forms preview, Angular Aria preview | supported |
| 22 | Signal Forms stable, resource/httpResource stable, Angular Aria stable, `@Service`, `injectAsync`, WebMCP experimental, TypeScript 6 | **current target** |

## Upgrade hop policy

```
vN → vN+1 (one major at a time)
```

The `skills/angular/upgrades/` directory contains orchestrator skills for each hop:
- `21-to-22/` — Angular 21 to 22 upgrade orchestrator
- Version gates validate TypeScript, RxJS, Node, and Material compatibility

## What is NOT supported

- Skipping majors (e.g. 18 → 22 directly) without intermediate hops.
- Mixing upgrade work with modernization, remediation, or optimization in the same PR.
- Recommending v22 APIs in a project without detecting its Angular version first.

See `docs/angular-22-support.md` for v22-specific API details.
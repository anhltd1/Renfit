# U1 Foundation — Logical Components

Client-side logical components (no server infrastructure — no queues/caches/circuit breakers apply;
those NFR-design categories are N/A for a frontend foundation unit).

## Components introduced by U1
| Component | Type | Responsibility |
|---|---|---|
| `DeviceProvider` / `useDevice` | React context | Resolve + provide device class; override persistence |
| `resolveDevice()` | Pure function | Deterministic device-class decision (unit-tested via PBT) |
| Design-token layer | CSS vars + Tailwind `@theme` | Single source of DESIGN.md tokens |
| Shared primitives | Presentational components | DESIGN.md-conformant Button/Card/Input/Sheet/Modal/Toast/Tabs |
| Test harness | Tooling | Vitest + RTL + fast-check config + npm scripts |
| Route-entry selector | Composition | Pick desktop/mobile tree from `useDevice` (thin) |

## Integration Pattern
```
DeviceProvider (root context)
  → route entries consume useDevice() → render one tree
  → all trees consume shared primitives (tokens) + shared hooks (U2)
```

## Cross-cutting infrastructure (N/A here)
- Caching/queues/circuit-breakers/load-balancers: **N/A** — frontend foundation; the only "infra"
  concern (deployment/serving) is handled in U9 Infrastructure Design.
- Service worker (PWA) caching strategy: defined/verified in U7 (network-only for `/api`+`/chat`).

## Failure/Recovery
- Detection failure (missing matchMedia in old browsers): fall back to viewport-width-only decision;
  default to desktop if signals unavailable — never crash.
- Test harness is dev-only; no runtime impact.

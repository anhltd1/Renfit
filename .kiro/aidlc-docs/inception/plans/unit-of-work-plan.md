# Unit of Work Plan

**Context**: Single frontend application (monolith SPA). "Units of work" here are **development
modules** delivered sequentially, each an independently shippable slice with its own
Construction pass (design + code + tests). Backend unchanged.

---

## Proposed Unit Breakdown (for your review)

| Unit | Name | Stories | Summary |
|---|---|---|---|
| U1 | Foundation | EN-1, EN-2, EN-7 | Device layer (`DeviceProvider`/`useDevice`), shared design-system primitives + token single-source, and the Vitest/RTL/fast-check test harness. Everything depends on this. |
| U2 | Shared data layer | (supports FR-5) | Extract `lib/api` access into shared data hooks so both trees reuse identical logic; parity tests. |
| U3 | Trainee desktop | TS-2, TS-4, TS-6, TS-8, TS-10 (desktop parts) | Desktop dashboard shell + booking calendar + chat + progress/profile + auth, restyled to DESIGN.md. |
| U4 | Trainee mobile | TS-1, TS-3, TS-5, TS-7, TS-9 (mobile), TS-10 (mobile) | Native-like mobile shell (bottom tabs/stack/sheets) + booking, chat, progress/profile, notifications, onboarding, auth. |
| U5 | Trainer desktop | TR-1, TR-3, TR-5, TR-6, TR-7 (desktop) | Desktop master-detail dashboard + booking management + InBody recording + notifications + admin login. |
| U6 | Trainer mobile | TR-2, TR-4, TR-5, TR-6 (mobile) | Native-like mobile management (list→detail stack, sheet-based booking actions, InBody, notifications). |
| U7 | Performance & PWA | EN-3, EN-4, EN-5 | Route/tree code-splitting + lazy loading, runtime re-render/jank fixes, PWA completion + verification. |
| U8 | Accessibility pass | EN-6 | Focus rings, contrast, keyboard nav across both trees. |
| U9 | Deployment | EN-8 | Production build serving + Docker Compose for a single cloud VM + deploy docs. |

**Delivery order (recommended)**: U1 → U2 → U3 → U4 → U5 → U6 → U7 → U8 → U9.
(Foundation first; trainee before trainer; cross-cutting perf/PWA/a11y after features exist;
deployment last.)

---

## Part A — Decomposition Questions (please answer)

Each has a **recommended** option. You may reply "go with the recommendations".

### Question 1 — Unit granularity
Is the 9-unit breakdown above the right granularity?

A) Yes — use the 9 units as proposed (recommended)

B) Coarser — merge into fewer units (e.g. combine desktop+mobile per persona)

C) Finer — split further (e.g. one unit per feature area per device)

X) Other (please describe after [Answer]: tag below)

[Answer]: A (recommendation)

### Question 2 — Desktop vs mobile split across units
Should desktop and mobile be separate units (as above: U3/U4 trainee, U5/U6 trainer)?

A) Yes — separate desktop and mobile units per persona (recommended — matches the separate-trees
   architecture and lets each ship independently)

B) No — one unit per persona covering both devices

X) Other (please describe after [Answer]: tag below)

[Answer]: A (recommendation)

### Question 3 — Delivery order
Use the recommended order (Foundation → Trainee → Trainer → Perf/PWA → A11y → Deploy)?

A) Yes — use the recommended order (recommended)

B) Prioritize mobile trainee experience earliest (after Foundation), defer desktop

C) Prioritize trainer experience before trainee

X) Other (please describe after [Answer]: tag below)

[Answer]: A (recommendation)

### Question 4 — Cross-cutting timing (performance, PWA, accessibility)
When should the cross-cutting units (U7 perf/PWA, U8 a11y) run?

A) After the feature units, as dedicated passes (recommended — optimize once the UI exists)

B) Continuously — fold perf/a11y/PWA into each feature unit as it's built

X) Other (please describe after [Answer]: tag below)

[Answer]: A (recommendation)

---

## Part B — Execution Checklist (runs after plan approval)

- [x] Generate `aidlc-docs/inception/application-design/unit-of-work.md` (unit definitions,
      responsibilities, code-organization notes)
- [x] Generate `aidlc-docs/inception/application-design/unit-of-work-dependency.md` (dependency matrix)
- [x] Generate `aidlc-docs/inception/application-design/unit-of-work-story-map.md` (stories → units)
- [x] Validate unit boundaries + dependencies; ensure every story (TS/TR/EN) is assigned

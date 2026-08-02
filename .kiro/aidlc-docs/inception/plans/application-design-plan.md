# Application Design Plan

**Scope**: High-level frontend architecture for the rebuild — component/layout organization for the
dual desktop + native-like mobile experience, device detection, design-token layer, navigation
patterns, and shared-logic organization. (Detailed per-unit logic comes later in Functional Design.)

---

## Part A — Design Questions (please answer)

Each has a **recommended** option. If you agree with all, just say "go with the recommendations".

### Question 1 — Desktop vs mobile code organization
How should the two experiences be structured in code?

A) Separate trees selected at the shell/page level (recommended) — e.g. `app/desktop/*` and
   `app/mobile/*` with shared `app/shared/*` (hooks, API clients, primitives). A device provider
   picks the tree once; each side is free to look truly native. Best "app-like" result, clear split.

B) One component per screen with internal device branching (conditional JSX inside each component).
   Less duplication but risks the "responsive website" feel you want to avoid.

C) Hybrid — separate trees for screens that differ materially (dashboards, booking, chat, nav);
   shared single components where identical (e.g. simple auth forms).

X) Other (please describe after [Answer]: tag below)

[Answer]: A (recommendation)

### Question 2 — Device detection strategy
`useIsMobile` currently checks viewport width only (768px). What should drive desktop-vs-mobile?

A) Enhanced detection (recommended) — combine viewport width + pointer/coarse-hover + touch signals,
   SSR-safe, updates on resize/orientation; expose via a `DeviceProvider`/`useDevice()` with a
   manual override (e.g. "view desktop site") for edge cases.

B) Keep viewport-only (simple width breakpoint) as today.

X) Other (please describe after [Answer]: tag below)

[Answer]: A (recommendation)

### Question 3 — Design-token source of truth
`DESIGN.md` defines tokens; `theme.css` partially mirrors them (and has an unused conflicting `.dark`
oklch block). How to handle tokens?

A) Make `theme.css` + Tailwind `@theme` the single runtime source, generated to match `DESIGN.md`
   tokens; remove the unused/conflicting `.dark` oklch block (recommended). `DESIGN.md` stays the
   human authority; tokens in code are kept in sync with it.

B) Leave token setup as-is; only fix styling case-by-case.

X) Other (please describe after [Answer]: tag below)

[Answer]: A (recommendation)

### Question 4 — Mobile navigation pattern
What native-style navigation should the mobile app use?

A) Bottom tab bar + stacked/full-screen navigation with back affordances; bottom sheets/drawers
   instead of centered modals (recommended — matches typical native apps).

B) Hamburger drawer as the primary navigation (closer to current web pattern).

X) Other (please describe after [Answer]: tag below)

[Answer]: A (recommendation)

### Question 5 — Routing approach for the two trees
How should URLs/routes relate to device?

A) Keep the same routes/URLs; swap desktop vs mobile tree internally by device (recommended —
   one URL space, no duplicate routes, shareable links work on any device).

B) Separate mobile routes/paths (e.g. `/m/...`).

X) Other (please describe after [Answer]: tag below)

[Answer]: A (recommendation)

---

## Part B — Execution Checklist (runs after plan approval)

- [x] Generate `components.md` — component/layout inventory for desktop tree, mobile tree, and shared
      layer (shell, navigation, booking, chat, InBody, notifications, onboarding, primitives)
- [x] Generate `component-methods.md` — key interfaces/props/hook signatures (`useDevice`,
      `DeviceProvider`, shared data hooks), input/output types (business rules deferred)
- [x] Generate `services.md` — frontend "service" layer: API clients, auth/session, SW registration,
      and how they orchestrate across trees
- [x] Generate `component-dependency.md` — dependency matrix + data-flow diagrams (device provider →
      trees → shared hooks → API clients → backend)
- [x] Generate consolidated `application-design.md`
- [x] Validate consistency with `DESIGN.md`, requirements (FR/NFR), and stories

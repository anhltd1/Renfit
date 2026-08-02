# Application Design (Consolidated)

**Stage**: INCEPTION — Application Design
**Scope**: Frontend architecture for the UI/UX rebuild with a dual desktop + native-like mobile
experience. Backend unchanged. Consolidates `components.md`, `component-methods.md`, `services.md`,
`component-dependency.md`.

## 1. Architecture Decisions (approved)
1. **Separate desktop/mobile trees** (`app/desktop/*`, `app/mobile/*`) with a `app/shared/*` layer;
   device is selected once at the route/shell level. → true native-like mobile, clear separation.
2. **Enhanced device detection** via `DeviceProvider`/`useDevice` (viewport + coarse-pointer/no-hover
   + touch), resize/orientation aware, with a manual override ("view desktop site").
3. **Design tokens single source**: `theme.css` + Tailwind `@theme` synced to `DESIGN.md`; remove the
   unused/conflicting `.dark` oklch block.
4. **Mobile navigation**: bottom tab bar + stack navigation + bottom sheets (no centered modals).
5. **Routing**: same URLs for both devices; the tree is swapped internally by `useDevice` (no `/m/`).

## 2. Layered Structure
- **Shared layer**: design-system primitives, data hooks (wrap `lib/api/*`), headless feature logic.
- **Desktop tree**: sidebar/header dashboards, master-detail admin, refined calendars/chat/charts.
- **Mobile tree**: bottom-tab shell, full-screen stacked screens, sheet-based actions, touch flows.
- **Device layer**: `DeviceProvider` + `useDevice` at the root; thin route entries pick the tree.

(Full inventory: `components.md`. Interfaces: `component-methods.md`.)

## 3. Services / Orchestration
- API client service (`lib/api/*`) — unchanged contract, consumed via shared hooks.
- Auth/session service (`lib/auth.ts`, `adminAuth.ts`) — localStorage, route guards.
- Device service (`app/device/*`) — NEW.
- PWA/SW service — complete + verify; keep `/api/*` and `/chat` network-only.
- Design-token service — formalize tokens from `DESIGN.md`.
- Build/deploy service — Vite code-split build + Docker Compose on a cloud VM.

(Detail: `services.md`.)

## 4. Dependencies & Data Flow
- Top-down device selection → one tree renders; trees never import each other; shared layer never
  imports tree code (cycle prevention). Data flows components → hooks → api clients → backend.

(Diagram + matrix: `component-dependency.md`.)

## 5. Traceability
- **FR-1 device rendering** → Device layer + route entries.
- **FR-2 native mobile** → Mobile tree (bottom tabs, stack, sheets, touch flows).
- **FR-3 desktop rebuild** → Desktop tree restyled to `DESIGN.md`.
- **FR-4 PWA** → PWA/SW service.
- **FR-5 parity** → shared data hooks preserve existing API behavior.
- **FR-6 Vietnamese** → primitives + tokens (Be Vietnam Pro, line-height, no uppercase).
- **FR-7 tests** → shared/pure utilities + components testable in isolation (Vitest/RTL/fast-check).
- **NFR-1 design conformance** → shared primitives + token single-source.
- **NFR-3 load perf** → per-tree/route code-splitting (each tree lazy-loaded by device).
- **NFR-4 runtime perf** → shared memoized hooks; tree isolation avoids loading the other UI.
- **NFR-6 a11y** → primitive-level focus rings + contrast.
- **NFR-7 deploy** → build/deploy service.

## 6. Design Risks / Notes
- **Bundle strategy synergy**: separate trees enable lazy-loading only the needed UI per device,
  directly supporting NFR-3.
- **Duplication risk**: mitigated by mandatory shared layer for all data/logic; only presentation is
  duplicated across trees (intentional, per Q1/Q2 goals).
- **Migration approach**: incremental — introduce device layer + shared primitives first (Foundation
  unit), then migrate screens tree-by-tree, preserving behavior at each step.
- **Auth screens**: modest device differences; exact shared-vs-split decision finalized in Units
  Generation.

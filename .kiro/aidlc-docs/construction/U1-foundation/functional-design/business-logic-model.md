# U1 Foundation — Business Logic Model

U1 is technical foundation; its "business logic" is client-side resolution logic (no server logic).

## 1. Device Class Resolution
Inputs (browser signals):
- `viewportWidth` via `matchMedia('(max-width: 767px)')` (mobile breakpoint 768px, per DESIGN.md `md`).
- `coarsePointer` via `matchMedia('(pointer: coarse)')`.
- `noHover` via `matchMedia('(hover: none)')`.
- `override` (persisted user choice: 'desktop' | 'mobile' | null).

Resolution algorithm (pure, deterministic):
```
resolveDevice({ viewportWidth, coarsePointer, noHover, override }):
  if override != null: return override
  isMobileViewport = viewportWidth < 768
  isTouchLike      = coarsePointer OR noHover
  # Phone-like: narrow viewport AND touch-like → mobile
  # Wide + mouse → desktop. Narrow + mouse (small desktop window) → mobile (viewport wins).
  if isMobileViewport: return 'mobile'
  if isTouchLike AND viewportWidth < 1024: return 'mobile'   # large phones / small tablets
  return 'desktop'
```
- Recomputed on `resize`/`orientationchange` and matchMedia `change` events.
- First render must resolve synchronously (read `window.innerWidth`/matchMedia at init) to avoid a
  desktop→mobile flash.

## 2. Override Lifecycle
- `setOverride('desktop'|'mobile')` persists to `localStorage` and forces that class.
- `setOverride(null)` clears the override and returns to automatic resolution.
- Override precedence is absolute (wins over all signals).

## 3. Design Token Resolution
- Tokens are defined once (theme.css `:root` + Tailwind `@theme`) sourced from `DESIGN.md`.
- Components consume tokens via Tailwind classes / CSS variables — no per-component color literals.
- The unused `.dark` oklch block is removed so there is a single coherent theme (no override races).

## 4. Test Harness Logic
- Vitest runs jsdom; React Testing Library renders components; fast-check drives property tests.
- `DeviceProvider` accepts `forceDevice` for deterministic tests of both trees.

## Testable Properties (PBT-01; advisory under Partial mode)
- **Invariant (PBT-03)**: `resolveDevice` always returns exactly one of `'desktop' | 'mobile'` for
  any input combination.
- **Invariant (PBT-03)**: when `override != null`, `resolveDevice` output equals `override` regardless
  of other signals.
- **Invariant (PBT-03)**: `viewportWidth < 768` ⇒ output `'mobile'` (when no override).
- These are pure-function properties → good fast-check targets in U1.

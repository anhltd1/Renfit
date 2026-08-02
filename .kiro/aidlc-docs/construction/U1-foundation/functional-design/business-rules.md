# U1 Foundation — Business Rules

## Device Detection Rules
- **DR-1**: Mobile breakpoint is `< 768px` (DESIGN.md `md`). At/above 768px with a fine pointer → desktop.
- **DR-2**: A manual override always wins over automatic detection.
- **DR-3**: Touch-like devices (coarse pointer or no-hover) below 1024px resolve to mobile.
- **DR-4**: Detection updates live on resize/orientation change; the app swaps trees without full
  reload and without losing route or in-memory state.
- **DR-5**: First paint must not flash the wrong tree — resolve device synchronously on init.

## Design-Conformance Rules (from DESIGN.md — enforced by primitives)
- **DC-1**: Background `#0B0B0B`; primary `#0F6B3E`; no new green shades.
- **DC-2**: Cards use glassmorphism (transparent + backdrop-blur, radius 1.5rem, padding ≥ 2rem);
  never solid backgrounds.
- **DC-3**: Spacing on the 8px grid; transitions 300ms; primary hover = scale 1.05 + green glow.
- **DC-4**: Primary buttons are pill-shaped.
- **DC-5**: Typography Be Vietnam Pro; Vietnamese line-height ≥ 1.5; never uppercase Vietnamese.

## Accessibility Rules
- **A11Y-1**: All interactive elements show a visible green focus ring (2px, 2px offset); focus
  indicators are never removed.
- **A11Y-2**: Body text targets AAA-oriented contrast on the dark theme.
- **A11Y-3**: Interactive elements are keyboard reachable and operable.

## Token Rules
- **TK-1**: Colors/radii/spacing/fonts come only from tokens (theme.css/Tailwind), synced to DESIGN.md.
- **TK-2**: The unused `.dark` oklch block is removed; exactly one theme is active.

## Test Rules (EN-7 / PBT partial)
- **T-1**: `resolveDevice` (pure) has fast-check property tests for the invariants in
  business-logic-model.md (PBT-03) with shrinking + seed logging enabled (PBT-08).
- **T-2**: Each shared primitive has at least a render/behavior test (RTL).
- **T-3**: Every change set passes `npm run build` and the test suite before stage completion (NFR-8).

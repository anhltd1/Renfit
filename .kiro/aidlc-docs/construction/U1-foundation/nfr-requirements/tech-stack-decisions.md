# U1 Foundation — Tech Stack Decisions (project-wide)

Backend unchanged. Frontend keeps its current stack; U1 adds a test toolchain and formalizes tokens.

## Kept (no change)
- **React 18.3 + Vite 6 + TypeScript** — runtime/build.
- **Tailwind CSS 4** (`@tailwindcss/vite`) — styling; `@theme` tokens in `theme.css`.
- **react-router 7** — routing (same URL space; device swap internal).
- **lucide-react** (icons), **recharts** (InBody charts), **react-markdown** (chat) — retained, but
  lazy-loaded where heavy (U7).
- **localStorage** session model (auth/adminAuth) — unchanged.

## Added — Testing (EN-7, PBT-09)
- **Vitest** — test runner (jsdom environment); integrates with Vite.
- **@testing-library/react** + **@testing-library/jest-dom** + **@testing-library/user-event** —
  component render/behavior tests.
- **fast-check** — property-based testing (PBT framework of record for TS/JS; supports custom
  generators, shrinking, seed reproducibility per PBT-08/PBT-09).
- **npm scripts**: `test` (run once), optionally `test:watch` for local dev. CI/Windows uses the
  single-run script (no watch mode).

## Decisions
- **TD-1**: fast-check chosen as the PBT framework (PBT-09) — best fit for the Vitest/TS stack.
- **TD-2**: No new UI kit added. Prefer existing Radix primitives + custom `shared/primitives`;
  avoid deepening MUI usage to limit bundle size (MUI usage reviewed for reduction in U7).
- **TD-3**: Device detection uses native `matchMedia` (no dependency added).
- **TD-4**: Code-splitting via Vite dynamic `import()` + `React.lazy`/`Suspense` (U7) — no extra deps.
- **TD-5**: Design tokens remain CSS variables + Tailwind `@theme` (single source), synced to
  DESIGN.md; remove the unused `.dark` oklch block.

## Rationale
- Minimize new dependencies (small project, small team); reuse the existing toolchain; add only the
  test tooling required by the approved scope. Keep the bundle lean to serve PERF goals.

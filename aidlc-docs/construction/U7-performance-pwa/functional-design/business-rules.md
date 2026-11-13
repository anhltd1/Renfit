# U7 Performance & PWA — Business Rules

## DEAD-CODE Rules (NFR-3 lever)
- **DEAD-1**: `frontend/src/app/components/ui/` (46-file shadcn/ui scaffold) is deleted in full —
  confirmed zero imports anywhere in `src/app/` or `src/lib/` via exhaustive grep.
- **DEAD-2**: `package.json` dependencies with zero remaining imports after DEAD-1 are removed:
  `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`, all `@radix-ui/*`
  packages, `cmdk`, `vaul`, `embla-carousel-react`, `react-day-picker`, `react-hook-form`,
  `class-variance-authority`, `react-dnd`, `react-dnd-html5-backend`,
  `react-responsive-masonry`, `react-slick`, `canvas-confetti`, `sonner`, `next-themes`,
  `@popperjs/core`, `react-popper`, `input-otp`.
- **DEAD-3**: Packages that remain in active use are NOT touched: `lucide-react`, `recharts`,
  `react-markdown`, `clsx`, `tailwind-merge`, `react-router`, `date-fns` is re-checked before
  removal (see DEAD-4).
- **DEAD-4**: Any dependency whose only import site is inside a file being deleted under DEAD-1 is
  removed; any dependency with even one remaining import outside `components/ui/` is kept.

## SPLIT (Code-Splitting) Rules
- **SPLIT-1**: Each top-level route element in `App.tsx` (`LandingPage`, `DashboardRoute`,
  `LoginRoute`, `SignupRoute`, `AdminLoginRoute`, `AdminDashboardRoute`) is wrapped in
  `React.lazy(() => import(...))`, with a single shared `Suspense` boundary wrapping `<AppRoutes />`
  (one minimal centered-spinner fallback, DESIGN.md tokens, no new primitive).
- **SPLIT-2**: No second explicit lazy layer is added inside `*Route.tsx` device-split shells —
  Vite's module-graph-based chunking already separates desktop/mobile page modules once the parent
  route element is behind a dynamic `import()` boundary (per Q2/A).
- **SPLIT-3**: `StackedInbodyChart` (`app/components/InbodyCharts.tsx`) and the inline
  `recharts` chart in `ProgressScreen.tsx`, plus `ChatMessageContent.tsx` (react-markdown), are
  lazy-loaded via `React.lazy` at their call sites, each with a small local `Suspense` fallback
  (skeleton-style placeholder matching the target component's approximate size, not the app-level
  spinner) so a chart/markdown load-in doesn't visibly reflow its parent screen.
- **SPLIT-4**: No route path changes — lazy-loading is purely a bundling change; URLs, guards
  (`AuthGuard`/`AdminGuard`), and existing route props are unchanged.

## MEMO (Runtime Performance) Rules
- **MEMO-1**: `React.memo` is applied to `SidebarRow` (desktop), the row renderer inside
  `CustomerListScreen` (mobile), and `SlotCell` (`BookingCalendar.tsx`) — these are the highest-
  cardinality leaf components re-rendered on every parent list/grid update (search keystroke,
  5s poll tick).
- **MEMO-2**: No virtualization library is introduced — list/grid sizes at this project's scale
  (≤100 members, ≤14×13 booking cells) don't cross the threshold where virtualization overhead pays
  for itself, per NFR-4's "where needed" qualifier and U1's original assessment.
- **MEMO-3**: Memoization changes are additive/wrapping only — no behavior, prop shape, or test
  assertions change; existing colocated tests for the memoized components must still pass unmodified.

## PWA Rules
- **PWA-1** (finding, not a change): `public/service-worker.js`'s `fetch` handler already
  `cache.put`s every successful same-origin GET response (network-first-with-cache-fallback),
  which includes the hashed JS/CSS bundle on first successful visit — so the hardcoded `APP_SHELL`
  precache list (`/`, manifest, icons) is a secondary safety net for the truly-static, unhashed
  files, not the sole offline-capability mechanism. EN-3's stated bar ("offline launch... app shell
  still loads") is already met once a user has opened the app online at least once. No service-
  worker code change is made for this unit (per Q5/B) — this finding is documented here for
  traceability instead.
- **PWA-2**: `manifest.webmanifest`, icons, and `registerServiceWorker.ts` are verified against
  EN-3's acceptance criteria (installable, correct name/icons/theme-color, standalone launch into
  the mobile UI, SW never caches `/api/*` or `/chat`) — all already satisfied; no changes needed.

## VERIFICATION Rule
- **VERIFY-1**: After DEAD-1/DEAD-2 removal and SPLIT-1..4, `npm run build` must show multiple
  output chunks (not a single >500kB monolith) with no chunk-size warning, and `npm run test` must
  still pass in full (187 tests) — dependency/dead-code removal must not break any existing test.

# U7 Performance & PWA — Code Generation Summary

**Stories implemented**: EN-4 (load performance/code-splitting), EN-5 (runtime performance).
**EN-3 (PWA completion)**: verified already satisfied — no code change (see PWA-1 finding below).
**Status**: DONE — all 9 plan steps executed, tests + build pass.

## Bundle size — before / after
| Metric | Before | After |
|---|---|---|
| JS output | 1 chunk, 947.68 kB (263.08 kB gzip) | 27 chunks, largest 397.26 kB (109.52 kB gzip, `InbodyCharts` — lazy-loaded) |
| Main entry chunk | 947.68 kB | `index-*.js` 189.25 kB (62.45 kB gzip) |
| Vite chunk-size warning | Present (">500 kB after minification") | **Gone** |
| npm dependencies | 69 direct deps | 7 direct deps (62 removed, see DEAD-2) |

## What was built

### Step 1 — Dead-code removal (DEAD-1)
- Deleted `frontend/src/app/components/ui/` (46 files, unused shadcn/ui scaffold) — re-confirmed
  zero imports via exhaustive grep before deletion.

### Step 2 — Dead-dependency removal (DEAD-2/3/4)
- Removed 62 unused packages from `frontend/package.json`: `@mui/material`,
  `@mui/icons-material`, `@emotion/react`, `@emotion/styled`, all 20 `@radix-ui/*` packages,
  `cmdk`, `vaul`, `embla-carousel-react`, `react-day-picker`, `react-hook-form`,
  `class-variance-authority`, `react-dnd`, `react-dnd-html5-backend`,
  `react-resizable-panels`, `react-responsive-masonry`, `react-slick`, `canvas-confetti`,
  `sonner`, `next-themes`, `@popperjs/core`, `react-popper`, `input-otp`, `date-fns`, `motion`
  (the last two re-verified unused beyond the plan's initial list). `npm install` removed 151
  transitive packages from `node_modules`.
- Kept (still actively imported): `clsx`, `lucide-react`, `react-markdown`, `react-router`,
  `recharts`, `tailwind-merge`, `tw-animate-css`.

### Step 3 — Shared Suspense fallback
- `frontend/src/app/components/LazyLoadFallback.tsx` (+ `.test.tsx`) — minimal centered spinner.

### Step 4 — Route-level code-splitting (SPLIT-1/SPLIT-2)
- `frontend/src/app/App.tsx` — all 6 route elements converted to `React.lazy`, `<AppRoutes />`
  wrapped in a single `<Suspense fallback={<LazyLoadFallback />}>`. No second lazy layer added
  inside `*Route.tsx` device-split shells — Vite's module graph already splits desktop/mobile
  page modules once behind the dynamic `import()` boundary (confirmed in the build output:
  `DashboardRoute`, `AdminDashboardRoute` are each their own chunk).

### Step 5 — Lazy-load recharts call sites (SPLIT-3)
- Extracted `fmtDate` out of `InbodyCharts.tsx` into a new lightweight
  `frontend/src/app/components/inbodyFormat.ts` so callers needing only the date label don't pull
  in `recharts` transitively.
- `StackedInbodyChart` is `React.lazy`-loaded at both call sites
  (`desktop/components/InbodySection.tsx`, `mobile/components/InbodySectionMobile.tsx`), each with
  a local skeleton `Suspense` fallback.
- Extracted `ProgressScreen.tsx`'s inline `recharts` chart into
  `frontend/src/app/mobile/screens/ProgressChart.tsx` (+ `.test.tsx`), lazy-loaded the same way.

### Step 6 — Lazy-load react-markdown call site (SPLIT-3)
- `ChatMessageContent` is `React.lazy`-loaded in `ChatPanel.tsx`, with a plain-text fallback (the
  raw, unformatted message) so nothing is ever invisible while the markdown chunk downloads.

### Step 7 — Runtime memoization (MEMO-1/MEMO-2)
- `React.memo` applied to `desktop/components/SidebarRow.tsx` and `BookingCalendar.tsx`'s
  `SlotCell`.
- Extracted and memoized a new `CustomerRow` component inside
  `mobile/screens/CustomerListScreen.tsx` (previously an inline `.map()`).
- `AdminBookings.tsx` deliberately left unmodified — its slot cells are inline JSX inside a file
  marked "reused as-is" per U5/U6's DL-3/BOOK-ADMIN-1 precedent; extracting them would violate that
  established reuse-over-rewrite boundary. Noted as the one planned deviation (MEMO-2/Step 7).
- No virtualization library introduced (MEMO-2) — list/grid sizes (≤100 members, ≤14×13 cells)
  don't cross the threshold where it pays for itself.

### Step 8 — Verification
- `npm run test`: 55 test files, 189 tests, all passing (2 new test files:
  `LazyLoadFallback.test.tsx`, `ProgressChart.test.tsx`).
- `npm run build`: 2486 modules, 27 output chunks, **no chunk-size warning** (see table above).
  `dist/` cleaned up.

### Step 9 — Documentation (this file)

## PWA finding (EN-3, no code change)
Re-inspected `public/service-worker.js`: its `fetch` handler already runs a network-first strategy
that `cache.put`s every successful same-origin GET response — this includes the hashed JS/CSS
bundle on a user's first successful visit, not just the hardcoded `APP_SHELL` precache list
(`/`, manifest, icons). EN-3's acceptance bar ("offline launch... app shell still loads") is
already satisfied once a user has opened the app online at least once; the `APP_SHELL` list is a
secondary safety net for the truly-static unhashed files, not the sole offline-capability path.
No service-worker change was made for this unit (per the approved Q5/B answer).

## Deviations from the functional design plan
- `AdminBookings.tsx` was left unmodified rather than memoized (see Step 7) — consistent with the
  project's reuse-over-rewrite bias for files marked "reused as-is" in prior units.
- `date-fns` and `motion` were added to the removal list beyond the plan's initial enumeration
  after re-verifying they too have zero imports.

## Files created
- `frontend/src/app/components/LazyLoadFallback.tsx` (+ `.test.tsx`)
- `frontend/src/app/components/inbodyFormat.ts`
- `frontend/src/app/mobile/screens/ProgressChart.tsx` (+ `.test.tsx`)

## Files modified
- `frontend/package.json` (62 dependencies removed)
- `frontend/src/app/App.tsx` (lazy routes + Suspense)
- `frontend/src/app/components/InbodyCharts.tsx` (re-exports `fmtDate` from the new module)
- `frontend/src/app/desktop/components/InbodySection.tsx` (lazy chart)
- `frontend/src/app/mobile/components/InbodySectionMobile.tsx` (lazy chart)
- `frontend/src/app/mobile/screens/ProgressScreen.tsx` (lazy chart, extracted)
- `frontend/src/app/components/chat/ChatPanel.tsx` (lazy markdown)
- `frontend/src/app/desktop/components/SidebarRow.tsx` (memoized)
- `frontend/src/app/components/BookingCalendar.tsx` (memoized `SlotCell`)
- `frontend/src/app/mobile/screens/CustomerListScreen.tsx` (extracted + memoized `CustomerRow`)

## Files deleted
- `frontend/src/app/components/ui/` (46 files)

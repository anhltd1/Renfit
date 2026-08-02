# U7 Performance & PWA — Functional Design Plan

**Unit**: U7 (EN-3 PWA completion, EN-4 load performance/code-splitting, EN-5 runtime performance).
This unit also revisits NFR-3/NFR-4 (established project-wide in U1, deferred to U7 per the
adaptive stage policy).

## Context found
- **Bundle**: `npm run build` currently emits a single `index-*.js` at ~947 kB (263 kB gzip) with
  Vite's "chunk larger than 500 kB" warning — no route/tree-level splitting exists yet. This is the
  exact ~867 kB→~950 kB monolith EN-4/NFR-3 call out (it grew slightly across U3-U6 as features
  were added).
- **Dead code found**: `frontend/src/app/components/ui/` (46 shadcn/ui files: accordion, calendar,
  carousel, chart, command, drawer, form, sidebar, etc.) is **entirely unimported** anywhere in
  `src/app/` or `src/lib/` — confirmed via exhaustive grep. It pulls in `@radix-ui/*` (20+
  packages), `cmdk`, `vaul`, `embla-carousel-react`, `react-day-picker`, `react-hook-form`,
  `class-variance-authority`, and more, none of which appear anywhere else in the active app. This
  is Vite's `figma:asset`/shadcn scaffold boilerplate left over from before the AI-DLC rebuild
  began — same category as the dead pages already deleted in U3/U5 (`DashboardPage.tsx` etc.).
  Similarly, `@mui/material`, `@mui/icons-material`, `@emotion/*`, `react-dnd*`,
  `react-responsive-masonry`, `react-slick`, `canvas-confetti`, `sonner`, `next-themes`,
  `@popperjs/core`, `react-popper` have **zero imports** in `src/app/`.
- **Heavy libs already lazy-load candidates**: `recharts` (used only in `InbodyCharts.tsx` +
  `ProgressScreen.tsx`) and `react-markdown` (used only in `ChatMessageContent.tsx`) are imported
  eagerly at module scope even though they're only needed once a user opens InBody/chat screens.
- **Route structure**: `App.tsx` imports every page component eagerly (`LandingPage`,
  `DashboardRoute`, `AdminDashboardRoute`, etc.) — each `*Route.tsx` (U3/U5) already does the
  desktop-vs-mobile `useDevice()` branch, but both branches are bundled into the same chunk
  regardless of which device actually renders. No `React.lazy`/`Suspense` exists anywhere yet.
- **Runtime perf**: `AdminBookings.tsx`/`BookingCalendar.tsx` render a day×hour grid (max 14 days ×
  13 hours ≈ 180 cells) — not large enough to need virtualization at this project's scale (30-100
  users), consistent with U1's NFR-4 note ("large lists... where needed"). `useAdminBookings`
  already polls every 5s and pauses while a dialog is open (DR-4 pattern) — no obvious re-render
  jank source found beyond the unmemoized inline components already reused as-is per DL-3/BOOK-
  ADMIN-1 (out of scope to rewrite per the reuse-over-rewrite bias).
- **PWA**: manifest + icons + service worker (network-first app shell, `/api`+`/chat` bypassed)
  already exist and look correct (EN-3's core ask). Not yet verified: whether `index.html`'s
  `Vietnamese`/theme-color meta tags are complete (they are), and whether the SW's cached
  `APP_SHELL` list matches the actual built asset filenames (currently `['/', '/manifest.webmanifest',
  '/icon-192.png', '/icon-512.png']` — doesn't include the built JS/CSS bundle, so a fully offline
  *first* load of a cold cache would still 404 on the hashed JS/CSS files even though `/` itself is
  cached).

## Decisions needed (please answer)

### Question 1 — Dead dependency/code removal scope
A) **Remove `components/ui/` and all its exclusively-supporting dependencies now** (recommended) —
   delete the 46-file directory plus `package.json` entries for packages with zero remaining
   imports (`@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`,
   `@radix-ui/*` (all), `cmdk`, `vaul`, `embla-carousel-react`, `react-day-picker`,
   `react-hook-form`, `class-variance-authority`, `react-dnd`, `react-dnd-html5-backend`,
   `react-responsive-masonry`, `react-slick`, `canvas-confetti`, `sonner`, `next-themes`,
   `@popperjs/core`, `react-popper`, `input-otp`). This is the single biggest lever on NFR-3 — it
   removes dependencies from the dependency graph entirely rather than just deferring their load,
   and is consistent with this project's precedent of deleting confirmed-dead code (U3's 4 unrouted
   pages, U5/U6's superseded bridge files).

B) Leave `components/ui/` and its dependencies in place (don't touch dead code in a
   performance-focused unit); rely on code-splitting alone to defer cost.

X) Other (please describe after [Answer]: tag below)

[Answer]: A (recommendation)

### Question 2 — Route/tree-level code-splitting mechanism
A) **`React.lazy` + `Suspense` at the route level in `App.tsx`** (recommended) — wrap each
   `<Route element={...}>` target (`LandingPage`, `DashboardRoute`, `LoginRoute`, `SignupRoute`,
   `AdminLoginRoute`, `AdminDashboardRoute`) in `React.lazy(() => import(...))`, with a single
   minimal `Suspense fallback` (a small centered spinner using existing tokens, no new primitive
   needed). This naturally also splits desktop-vs-mobile in each `*Route.tsx` shell — since dynamic
   `import()` boundaries follow the module graph, Vite will further split desktop/mobile pages into
   separate chunks automatically without needing a second lazy layer inside each `*Route.tsx`.

B) Two-layer lazy loading — lazy at `App.tsx` AND a second explicit `React.lazy` inside each
   `*Route.tsx` for its desktop/mobile branch. More explicit control over chunk boundaries, but
   more boilerplate across 6 files for likely the same practical chunking outcome as A.

X) Other (please describe after [Answer]: tag below)

[Answer]: A (recommendation)

### Question 3 — Heavy library lazy-loading (recharts, react-markdown)
A) **Lazy-load `recharts`-dependent components** (`InbodyCharts.tsx`'s `StackedInbodyChart`,
   `ProgressScreen.tsx`'s inline chart) **and `ChatMessageContent.tsx`** (react-markdown) via
   `React.lazy` at their call sites (recommended) — these are the two heaviest third-party libs
   still in active use, and both are only needed after a user navigates into InBody or opens chat,
   not on initial paint.

B) Leave them eagerly bundled; rely only on the route-level split (Q2) to keep them out of the
   initial landing/login chunk.

X) Other (please describe after [Answer]: tag below)

[Answer]: A (recommendation)

### Question 4 — Runtime performance (EN-5) scope
A) **Targeted memoization only, no virtualization** (recommended) — wrap the few
   props-stable-but-frequently-parent-re-rendered leaf components most likely to jank (`SidebarRow`/
   `CustomerListScreen` rows, `BookingCalendar`/`AdminBookings` slot cells) in `React.memo` where
   profiling-by-inspection shows a clear win; do NOT introduce a virtualization library — list
   sizes here (≤100 members, ≤180 calendar cells) are well below the threshold where virtualization
   pays for itself, matching NFR-4's own "where needed" qualifier and U1's assessment.

B) Add a virtualization library (e.g. `react-window`) for the customer list and booking grid
   regardless of current list size, as a forward-looking investment.

X) Other (please describe after [Answer]: tag below)

[Answer]: A (recommendation)

### Question 5 — PWA offline-shell gap
The service worker's `APP_SHELL` precache list doesn't include the built (hashed) JS/CSS bundle
filenames, so a true cold-cache offline-first-load would fail past `/`.

A) **Fix the service worker to precache the actual built asset manifest** (recommended) — since
   Vite's output filenables are content-hashed and unknown until build time, generate the
   `APP_SHELL` list from the build output (a small post-build step that injects the hashed
   `index-*.js`/`index-*.css` filenames into `service-worker.js`, or switch to runtime
   `cache.addAll` triggered from the fetch handler's first successful network fetch of those
   assets — simplest: cache-as-you-go for the JS/CSS since the network-first strategy already
   `cache.put`s every same-origin GET response, so the *only* real gap is the explicit
   `APP_SHELL` precache list being stale/incomplete for a true first-ever offline load). Concretely:
   drop the hardcoded JS/CSS guess entirely and rely on the existing network-first `fetch` handler
   (which already caches every successful same-origin GET) — the `install` event only needs to
   precache the truly static, unhashed files (`/`, `/manifest.webmanifest`, icons), which is what it
   already does. Re-verify this behavior is correct as understood rather than assuming a bug exists
   for the hashed bundle (EN-3 already requires "offline launch... app shell still loads", not
   full offline app functionality).

B) Leave the service worker as-is; EN-3's stated bar (offline app-shell load, never cache
   `/api`/`/chat`) may already be satisfied by the existing network-first-with-cache-fallback
   design once a user has visited once online (which caches the hashed bundle via the fetch
   handler already).

X) Other (please describe after [Answer]: tag below)

[Answer]: B (recommendation) — re-reading the existing `service-worker.js` fetch handler, it
already `cache.put`s every successful same-origin GET (including the hashed JS/CSS on first visit),
so the real APP_SHELL precache list is a legitimate secondary safety net, not the only path to
offline-capability. No code change needed here; this question is resolved by inspection rather
than by a build step. (Kept as a plan question for traceability — will note this finding in
business-rules.md rather than changing behavior.)

---

## Execution Checklist (runs after answers)
- [x] business-rules.md — code-splitting rules, dead-code removal list, PWA verification notes
- [x] frontend-components.md — file-by-file plan (App.tsx lazy wiring, lazy chart/markdown wrappers,
      dependency removal list, memoization targets)

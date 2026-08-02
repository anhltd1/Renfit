# User Stories

**Breakdown**: Hybrid — grouped by persona; each story tagged `[device]` and `(feature area)`.
**Acceptance criteria**: Given/When/Then. **Granularity**: Medium (each ~ one unit of work).
**INVEST**: Each story is Independent, Negotiable, Valuable, Estimable, Small, Testable.

**Device tags**: `[Mobile]` native-like mobile UI · `[Desktop]` desktop UI · `[Both]` shared/adaptive.
**Traceability**: FR-*/NFR-* refer to `requirements.md`.

---

## Enabler / NFR Stories (foundation — precede most feature stories)

### EN-1 — Device-based rendering foundation `[Both]` (app shell) — FR-1
As the app, I want to detect the user's device class and render the correct UI tree, so that
computers get the desktop UI and phones get the native-like mobile UI.
- **Given** a user opens the app on a desktop (fine pointer, wide viewport)
  **When** the app loads **Then** the desktop UI tree renders.
- **Given** a user opens the app on a phone (coarse pointer, narrow viewport)
  **When** the app loads **Then** the mobile UI tree renders.
- **Given** the viewport/orientation changes across the boundary
  **When** the change occurs **Then** the app switches trees without a full reload or data loss.
- **Given** the detection logic **When** unit-tested **Then** desktop/mobile decisions are covered
  by tests (RTL), including the resize transition.

### EN-2 — Design-system conformance & tokens `[Both]` (design) — NFR-1, NFR-2, FR-6
As a stakeholder, I want all rebuilt UI to follow `DESIGN.md`, so the product feels premium and consistent.
- **Given** any rebuilt screen **When** reviewed against `DESIGN.md` **Then** it uses `#0B0B0B`
  background, `#0F6B3E` primary, glassmorphism cards (transparent + backdrop-blur, 1.5rem radius,
  ≥2rem padding), 8px spacing, 300ms transitions, and Be Vietnam Pro typography.
- **Given** Vietnamese text **When** rendered **Then** line-height ≥ 1.5, no uppercasing, diacritics intact.
- **Given** interactive elements **When** focused via keyboard **Then** a visible green focus ring shows.
- **Given** the anti-patterns list in `DESIGN.md` **When** auditing **Then** none are present.

### EN-3 — PWA completion `[Mobile]` (pwa) — FR-4
As Minh, I want to install Renfit as an app on my phone, so it launches and behaves like a native app.
- **Given** the site on a mobile browser **When** I choose "Add to Home Screen" **Then** it installs
  with correct name, icons, and theme color.
- **Given** the installed PWA **When** I launch it **Then** it opens standalone into the mobile UI.
- **Given** the service worker **When** any `/api/*` or `/chat` request is made **Then** it is never
  served from cache (always network).
- **Given** offline launch **When** the network is unavailable **Then** the app shell still loads.

### EN-4 — Load performance / code-splitting `[Both]` (performance) — NFR-3
As Minh, I want the app to load fast, so I'm not waiting on a huge download.
- **Given** the production build **When** analyzed **Then** the initial JS is split into route/feature
  chunks (no single ~867 kB monolith) and heavy libs (charts, markdown) load lazily.
- **Given** first load on a mid-range phone **When** measured **Then** first paint is meaningfully
  faster than the current baseline.
- **Given** `npm run build` **When** run **Then** it succeeds with no chunk-size error.

### EN-5 — Runtime performance `[Both]` (performance) — NFR-4
As Minh/Trang, I want smooth interactions, so the dashboard doesn't stutter.
- **Given** dashboard interactions (tab switches, calendar scroll, chat) **When** used **Then** there
  is no visible jank from avoidable re-renders.
- **Given** large lists (bookings, members) **When** rendered **Then** they use memoization/
  virtualization as appropriate.

### EN-6 — Accessibility baseline `[Both]` (a11y) — NFR-2
As any user, I want accessible UI, so I can navigate by keyboard and read text comfortably.
- **Given** any rebuilt screen **When** navigated by keyboard **Then** all interactive elements are
  reachable and show the green focus indicator.
- **Given** body text **When** contrast is checked **Then** it targets AAA-oriented ratios per `DESIGN.md`.

### EN-7 — Frontend test setup `[Both]` (testing) — FR-7, NFR-8, PBT-09
As a developer, I want an automated frontend test suite, so the rebuild is verifiable and regressions are caught.
- **Given** the frontend **When** the toolchain is set up **Then** Vitest + React Testing Library +
  fast-check are configured and runnable via an npm script.
- **Given** key components and pure utilities **When** tested **Then** they have render/behavior tests;
  pure utilities with round-trip/invariant properties (PBT-02/PBT-03) have fast-check tests.
- **Given** CI/local runs **When** a property fails **Then** the seed is logged and shrinking is enabled (PBT-08).

### EN-8 — Deployment (Docker Compose on a cloud VM) `[Both]` (deploy) — NFR-7
As the Owner, I want to deploy on a single cloud VM, so running the app for 30–100 users is simple and cheap.
- **Given** the repo's Docker Compose topology **When** deployed to one Linux VM **Then** backend and
  frontend containers run and the app is reachable.
- **Given** the production build **When** containerized **Then** it serves the built assets (not a dev
  server) appropriately for production.
- **Given** deployment **When** documented **Then** steps + env/secret handling are provided; secrets
  stay in gitignored env files.

---

## Trainee (Minh) Stories

### TS-1 — Trainee mobile app shell & navigation `[Mobile]` (shell) — FR-2, FR-1
As Minh, I want an app-style mobile shell with bottom-tab navigation, so the app feels native on my phone.
- **Given** the mobile UI **When** it loads **Then** a bottom tab bar exposes the primary areas
  (Overview, Booking, Coach, Progress/Profile) with touch-friendly targets and safe-area insets.
- **Given** I switch tabs **When** navigating **Then** transitions feel native and state is preserved.
- **Given** desktop-style modals **When** shown on mobile **Then** they use sheets/drawers instead.

### TS-2 — Trainee desktop dashboard shell `[Desktop]` (shell) — FR-3, NFR-5
As Minh on a laptop, I want a clean desktop dashboard, so I can use Renfit comfortably on a big screen.
- **Given** the desktop UI **When** it loads **Then** the sidebar/header layout conforms to `DESIGN.md`
  with corrected text colors, box sizing, and proportions.
- **Given** dashboard tabs **When** switched **Then** content state is preserved without jank.

### TS-3 — Trainee mobile booking flow `[Mobile]` (bookings) — FR-2, FR-5
As Minh, I want to book/cancel sessions on mobile in a native-feeling flow, so scheduling is effortless.
- **Given** the mobile booking view **When** I browse availability **Then** it uses a touch-optimized
  layout (not a horizontally-scrolled desktop grid squeezed onto a phone).
- **Given** an open slot **When** I tap it and confirm via a mobile sheet **Then** the booking is
  created (pending) and I get clear confirmation.
- **Given** a pending/approved booking **When** I cancel it **Then** it is removed and the slot reopens.
- **Given** past/full/closed (Sunday) slots **When** displayed **Then** they are clearly non-bookable.

### TS-4 — Trainee desktop booking calendar `[Desktop]` (bookings) — FR-3, FR-5
As Minh on desktop, I want the multi-day calendar grid, so I can see availability at a glance.
- **Given** the desktop calendar **When** rendered **Then** the sliding multi-day grid conforms to
  `DESIGN.md` and today's column is highlighted.
- **Given** booking/cancel actions **When** performed **Then** they behave exactly as today (parity),
  with corrected styling and contained horizontal scroll.

### TS-5 — AI Coach chat (mobile) `[Mobile]` (chat) — FR-2, FR-5
As Minh, I want a native-feeling chat on mobile, so coaching and booking-via-chat are pleasant.
- **Given** the mobile chat **When** open **Then** it is full-screen with a sticky composer, safe-area
  aware, with suggested-reply chips wrapping cleanly.
- **Given** an artifact (profile/InBody/availability/confirmation) **When** returned **Then** it renders
  as a touch-friendly card; booking from an availability artifact works and confirms.

### TS-6 — AI Coach chat (desktop) `[Desktop]` (chat) — FR-3, FR-5
As Minh on desktop, I want the chat panel refined, so it matches the design system.
- **Given** the desktop chat panel **When** used **Then** message bubbles, artifacts, and composer
  conform to `DESIGN.md`; all current chat/artifact behavior is preserved.

### TS-7 — Progress & profile (mobile) `[Mobile]` (inbody/profile) — FR-2, FR-5
As Minh, I want to view InBody progress and edit my profile on mobile natively.
- **Given** the mobile progress view **When** open **Then** InBody charts are readable on a narrow
  screen (mobile-appropriate visualization, not a clipped desktop chart).
- **Given** my profile **When** I edit and save **Then** changes persist via the existing API.

### TS-8 — Progress & profile (desktop) `[Desktop]` (inbody/profile) — FR-3, FR-5
As Minh on desktop, I want refined progress/profile views conforming to the design system.
- **Given** the desktop progress/profile **When** rendered **Then** charts and forms conform to
  `DESIGN.md` with corrected spacing/sizing; save behavior matches today.

### TS-9 — Notifications & onboarding `[Both]` (notifications/onboarding) — FR-5, FR-2
As Minh, I want notifications and first-run onboarding that work well on both devices.
- **Given** notifications **When** shown **Then** the bell/dropdown/toasts are viewport-safe on mobile
  and desktop and remain clickable to their target screens.
- **Given** a new account **When** first logging in **Then** onboarding guides me appropriately for my
  device (mobile onboarding targets the mobile shell, not desktop-only sidebar items).

### TS-10 — Trainee auth screens `[Both]` (auth) — FR-3, NFR-1
As Minh, I want polished login/signup screens, so first impressions match the premium brand.
- **Given** login/signup **When** rendered on mobile and desktop **Then** they conform to `DESIGN.md`,
  inputs are comfortable (Vietnamese-safe), and current auth behavior is preserved.

---

## Trainer (Trang) Stories

### TR-1 — Trainer desktop dashboard (master-detail) `[Desktop]` (shell/admin) — FR-3, NFR-5
As Trang, I want a crisp desktop master-detail dashboard, so I can manage members efficiently.
- **Given** the desktop admin dashboard **When** loaded **Then** the member list + detail layout
  conforms to `DESIGN.md` with corrected density, spacing, and proportions.
- **Given** selecting a member **When** clicked **Then** the detail panel updates without jank.

### TR-2 — Trainer mobile management UI `[Mobile]` (shell/admin) — FR-2
As Trang on a phone, I want a native-feeling management view, so I can work away from the desk.
- **Given** the mobile admin UI **When** opened **Then** it uses app-style navigation (list → detail
  as full-screen stack, back affordance), not a cramped desktop layout.

### TR-3 — Trainer booking management (desktop) `[Desktop]` (bookings/admin) — FR-3, FR-5
As Trang, I want to approve/reject/assign bookings on desktop, exactly as today but polished.
- **Given** the desktop booking calendar **When** I tap a booking **Then** I can approve/reject/reset
  via a `DESIGN.md`-conformant modal.
- **Given** an empty slot **When** I assign a member **Then** the assignment is created (parity preserved).

### TR-4 — Trainer booking management (mobile) `[Mobile]` (bookings/admin) — FR-2, FR-5
As Trang on mobile, I want to manage bookings in a touch-friendly way.
- **Given** the mobile booking management **When** used **Then** approve/reject/assign work via mobile
  sheets with clear status, preserving all desktop capabilities.

### TR-5 — InBody recording `[Both]` (inbody/admin) — FR-5, NFR-1
As Trang, I want to record InBody measurements on either device.
- **Given** a member **When** I add an InBody record **Then** it saves via the existing API and appears
  in their history; the form conforms to `DESIGN.md` on both devices.

### TR-6 — Trainer notifications `[Both]` (notifications/admin) — FR-5
As Trang, I want reliable notifications on both devices.
- **Given** trainer events (booking created/cancelled, trainee registered) **When** they occur **Then**
  the popup/toast and dropdown are viewport-safe and correct on mobile and desktop.

### TR-7 — Admin login `[Both]` (auth/admin) — FR-3, NFR-1
As Trang, I want a polished admin login on both devices.
- **Given** the admin login **When** rendered **Then** it conforms to `DESIGN.md` and preserves current
  auth behavior.

---

## Notes on INVEST & sequencing
- **Foundation first**: EN-1 (device rendering), EN-2 (design tokens), EN-7 (test setup) should land
  before/with the first feature stories, since feature stories depend on them.
- Each feature story is independently shippable and testable, mapping roughly to a unit of work for
  the Construction phase.
- Device-split (mobile vs desktop) stories are intentionally separate where the experience differs
  materially (per plan Q2), and combined `[Both]` where the experience is essentially shared.

# AI-DLC State Tracking

## Project Information
- **Project Name**: Renfit — Private Gym Management System
- **Project Type**: Brownfield
- **Start Date**: 2026-07-16T19:10:07+07:00
- **Current Phase**: CONSTRUCTION
- **Current Stage**: V5 PT Experience Improvements — INCEPTION artifacts generated, awaiting approval (see V5 section at the bottom). V1 U9 and V2 final Build and Test still open.

## Workspace State
- **Existing Code**: Yes
- **Programming Languages**: Python (backend), TypeScript/TSX (frontend)
- **Build System**: pip/requirements.txt (backend), npm + Vite (frontend), Docker Compose
- **Project Structure**: Two-tier monolith — FastAPI backend + React SPA, MongoDB data store
- **Reverse Engineering Needed**: Yes
- **Workspace Root**: c:\Users\anh.le_deliveree\Desktop\Renfit

## Code Location Rules
- **Application Code**: Workspace root (NEVER in the docs folder)
- **Documentation**: `aidlc-docs/` (relocated from `aidlc-docs/` on 2026-07-16 so Kiro
  steering/skills can reference it directly — see `CLAUDE.md` and
  `.claude/skills/ai-dlc/SKILL.md`). All paths below are relative to `aidlc-docs/`.
- **Structure patterns**: See code-generation.md Critical Rules

## Extension Configuration
| Extension | Enabled | Decided At |
|---|---|---|
| Security Baseline | No | Requirements Analysis |
| Resiliency Baseline | No | Requirements Analysis |
| Property-Based Testing | Partial (pure functions + serialization round-trips only) | Requirements Analysis |

## Stage Progress

### INCEPTION Phase
- [x] Workspace Detection — Completed 2026-07-16T19:10:07+07:00 (Brownfield)
- [x] Reverse Engineering — Approved 2026-07-16T19:10:07+07:00
  - **Artifacts Location**: aidlc-docs/inception/reverse-engineering/
- [x] Requirements Analysis — Approved 2026-07-16T19:10:07+07:00
  - **Artifacts Location**: aidlc-docs/inception/requirements/
- [x] User Stories — Approved 2026-07-16T19:10:07+07:00
  - **Artifacts**: aidlc-docs/inception/user-stories/{personas.md, stories.md}; plan + assessment in inception/plans/
  - 17 feature stories (10 trainee, 7 trainer) + 8 enabler/NFR stories
- [x] Workflow Planning — Approved 2026-07-16T19:10:07+07:00
- [x] Application Design — Generated 2026-07-16T19:10:07+07:00 (awaiting approval)
  - **Artifacts**: aidlc-docs/inception/application-design/ (components, component-methods, services, component-dependency, application-design)
  - Decisions: separate desktop/mobile trees, enhanced device detection, token single-source, bottom-tab mobile nav, same-URL device swap
- [x] Units Generation — Approved 2026-07-16T19:10:07+07:00
  - **Artifacts**: aidlc-docs/inception/application-design/{unit-of-work, unit-of-work-dependency, unit-of-work-story-map}.md
  - 9 units (U1 Foundation → U9 Deployment), sequential delivery

### CONSTRUCTION Phase (per-unit loop)
**Adaptive stage policy**: Functional Design = selective per unit; NFR Requirements + NFR Design =
established once in U1 (project-wide), revisited only for U7 (perf/PWA) and U9 (deploy);
Infrastructure Design = U9 only; Code Generation + Build and Test as prescribed.

- [x] U1 Foundation — COMPLETE (Approved 2026-07-16)
  - [x] Functional Design — Approved
  - [x] NFR Requirements — Approved (project-wide standards)
  - [x] NFR Design — Approved (project-wide patterns)
  - [x] Infrastructure Design — SKIPPED (no infra in U1)
  - [x] Code Generation — DONE, Approved (22 tests pass, build clean)
    - EN-1, EN-2, EN-7 implemented. Files: app/device/*, app/shared/primitives/*, theme.css, App.tsx, test tooling
- [x] U2 Shared data layer — COMPLETE (Approved)
  - [x] Functional Design — Approved
  - [x] Code Generation — DONE
    - 9 hooks implemented: useBookingAvailability/useCreateBooking/useCancelBooking,
      useAdminBookings/useUpdateBookingStatus/useAssignBooking/useCustomers, useInbodyHistory/useAddInbody,
      useProfile, useChat, useNotifications, useTrainerNotifications, useAuth, useAdminAuth.
      Files: app/shared/hooks/*, lib/api/profile.ts (added fetchMyInbody).
- [x] U3 Trainee desktop — COMPLETE (Approved)
  - [x] Functional Design — Approved
  - [x] Code Generation — DONE
    - Desktop tree built (DesktopSidebar, DesktopHeader, OverviewTab, BookingTab, UserDashboardPage,
      LoginPage, SignupPage) wired to U2 hooks where applicable; BookingCalendar/ChatPanel reused
      as-is per DL-3. Thin device-split route entries (DashboardRoute/LoginRoute/SignupRoute).
      Temporary mobile bridge (app/mobile/pages/*, verbatim copies, marked for U4 replacement).
      Deleted 3 superseded old page files + 4 confirmed-dead unrouted pages.
- [x] U4 Trainee mobile — COMPLETE (Approved)
  - [x] Functional Design — Approved
  - [x] Code Generation — DONE
    - Mobile shell (useStack, BottomTabBar, StackHeader, MobileShell) + screens (Overview,
      ProfileTabRoot, Profile, Progress, Booking, Coach) + components (DayScroller, InbodyStatCard).
      Generalized OnboardingTour.tsx for mobile reuse (backward-compatible). Replaced U3's temporary
      mobile bridge with the real implementation (pages/{UserDashboardPage,LoginPage,SignupPage}.tsx).
- [x] U5 Trainer desktop — COMPLETE (Approved)
  - [x] Functional Design — Approved
  - [x] Code Generation — DONE, awaiting approval to proceed to U6
    - Desktop tree built (DesktopAdminHeader, CustomerSidebar, SidebarRow, CustomerDetail,
      DetailField, InbodySection, AddInbodyModal rebuilt on shared Modal primitive) + desktop
      AdminDashboardPage/AdminLoginPage (rewired to useAdminAuth()); AdminBookings/InbodyCharts/
      TrainerNotificationBell/LiveClock reused as-is. Thin device-split route entries
      (AdminDashboardRoute/AdminLoginRoute). Temporary mobile bridge (app/mobile/pages/
      AdminDashboardPage.tsx, AdminLoginPage.tsx, verbatim copies, marked for U6 replacement).
      Deleted 2 superseded combined page files. 46 test files / 163 tests pass, build clean
      (2478 modules).
- [x] U6 Trainer mobile — COMPLETE (Approved)
  - [x] Functional Design — Approved (go with recommendations)
  - [x] Code Generation — DONE, awaiting approval to proceed to U7
    - Mobile shell (AdminBottomTabBar, sibling of U4's BottomTabBar) + screens (CustomerListScreen,
      CustomerDetailScreen) + components (InbodySectionMobile, AddInbodySheet rebuilt on shared
      Sheet primitive). AdminBookings/TrainerNotificationBell reused as-is. U5's temporary mobile
      bridge (AdminDashboardPage.tsx, AdminLoginPage.tsx) replaced wholesale with the real
      native-like implementation (2-tab bottom bar + stack nav for clients list→detail).
      53 test files / 187 tests pass, build clean (2482 modules).
- [x] U7 Performance & PWA — COMPLETE (Approved)
  - [x] Functional Design — Approved (go with recommendations)
  - [x] NFR Requirements/Design — REVISITED (per U1's adaptive stage policy; NFR-3/NFR-4 refined here)
  - [x] Code Generation — DONE, awaiting approval to proceed to U8
    - Deleted dead `components/ui/` tree (46 files) + 62 unused npm dependencies (151 transitive
      packages removed). Route-level code-splitting via React.lazy/Suspense in App.tsx. Lazy-loaded
      recharts (InbodyCharts, new ProgressChart) and react-markdown (ChatMessageContent) at their
      call sites. React.memo on SidebarRow, BookingCalendar's SlotCell, new CustomerRow (mobile).
      PWA (EN-3) verified already satisfied — no code change needed. Bundle: 1×947kB monolith with
      a chunk-size warning → 27 chunks, no warning, main entry down to 189kB. 55 test files / 189
      tests pass, build clean.
- [x] U8 Accessibility — COMPLETE (Approved)
  - [x] Code Generation (audit + fix pass, no separate functional design per adaptive stage policy)
    — DONE, awaiting approval to proceed to U9
    - Global `:focus-visible` green ring added (theme.css), fixing the systemic gap across nearly
      all hand-rolled buttons. `Card` primitive made keyboard-operable when used interactively
      (mobile Overview/Profile shortcut cards). Div-as-clickable elements in `AdminBookings.tsx`
      (calendar cell) and `TrainerNotificationBell.tsx` (popup toast) given proper keyboard
      semantics. New shared `useFocusTrap` hook wired into `Modal`/`Sheet` primitives and into
      `AdminBookings.tsx`/`BookingCalendar.tsx`'s hand-rolled dialogs. ~15 missing aria-labels
      added across icon-only buttons. Low-contrast informational text bumped in 6 files. Deleted
      confirmed-dead `Booking.tsx`. 56 test files / 195 tests pass, build clean (unchanged 27
      chunks from U7).
- [x] U9 Deployment — COMPLETE (Approved)
  - [x] Infrastructure Design Plan — Approved (go with recommendations)
  - [x] Infrastructure Design artifacts — Approved
  - [x] Code Generation — DONE
    - `Dockerfile.frontend` rewritten as a multi-stage build (Vite build → Caddy runtime, replacing
      the dev-server-in-production setup). New `Caddyfile` (SPA serving + reverse proxy to backend
      + automatic Let's Encrypt TLS). `docker-compose.yml` updated: frontend on 80/443 with
      persistent cert volumes, backend's 8000 no longer exposed to the host (hardening), CORS/DOMAIN
      driven by a new root `.env`/`.env.example`. `DOCKER.md`/`README.md` updated with a production
      deployment runbook. Verified: `docker compose config`, a real `docker build`, `caddy
      validate`, and a live container smoke test (200 on `/` and a deep-linked route). Frontend
      `npm run build` unaffected (27 chunks, no warnings).
- [ ] Build and Test — EXECUTE (after all units)

### OPERATIONS Phase
- [ ] Operations — PLACEHOLDER (deployment handled via Infrastructure Design + Build and Test)

---

## V2 Initiative: Admin UX & Feature Improvements

### INCEPTION Phase (V2)
- [x] Workspace Detection — Resumed 2026-08-02 (brownfield, existing U1–U9 complete)
- [x] Requirements Analysis — Approved 2026-08-02
  - **Artifacts**: inception/requirements/{requirements-v2.md, requirement-verification-questions-v2.md}
  - 11 FRs + 3 NFRs; out-of-scope list documented
- [x] Workflow Planning — Approved 2026-08-02
  - **Artifacts**: inception/plans/execution-plan-v2.md
- [x] Application Design — Approved 2026-08-02
  - **Artifacts**: inception/application-design/{components-v2, component-methods-v2, services-v2, component-dependency-v2, application-design-v2}.md
- [x] Units Generation — Approved 2026-08-02
  - **Artifacts**: inception/application-design/{unit-of-work-v2, unit-of-work-dependency-v2, unit-of-work-story-map-v2}.md
  - 8 units (U10–U17), sequential delivery

### CONSTRUCTION Phase (V2, per-unit loop)
- [x] U10 Density & Polish — COMPLETE (Approved 2026-08-02)
- [x] U11 Admin Today Screen — COMPLETE (Approved 2026-08-02)
- [x] U12 Block Off Slots — COMPLETE (Approved 2026-08-02)
- [x] U13 Batch Pre-Booking — COMPLETE (Approved 2026-08-02)
- [x] U14 PT Member Management — COMPLETE (Approved 2026-08-03)
- [x] U15 Client List & Detail — COMPLETE (Approved 2026-08-03)
- [x] U16 Member Home & InBody Viz — COMPLETE (Approved 2026-08-03)
- [x] U17 Web Push — COMPLETE (Approved 2026-08-03)
- [ ] Build and Test — EXECUTE (after all units)


---

## Bugfixes

### BF-1: Mobile Sidebar Button Overlap
- **Date**: 2026-08-04
- **Component**: `frontend/src/app/components/Navigation.tsx`
- **Issue**: Mobile hamburger menu "Đặt Lịch Ngay" pill button overlapped the "Đăng nhập" link for unauthenticated users — both `<Link>` elements rendered as inline `<a>` tags, making `space-y-4` vertical spacing ineffective.
- **Fix**: Added `block` class to both links in the mobile unauthenticated menu branch. Changed "Đăng nhập" from `flex items-center gap-2` to `block` (no icon child, flex was unnecessary).
- **Tests**: `Navigation.test.tsx` — 3 property-based tests (bug condition + 2 preservation). 57 test files / 199 tests pass, build clean.
- **Spec**: `docs/specs/mobile-sidebar-button-overlap-fix/`

---

## V3 Initiative: Animation & Motion Polish (backfilled 2026-10-30 from audit.md)
- [x] Requirements — `inception/requirements/requirements-v3.md`
- [x] U18 Animation & Motion — COMPLETE (2026-08-03), plan `construction/plans/U18-animation-motion-code-generation-plan.md`

## V4 Initiative: Advanced Animation & Interaction Polish (backfilled 2026-10-30 from audit.md)
- [x] Requirements — `inception/requirements/requirements-v4.md`
- [x] U19 Advanced Animation — COMPLETE (2026-08-03) with deferred steps: spring overlays,
  `layoutId` shared element, drag-to-dismiss. `motion` package is installed.

---

## V5 Initiative: PT Experience Improvements

**Current Stage**: CONSTRUCTION complete (U20–U25 all generated and verified 2026-10-30) —
only the final Build and Test sign-off remains.

### INCEPTION Phase (V5)
- [x] UI/UX review — 2026-10-30, `inception/requirements/pt-ux-review-v5.md` (ui-ux-pro-max;
  UTC "today" item dropped by user)
- [x] Design rules updated — `frontend/rules/DESIGN.md` v1.1.0 (Operations Surfaces, primary_text,
  status language) + `.claude/rules/design-system.md` synced
- [x] Requirements Analysis — Approved 2026-10-30 (assumptions A1–A6 accepted as written)
  - **Artifacts**: `inception/requirements/requirements-v5.md` (13 FRs, 7 NFRs, assumptions A1–A6)
- [x] Application Design — Approved 2026-10-30
  - **Artifacts**: `inception/application-design/application-design-v5.md` (decisions D1–D9)
- [x] Units Generation — Approved 2026-10-30
  - **Artifacts**: `inception/application-design/unit-of-work-v5.md` (U20–U25, sequential)

### CONSTRUCTION Phase (V5, per-unit loop)
- [x] U20 Ops Foundation — COMPLETE (tokens, status meta, normalizeVi, Toast action/useToast/useUndoableAction, ConfirmDialog, useDirtyGuard, validation)
- [x] U21 Safety Net & Data Entry — COMPLETE
- [x] U22 Attendance Tracking — COMPLETE (backend: statuses, transitions, today payload, attendance endpoint, startup `collMod`; frontend: BookingStatusActions, status language in calendar/kiosk/member side)
- [x] U23 Hôm nay Hub — COMPLETE
- [x] U24 Mobile Parity, Day Agenda & Client Filters — COMPLETE
- [x] U25 Ops Visual & Motion Pass — COMPLETE (Part A: calendar/kiosk/batch/block-off/notes/bell push-aware polling; Part B: header menu + a11y, `?expired=1` login banner, primitives focus ring + `ops` prop)
- [ ] Build and Test — final integration run done 2026-10-30: frontend 437/437 tests + build clean; backend 158 pass, 2 known pre-existing date failures; awaiting user sign-off
  - Open follow-ups (non-blocking): move `AdminTodayScreen` to `shared/` (mobile currently imports a desktop path); `BatchBookingMode` full-slot check counts rejected bookings; `stage-bounce` keyframes unused; shared `useInbodyForm` to dedupe the two InBody forms; no TypeScript typecheck exists in the repo (Vite build does not type-check).

# U5 Trainer Desktop — Code Generation Summary

**Unit**: U5 Trainer desktop (TR-1, TR-3, TR-5, TR-6, TR-7 desktop)
**Status**: DONE — all 9 plan steps executed, tests + build pass.

## What was built

### Step 1 — Mobile bridge (temporary, BRIDGE-1/2/3)
- `frontend/src/app/mobile/pages/AdminDashboardPage.tsx` — verbatim copy of the pre-rebuild
  combined component, marked TEMPORARY for U6 replacement.
- `frontend/src/app/mobile/pages/AdminLoginPage.tsx` — verbatim copy, same marker.

### Step 2 — Thin route entries
- `frontend/src/app/pages/AdminDashboardRoute.tsx` — `useDevice()` picks desktop vs mobile.
- `frontend/src/app/pages/AdminLoginRoute.tsx` — same pattern.

### Step 3 — Desktop master-detail components (all under `app/desktop/components/`, each with
a colocated `.test.tsx`)
- `DetailField.tsx` — extracted detail row (icon + label + value).
- `SidebarRow.tsx` — extracted customer list row, `data-testid="sidebar-row-{id}"`.
- `CustomerSidebar.tsx` — search input + scrollable `SidebarRow` list + footer count, always
  visible (DL-1, no `hidden md:flex`/`isMobile` branching).
- `AddInbodyModal.tsx` — rebuilt on the shared `Modal` primitive (MODAL-1); same fields/validation
  as the original hand-rolled overlay.
- `InbodySection.tsx` — chart (`StackedInbodyChart`, reused) + "Thêm kết quả" button opening the
  new `AddInbodyModal`.
- `CustomerDetail.tsx` — hero + `DetailField` rows + `InbodySection`; no `onBack` prop (desktop
  always shows both panes).
- `DesktopAdminHeader.tsx` — view toggle, live clock, customer-count pill, refresh, notification
  bell, logout.

### Step 4 — Desktop dashboard page
- `frontend/src/app/desktop/pages/AdminDashboardPage.tsx` — composes the Step 3 components +
  reuses `AdminBookings` (bookings view) unchanged (DL-3).

### Step 5 — Desktop admin login page
- `frontend/src/app/desktop/pages/AdminLoginPage.tsx` — rebuilt on `useAdminAuth()` (U2, AUTH-1);
  same visual structure (centered card, grid background) as the original.

### Step 6 — Route wiring
- `frontend/src/app/App.tsx` — `/admin` and `/admin/dashboard` now point to `AdminLoginRoute` /
  `AdminDashboardRoute` instead of importing the page components directly. `AdminGuard` still wraps
  `/admin/dashboard` exactly as before.

### Step 7 — Superseded file deletion
- Deleted `frontend/src/app/pages/AdminDashboardPage.tsx` and `AdminLoginPage.tsx` (confirmed no
  remaining imports before deletion).

### Step 8 — Tests
- `AdminDashboardRoute.test.tsx`, `AdminLoginRoute.test.tsx` — device-based selection, using the
  mock-page-module pattern from U3's `DashboardRoute.test.tsx` to avoid the redirect-on-render loop.
- Colocated tests for all 7 new desktop components (`DetailField`, `SidebarRow`,
  `CustomerSidebar`, `AddInbodyModal`, `InbodySection`, `CustomerDetail`, `DesktopAdminHeader`).
- `desktop/pages/AdminLoginPage.test.tsx` — validation, `useAdminAuth().login()` call + navigate on
  success, error display on failure (mocks `useAdminAuth`).

### Step 9 — Verification
- `npm run test`: 46 test files, 163 tests, all passing.
- `npm run build`: 2478 modules, clean build (pre-existing >500kB main-chunk warning, unrelated to
  this unit — not introduced by U5). `dist/` cleaned up after verification.

## Deviations from the functional design
None. All business rules (DL-1..4, AUTH-1, CLEAN-1, BRIDGE-1..3, MODAL-1, EXT-1, PARITY-1) were
followed as specified. Functional parity with the pre-rebuild combined component was preserved:
customer search, InBody add/view, booking-status/assign flows (via reused `AdminBookings`),
notification click-through, and logout all work identically.

## Files reused unchanged
`AdminBookings.tsx`, `InbodyCharts.tsx` (`StackedInbodyChart`), `TrainerNotificationBell.tsx`,
`LiveClock.tsx`, `lib/api/admin.ts`, `lib/adminAuth.ts`, `app/shared/hooks/useAdminAuth.ts` (U2).

## Not touched
Trainee-side files (U3/U4 already complete). `app/mobile/pages/AdminDashboardPage.tsx` /
`AdminLoginPage.tsx` remain the temporary bridge, scheduled for wholesale replacement in U6.

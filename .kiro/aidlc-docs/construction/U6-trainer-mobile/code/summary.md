# U6 Trainer Mobile — Code Generation Summary

**Unit**: U6 Trainer mobile (TR-2, TR-4, TR-5, TR-6 mobile)
**Status**: DONE — all 9 plan steps executed, tests + build pass.

## What was built

### Step 1 — Mobile shell: bottom tab bar
- `frontend/src/app/mobile/shell/AdminBottomTabBar.tsx` (+ `.test.tsx`) — 2 tabs (Hội viên / Lịch
  đặt), sibling of U4's `BottomTabBar` (SHELL-1).

### Step 2 — Mobile InBody components (Sheet-based)
- `frontend/src/app/mobile/components/AddInbodySheet.tsx` (+ `.test.tsx`) — rebuilt on the shared
  `Sheet` primitive (INBODY-ADMIN-1); same fields/validation as the desktop `AddInbodyModal`.
- `frontend/src/app/mobile/components/InbodySectionMobile.tsx` (+ `.test.tsx`) — chart (reused
  `StackedInbodyChart`) + "Thêm" button opening `AddInbodySheet`.

### Step 3 — Mobile screens
- `frontend/src/app/mobile/screens/CustomerListScreen.tsx` (+ `.test.tsx`) — root of the "Hội
  viên" tab: search + list + header actions (refresh, `TrainerNotificationBell` reused as-is,
  logout).
- `frontend/src/app/mobile/screens/CustomerDetailScreen.tsx` (+ `.test.tsx`) — pushed screen: hero
  + detail rows + `InbodySectionMobile`, with its own local `DetailFieldMobile` (mobile-tree-only,
  no cross-import from `desktop/components/DetailField.tsx`, per the isolation rule).

### Step 4 — Mobile admin dashboard page (bridge replaced)
- `frontend/src/app/mobile/pages/AdminDashboardPage.tsx` — rewritten wholesale. Composes
  `AdminBottomTabBar` + a `useStack()` (U4, reused) for the "clients" tab (root list ↔ detail) +
  reused `AdminBookings` for the "bookings" tab (SHELL-2/SHELL-3, BOOK-ADMIN-1). Notification
  click-through routes to the correct tab and resets the clients stack.

### Step 5 — Mobile admin login page (bridge replaced)
- `frontend/src/app/mobile/pages/AdminLoginPage.tsx` — rewritten wholesale, full-bleed layout,
  rewired to `useAdminAuth()` (U2), mirroring U4's `LoginPage.tsx` mobile treatment (RETIRE-1).

### Step 6 — Route wiring
- No changes needed — `AdminDashboardRoute.tsx`/`AdminLoginRoute.tsx` (from U5) already import
  from `../mobile/pages/*`; confirmed both still resolve correctly against the new implementations.

### Step 7 — Bridge retirement
- The U5 TEMPORARY bridge comment headers are gone — both mobile page files now contain the real
  implementation. No old files needed deletion (this unit rewrites the bridge files in place).

### Step 8 — Tests
- Colocated tests for all 6 new files (`AdminBottomTabBar`, `AddInbodySheet`, `InbodySectionMobile`,
  `CustomerListScreen`, `CustomerDetailScreen`) plus `AdminDashboardPage.test.tsx` (mobile) and
  `AdminLoginPage.test.tsx` (mobile).

### Step 9 — Verification
- `npm run test`: 53 test files, 187 tests, all passing.
- `npm run build`: 2482 modules, clean build (pre-existing >500kB main-chunk warning, unrelated to
  this unit). `dist/` cleaned up after verification.

## Deviations from the functional design
None. All business rules (SHELL-1..3, BOOK-ADMIN-1, INBODY-ADMIN-1, DETAIL-1, NOTIF-1, RETIRE-1,
PARITY-1) were followed as specified. Functional parity with the bridge/original combined
component was preserved: customer search, InBody add/view, booking-status/assign flows (via reused
`AdminBookings`), notification click-through, and logout all work identically.

## Files reused unchanged
`AdminBookings.tsx`, `InbodyCharts.tsx` (`StackedInbodyChart`), `TrainerNotificationBell.tsx`,
`lib/api/admin.ts`, `lib/adminAuth.ts`, `app/shared/hooks/useAdminAuth.ts` (U2), `app/mobile/shell/
useStack.ts` and `StackHeader.tsx` (U4), `app/shared/primitives/Sheet.tsx` (U1).

## Not touched
Trainee-side files (U3/U4) and the trainer desktop tree (U5) are untouched.

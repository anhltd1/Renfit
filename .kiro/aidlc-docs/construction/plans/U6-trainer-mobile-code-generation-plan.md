# U6 Trainer Mobile — Code Generation Plan

**Unit**: U6 Trainer mobile (TR-2, TR-4, TR-5, TR-6 mobile)
**Dependencies**: U1 (device layer, primitives — `Sheet`), U2 (shared hooks, `useAdminAuth`,
`useCustomers`, `useInbodyHistory`, `useAddInbody`), U4 (mobile shell primitives — `useStack`,
`StackHeader`), U5 (route entries already device-split, desktop tree, `AdminBookings` reuse
precedent)
**Application code location**: `frontend/src/app/mobile/*`
**Documentation location**: `.kiro/aidlc-docs/construction/U6-trainer-mobile/code/`

Brownfield: the temporary mobile bridge files are replaced wholesale, not duplicated.

---

## Step 1: Mobile shell — bottom tab bar
- [ ] Create `frontend/src/app/mobile/shell/AdminBottomTabBar.tsx` (+ `.test.tsx`) — 2 tabs
      (Hội viên / Lịch đặt), sibling of U4's `BottomTabBar` (SHELL-1)

## Step 2: Mobile components (InBody sheet)
- [ ] Create `frontend/src/app/mobile/components/AddInbodySheet.tsx` (+ `.test.tsx`) — rebuilt on
      shared `Sheet` primitive (INBODY-ADMIN-1)
- [ ] Create `frontend/src/app/mobile/components/InbodySectionMobile.tsx` (+ `.test.tsx`)

## Step 3: Mobile screens
- [ ] Create `frontend/src/app/mobile/screens/CustomerListScreen.tsx` (+ `.test.tsx`) — search +
      list + header actions (notification bell, logout, refresh)
- [ ] Create `frontend/src/app/mobile/screens/CustomerDetailScreen.tsx` (+ `.test.tsx`) — pushed
      screen: hero + detail rows + `InbodySectionMobile`

## Step 4: Mobile admin dashboard page (replaces bridge)
- [ ] Rewrite `frontend/src/app/mobile/pages/AdminDashboardPage.tsx` — composes
      `AdminBottomTabBar` + per-tab `useStack()` + `CustomerListScreen`/`CustomerDetailScreen` for
      the "clients" tab, reused `AdminBookings` for the "bookings" tab (SHELL-2/SHELL-3,
      BOOK-ADMIN-1)

## Step 5: Mobile admin login page (replaces bridge)
- [ ] Rewrite `frontend/src/app/mobile/pages/AdminLoginPage.tsx` — full-bleed layout, rewired to
      `useAdminAuth()` (RETIRE-1)

## Step 6: Route wiring
- [ ] No changes needed — `AdminDashboardRoute.tsx`/`AdminLoginRoute.tsx` (U5) already import from
      `../mobile/pages/*`; confirm they still resolve correctly after the rewrite

## Step 7: Cleanup
- [ ] Remove the TEMPORARY bridge comment headers now that the files contain the real
      implementation (no separate old files to delete — this unit rewrites the bridge files
      in place)

## Step 8: Tests
- [ ] Colocated per-component/screen tests (Step 1-3 above)
- [ ] `mobile/pages/AdminDashboardPage.test.tsx` — smoke test, two-tab shell renders
- [ ] `mobile/pages/AdminLoginPage.test.tsx` — mirrors U5's desktop version (mock `useAdminAuth()`)

## Step 9: Documentation summary
- [ ] Create `.kiro/aidlc-docs/construction/U6-trainer-mobile/code/summary.md`

---

## Story Traceability
| Step | Story |
|---|---|
| 1, 4 | TR-2 |
| 2, 3, 4 | TR-5 (InBody mobile) |
| 4 (AdminBookings reused) | TR-4 |
| 4 (TrainerNotificationBell reused) | TR-6 |
| 5 | TR-2 (auth continuity) |
| 6, 7 | (route/bridge retirement) |
| 8, 9 | (verification/docs) |

## Notes
- `AdminBookings.tsx`, `InbodyCharts.tsx`, `TrainerNotificationBell.tsx` are imported unchanged —
  no modifications to these files in U6.
- Trainee-side and trainer-desktop files are untouched (U3/U4/U5 already complete).
- Run `npm run test` + `npm run build` at the end (NFR-8).

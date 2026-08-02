# U5 Trainer Desktop — Code Generation Plan

**Unit**: U5 Trainer desktop (TR-1, TR-3, TR-5, TR-6, TR-7 desktop)
**Dependencies**: U1 (device layer, primitives), U2 (shared hooks, esp. `useAdminAuth`)
**Application code location**: `frontend/src/app/{desktop,mobile,pages}/*`
**Documentation location**: `.kiro/aidlc-docs/construction/U5-trainer-desktop/code/`

Brownfield: existing files are moved/adapted, not duplicated.

---

## Step 1: Mobile bridge (do first — protects trainer-mobile users before anything else changes)
- [ ] Create `frontend/src/app/mobile/pages/AdminDashboardPage.tsx` — verbatim copy of current
      `AdminDashboardPage.tsx` + existing inline data logic, marked TEMPORARY (superseded by U6)
- [ ] Create `frontend/src/app/mobile/pages/AdminLoginPage.tsx` — verbatim copy of current
      `AdminLoginPage.tsx`, same TEMPORARY marker

## Step 2: Thin route entries
- [ ] Create `frontend/src/app/pages/AdminDashboardRoute.tsx` — `useDevice()` picks
      `desktop/pages/AdminDashboardPage` vs `mobile/pages/AdminDashboardPage`
- [ ] Create `frontend/src/app/pages/AdminLoginRoute.tsx` — same pattern for admin login

## Step 3: Desktop master-detail components
- [ ] Create `frontend/src/app/desktop/components/DetailField.tsx` (+ `.test.tsx`)
- [ ] Create `frontend/src/app/desktop/components/SidebarRow.tsx` (+ `.test.tsx`)
- [ ] Create `frontend/src/app/desktop/components/CustomerSidebar.tsx` (+ `.test.tsx`)
- [ ] Create `frontend/src/app/desktop/components/AddInbodyModal.tsx` (+ `.test.tsx`) — rebuilt on
      shared `Modal` primitive (MODAL-1)
- [ ] Create `frontend/src/app/desktop/components/InbodySection.tsx` (+ `.test.tsx`)
- [ ] Create `frontend/src/app/desktop/components/CustomerDetail.tsx` (+ `.test.tsx`)
- [ ] Create `frontend/src/app/desktop/components/DesktopAdminHeader.tsx` (+ `.test.tsx`)

## Step 4: Desktop dashboard page
- [ ] Create `frontend/src/app/desktop/pages/AdminDashboardPage.tsx` — composes Step 3 components +
      reused `AdminBookings`, `TrainerNotificationBell`, `LiveClock`

## Step 5: Desktop admin login page
- [ ] Create `frontend/src/app/desktop/pages/AdminLoginPage.tsx` — rebuilt using `useAdminAuth()`,
      same visual structure as current

## Step 6: Wire routes in App.tsx
- [ ] Modify `frontend/src/app/App.tsx` — `/admin/dashboard`, `/admin` routes point to the new
      `*Route.tsx` entries instead of the old page components directly

## Step 7: Delete superseded files
- [ ] Delete `frontend/src/app/pages/AdminDashboardPage.tsx` (superseded by desktop/mobile split)
- [ ] Delete `frontend/src/app/pages/AdminLoginPage.tsx` (superseded)

## Step 8: Tests
- [ ] `AdminDashboardRoute.test.tsx`, `AdminLoginRoute.test.tsx` — `forceDevice` assertions
      (mock desktop/mobile page modules per the U3 pattern to avoid the redirect-on-render loop)
- [ ] Covered per-component above (colocated `.test.tsx`)
- [ ] `desktop/pages/AdminLoginPage.test.tsx` — form submit calls `useAdminAuth()`'s `login`

## Step 9: Documentation summary
- [ ] Create `.kiro/aidlc-docs/construction/U5-trainer-desktop/code/summary.md`

---

## Story Traceability
| Step | Story |
|---|---|
| 1 | BRIDGE (supports TR-2/4/5/6/7 mobile continuity until U6) |
| 2, 4 | TR-1 |
| 3, 4 | TR-1, TR-5 (InBody), TR-6 (notif bell reuse) |
| 4 (AdminBookings reused) | TR-3 |
| 5, 6 | TR-7 |
| 7 | (supersession cleanup) |
| 8, 9 | (verification/docs) |

## Notes
- `AdminBookings.tsx`, `InbodyCharts.tsx`, `TrainerNotificationBell.tsx`, `LiveClock.tsx` are
  imported unchanged — no modifications to these files in U5.
- Trainee-side files are untouched (U3/U4 already complete).
- Run `npm run test` + `npm run build` at the end (NFR-8).

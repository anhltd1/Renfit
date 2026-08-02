# U3 Trainee Desktop — Code Generation Plan

**Unit**: U3 Trainee desktop (TS-2, TS-4, TS-6, TS-8, TS-10 desktop)
**Dependencies**: U1 (device layer, primitives), U2 (shared hooks)
**Application code location**: `frontend/src/app/{desktop,mobile,pages}/*`
**Documentation location**: `.kiro/aidlc-docs/construction/U3-trainee-desktop/code/`

Brownfield: existing files are moved/adapted, not duplicated. Delete-before-replace where a file's
successor supersedes it.

---

## Step 1: Mobile bridge (do first — protects mobile users before anything else changes)
- [ ] Create `frontend/src/app/mobile/pages/UserDashboardPage.tsx` — verbatim copy of current
      `UserDashboardPage.tsx`'s mobile JSX + existing inline data logic + a top comment marking it
      TEMPORARY (superseded wholesale by U4)
- [ ] Create `frontend/src/app/mobile/pages/LoginPage.tsx` — verbatim copy of current `LoginPage.tsx`,
      same TEMPORARY marker
- [ ] Create `frontend/src/app/mobile/pages/SignupPage.tsx` — verbatim copy of current `SignupPage.tsx`,
      same TEMPORARY marker

## Step 2: Thin route entries
- [ ] Create `frontend/src/app/pages/DashboardRoute.tsx` — `useDevice()` picks
      `desktop/pages/UserDashboardPage` vs `mobile/pages/UserDashboardPage`
- [ ] Create `frontend/src/app/pages/LoginRoute.tsx` — same pattern for Login
- [ ] Create `frontend/src/app/pages/SignupRoute.tsx` — same pattern for Signup

## Step 3: Desktop dashboard components
- [ ] Create `frontend/src/app/desktop/components/DesktopSidebar.tsx`
- [ ] Create `frontend/src/app/desktop/components/DesktopHeader.tsx`
- [ ] Create `frontend/src/app/desktop/components/OverviewTab.tsx` (uses `useProfile`,
      `useInbodyHistory`)
- [ ] Create `frontend/src/app/desktop/components/BookingTab.tsx` (thin wrapper, per DL-3)

## Step 4: Desktop dashboard page
- [ ] Create `frontend/src/app/desktop/pages/UserDashboardPage.tsx` — composes Step 3 components +
      reused `ChatPanel`, `OnboardingTour`, `NotificationBell`

## Step 5: Desktop auth pages
- [ ] Create `frontend/src/app/desktop/pages/LoginPage.tsx` — rebuilt using `useAuth()`, same visual
      structure as current
- [ ] Create `frontend/src/app/desktop/pages/SignupPage.tsx` — rebuilt using `useAuth()`, same
      visual structure as current

## Step 6: Wire routes in App.tsx
- [ ] Modify `frontend/src/app/App.tsx` — `/dashboard`, `/login`, `/signup` routes point to the new
      `*Route.tsx` entries instead of the old page components directly

## Step 7: Delete superseded files
- [ ] Delete `frontend/src/app/pages/UserDashboardPage.tsx` (superseded by desktop/mobile split)
- [ ] Delete `frontend/src/app/pages/LoginPage.tsx` (superseded)
- [ ] Delete `frontend/src/app/pages/SignupPage.tsx` (superseded)

## Step 8: Delete confirmed-dead unrouted pages (CLEAN-1)
- [ ] Verify no remaining imports of each, then delete:
  - `frontend/src/app/pages/DashboardPage.tsx`
  - `frontend/src/app/pages/ProfilePage.tsx`
  - `frontend/src/app/pages/BookingPage.tsx`
  - `frontend/src/app/pages/AIChatPage.tsx`

## Step 9: Tests
- [ ] `DashboardRoute.test.tsx`, `LoginRoute.test.tsx`, `SignupRoute.test.tsx` — `forceDevice`
      assertions
- [ ] `DesktopSidebar.test.tsx`, `DesktopHeader.test.tsx`, `OverviewTab.test.tsx` — render +
      interaction, mocked U2 hooks
- [ ] `desktop/pages/LoginPage.test.tsx`, `SignupPage.test.tsx` — form submit calls `useAuth()`'s
      `login`/`signup`

## Step 10: Documentation summary
- [ ] Create `.kiro/aidlc-docs/construction/U3-trainee-desktop/code/summary.md`

---

## Story Traceability
| Step | Story |
|---|---|
| 1 | BRIDGE (supports TS-1/TS-3/TS-5/TS-7/TS-9 continuity until U4) |
| 2, 4 | TS-2 |
| 3, 4 | TS-2, TS-4 (BookingTab), TS-6 (chat reused), TS-8 (OverviewTab) |
| 5, 6 | TS-10 |
| 7 | (supersession cleanup) |
| 8 | (dead-code cleanup, CLEAN-1) |
| 9, 10 | (verification/docs) |

## Notes
- `BookingCalendar.tsx`, `ChatPanel.tsx`, `InbodyCharts.tsx`, `NotificationBell.tsx`,
  `OnboardingTour.tsx`, `AvatarUpload.tsx`, `LiveClock.tsx` are imported unchanged — no
  modifications to these files in U3.
- `AdminLoginPage.tsx` and everything admin-side is untouched (U5/U6).
- Run `npm run test` + `npm run build` at the end (NFR-8).

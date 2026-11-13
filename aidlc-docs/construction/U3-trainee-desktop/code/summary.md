# U3 Trainee Desktop — Code Generation Summary

**Stories implemented**: TS-2 (desktop dashboard shell), TS-4 (desktop booking, reused as-is),
TS-6 (desktop chat, reused as-is), TS-8 (desktop profile/InBody), TS-10 (desktop auth).
**Bridge**: temporary mobile continuity for TS-1/3/5/7/9 until U4.
**Verification**: `npm run test` → 74 passed (20 test files, incl. U1/U2's 72); `npm run build` →
success (2448 modules, no errors; known chunk-size warning tracked under U7).

## Files Created

### Mobile bridge (temporary — verbatim copies, marked for U4 replacement)
- `frontend/src/app/mobile/pages/UserDashboardPage.tsx`
- `frontend/src/app/mobile/pages/LoginPage.tsx`
- `frontend/src/app/mobile/pages/SignupPage.tsx`

### Route entries (thin, device-split)
- `frontend/src/app/pages/DashboardRoute.tsx` (+ `.test.tsx`)
- `frontend/src/app/pages/LoginRoute.tsx` (+ `.test.tsx`)
- `frontend/src/app/pages/SignupRoute.tsx` (+ `.test.tsx`)

### Desktop tree
- `frontend/src/app/desktop/components/DesktopSidebar.tsx` (+ `.test.tsx`)
- `frontend/src/app/desktop/components/DesktopHeader.tsx` (+ `.test.tsx`)
- `frontend/src/app/desktop/components/OverviewTab.tsx` (+ `.test.tsx`) — uses `useProfile()`,
  `useInbodyHistory()`
- `frontend/src/app/desktop/components/BookingTab.tsx` — thin wrapper around existing
  `BookingCalendar` (per DL-3, no rewiring/no double-poll)
- `frontend/src/app/desktop/pages/UserDashboardPage.tsx` — composes the above + reused
  `ChatPanel`/`OnboardingTour`
- `frontend/src/app/desktop/pages/LoginPage.tsx` (+ `.test.tsx`) — uses `useAuth()`
- `frontend/src/app/desktop/pages/SignupPage.tsx` (+ `.test.tsx`) — uses `useAuth()`

## Files Modified
- `frontend/src/app/App.tsx` — `/dashboard`, `/login`, `/signup` routes now point to
  `DashboardRoute`/`LoginRoute`/`SignupRoute` instead of importing page components directly.

## Files Deleted
- `frontend/src/app/pages/UserDashboardPage.tsx` — superseded by desktop/mobile split.
- `frontend/src/app/pages/LoginPage.tsx` — superseded.
- `frontend/src/app/pages/SignupPage.tsx` — superseded.
- `frontend/src/app/pages/DashboardPage.tsx` — confirmed unrouted dead code (CLEAN-1).
- `frontend/src/app/pages/ProfilePage.tsx` — confirmed unrouted dead code.
- `frontend/src/app/pages/BookingPage.tsx` — confirmed unrouted dead code.
- `frontend/src/app/pages/AIChatPage.tsx` — confirmed unrouted dead code.

## Not Modified (reused as-is)
`BookingCalendar.tsx`, `ChatPanel.tsx` (+ its children), `InbodyCharts.tsx`, `NotificationBell.tsx`,
`OnboardingTour.tsx`, `AvatarUpload.tsx`, `LiveClock.tsx`, `Link.tsx`, `figma/ImageWithFallback.tsx`.
Trainer-side (`AdminLoginPage.tsx`, `AdminDashboardPage.tsx`, `AdminBookings.tsx`,
`TrainerNotificationBell.tsx`) untouched — out of scope, U5/U6.

## Deviations from plan
- Fixed an unrelated global test-env gap discovered during verification: added a default
  `window.matchMedia` stub to `src/test/setup.ts` (jsdom doesn't implement it, and the legacy
  `useIsMobile` hook used by the mobile bridge calls it directly). Not itemized in the original
  plan but required for the mobile bridge's tests to run at all.
- `DashboardRoute.test.tsx` mocks the desktop/mobile page modules rather than mounting the full
  pages, to avoid an infinite `navigate()` loop that occurs when a page's early-redirect-on-render
  runs outside a matching `<Routes>` tree in a test harness (harmless in the real app, where the
  route unmounts once the location changes).

## Notes for downstream units
- U4 (Trainee mobile) should delete `app/mobile/pages/*` wholesale and replace with real native-
  like screens — do not incrementally patch the bridge files.
- `NotificationBell.tsx` and `BookingCalendar.tsx` were intentionally left on their own internal
  data-fetching (not rewired to U2 hooks) — a future unit could rewire them if desired, but it
  wasn't required for TS-2/TS-4's acceptance criteria.

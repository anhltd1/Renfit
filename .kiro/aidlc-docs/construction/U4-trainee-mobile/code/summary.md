# U4 Trainee Mobile — Code Generation Summary

**Stories implemented**: TS-1 (mobile shell/nav), TS-3 (mobile booking), TS-5 (mobile chat),
TS-7 (mobile progress/profile), TS-9 mobile half (onboarding + notifications), TS-10 mobile (auth).
**Verification**: `npm run test` → 131 passed (36 test files, incl. U1–U3's 74); `npm run build` →
success (2465 modules, no errors; known chunk-size warning tracked under U7).

## Files Created

### Shell
- `frontend/src/app/mobile/shell/useStack.ts` (+ `.test.ts`, incl. fast-check invariants)
- `frontend/src/app/mobile/shell/BottomTabBar.tsx` (+ `.test.tsx`)
- `frontend/src/app/mobile/shell/StackHeader.tsx` (+ `.test.tsx`)
- `frontend/src/app/mobile/shell/MobileShell.tsx` (+ `.test.tsx`)

### Components
- `frontend/src/app/mobile/components/DayScroller.tsx` (+ `.test.tsx`)
- `frontend/src/app/mobile/components/InbodyStatCard.tsx` (+ `.test.tsx`)

### Screens
- `frontend/src/app/mobile/screens/OverviewScreen.tsx` (+ `.test.tsx`)
- `frontend/src/app/mobile/screens/ProfileTabRoot.tsx` (+ `.test.tsx`) — includes the logout action
  (added during generation; the functional design didn't explicitly place logout, and leaving it
  unwired would have broken PARITY-1)
- `frontend/src/app/mobile/screens/ProfileScreen.tsx` (+ `.test.tsx`)
- `frontend/src/app/mobile/screens/ProgressScreen.tsx` (+ `.test.tsx`)
- `frontend/src/app/mobile/screens/BookingScreen.tsx` (+ `.test.tsx`)
- `frontend/src/app/mobile/screens/CoachScreen.tsx` (+ `.test.tsx`)

### Pages (replace the U3 temporary bridge, same paths)
- `frontend/src/app/mobile/pages/UserDashboardPage.tsx` (+ `.test.tsx`) — thin wrapper over `MobileShell`
- `frontend/src/app/mobile/pages/LoginPage.tsx` (+ `.test.tsx`) — full-bleed, `useAuth()`
- `frontend/src/app/mobile/pages/SignupPage.tsx` (+ `.test.tsx`) — full-bleed, `useAuth()`

## Files Modified
- `frontend/src/app/components/OnboardingTour.tsx` — generalized to accept optional `steps`/typed
  `onTabChange`, defaulting to the original desktop `DESKTOP_STEPS`/`OnboardingTab`. Desktop call
  site (`app/desktop/pages/UserDashboardPage.tsx`) required no changes.
- `frontend/src/app/components/OnboardingTour.test.tsx` — new (component had none before);
  regression-guards the default desktop behavior + verifies the generalization.
- `frontend/src/test/setup.ts` — added `ResizeObserver` and `Element.scrollTo`/`scrollIntoView`
  no-op stubs (jsdom gaps surfaced by `recharts` in `ProgressScreen` and `ChatPanel`'s auto-scroll).

## Not Modified (reused as-is)
`ChatPanel.tsx` (+ children), all U1 primitives, all U2 hooks, `NotificationBell.tsx`,
`AvatarUpload.tsx`.

## Deviations from plan
- Added a logout action inside `ProfileTabRoot` (not explicitly specified in the functional design)
  — required to satisfy PARITY-1 (desktop's sidebar logout must have a mobile equivalent); flagged
  and fixed during generation rather than shipping a dead-end mobile shell.
- Fixed two jsdom test-environment gaps discovered during verification (`ResizeObserver`,
  `Element.scrollTo`/`scrollIntoView`) — not itemized in the plan but required for
  `ProgressScreen`'s chart and `CoachScreen`'s `ChatPanel` reuse to render in tests at all.
- `MobileShell.test.tsx` uses `vi.clearAllMocks()` instead of `vi.restoreAllMocks()` in its
  `afterEach` — the latter would wipe the top-level `vi.mock()` factory return values (a subtlety
  worth flagging for future test authors using module-level mocks in this codebase).

## Notes for downstream units
- U3's temporary bridge is now fully retired — no file in `app/mobile/pages/` still contains the
  old inline desktop-in-mobile-clothes markup.
- The mobile tree only imports from `app/shared/*` and reuses `ChatPanel`/`NotificationBell`/
  `AvatarUpload` from `app/components/*` — no import from `app/desktop/*`, preserving the
  cycle-prevention rule from Application Design.

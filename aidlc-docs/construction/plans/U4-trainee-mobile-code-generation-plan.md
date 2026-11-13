# U4 Trainee Mobile — Code Generation Plan

**Unit**: U4 Trainee mobile (TS-1, TS-3, TS-5, TS-7, TS-9, TS-10 mobile)
**Dependencies**: U1 (device layer, primitives), U2 (shared hooks), U3 (temporary bridge being replaced)
**Application code location**: `frontend/src/app/mobile/*`, `frontend/src/app/components/OnboardingTour.tsx` (generalized)
**Documentation location**: `aidlc-docs/construction/U4-trainee-mobile/code/`

The temporary bridge files from U3 are DELETED and REPLACED in this unit — not incrementally patched.

---

## Step 1: Shell primitives
- [ ] Create `frontend/src/app/mobile/shell/useStack.ts` (+ `.test.ts` incl. fast-check invariants)
- [ ] Create `frontend/src/app/mobile/shell/BottomTabBar.tsx` (+ `.test.tsx`)
- [ ] Create `frontend/src/app/mobile/shell/StackHeader.tsx` (+ `.test.tsx`)

## Step 2: Generalize OnboardingTour (shared component)
- [ ] Modify `frontend/src/app/components/OnboardingTour.tsx` — add optional `steps` prop
      (default = current desktop `STEPS`) and generalize `onTabChange`'s tab-key type; verify
      desktop call site (`app/desktop/pages/UserDashboardPage.tsx`) needs no changes
- [ ] Create `frontend/src/app/components/OnboardingTour.test.tsx` (new — regression guard for
      default desktop behavior)

## Step 3: Mobile components
- [ ] Create `frontend/src/app/mobile/components/DayScroller.tsx` (+ `.test.tsx`)
- [ ] Create `frontend/src/app/mobile/components/InbodyStatCard.tsx` (+ `.test.tsx`)

## Step 4: Mobile screens
- [ ] Create `frontend/src/app/mobile/screens/OverviewScreen.tsx` (+ `.test.tsx`)
- [ ] Create `frontend/src/app/mobile/screens/ProfileTabRoot.tsx` (+ `.test.tsx`)
- [ ] Create `frontend/src/app/mobile/screens/ProfileScreen.tsx` (+ `.test.tsx`) — uses `useProfile()`
- [ ] Create `frontend/src/app/mobile/screens/ProgressScreen.tsx` (+ `.test.tsx`) — uses `useInbodyHistory()`
- [ ] Create `frontend/src/app/mobile/screens/BookingScreen.tsx` (+ `.test.tsx`) — uses
      `useBookingAvailability`/`useCreateBooking`/`useCancelBooking`
- [ ] Create `frontend/src/app/mobile/screens/CoachScreen.tsx` (+ `.test.tsx`) — wraps `ChatPanel`

## Step 5: Mobile shell composition
- [ ] Create `frontend/src/app/mobile/shell/MobileShell.tsx` — composes `BottomTabBar` + per-tab
      `useStack()` + `StackHeader` + active screen; wires the generalized `OnboardingTour` with
      mobile steps/anchors, gated on `isMobile` + `consumeNewAccountFlag()`

## Step 6: New mobile dashboard page (replaces bridge)
- [ ] Create `frontend/src/app/mobile/pages/UserDashboardPage.tsx` — thin wrapper rendering
      `MobileShell`

## Step 7: New mobile auth pages (replace bridge)
- [ ] Create `frontend/src/app/mobile/pages/LoginPage.tsx` — full-bleed layout, `useAuth()`
- [ ] Create `frontend/src/app/mobile/pages/SignupPage.tsx` — full-bleed layout, `useAuth()`

## Step 8: Delete superseded bridge content
- [ ] Overwrite the 3 files from Steps 6–7 in place (same paths as the U3 bridge) — no separate
      delete step needed since the paths are reused; verify the old bridge's inline data logic
      (fetchMyInbody helper, direct API calls) is fully removed, not left dangling unused

## Step 9: Tests
- [ ] Covered per-file above (colocated `.test.tsx`/`.test.ts`)
- [ ] `mobile/pages/UserDashboardPage.test.tsx`, `LoginPage.test.tsx`, `SignupPage.test.tsx`

## Step 10: Documentation summary
- [ ] Create `aidlc-docs/construction/U4-trainee-mobile/code/summary.md`

---

## Story Traceability
| Step | Story |
|---|---|
| 1, 5, 6 | TS-1 |
| 4 (BookingScreen), 3 (DayScroller) | TS-3 |
| 4 (CoachScreen) | TS-5 |
| 4 (ProfileTabRoot/ProfileScreen/ProgressScreen), 3 (InbodyStatCard) | TS-7 |
| 2, 5 (onboarding wiring) | TS-9 (onboarding half) |
| 7 | TS-10 (mobile auth) |

## Notes
- `NotificationBell` is reused as-is inside `OverviewScreen`'s header slot (TS-9's notification
  half is already satisfied by the existing viewport-safe bell from earlier work — no new
  component needed here).
- Run `npm run test` + `npm run build` at the end (NFR-8).

# U3 Trainee Desktop — Business Logic Model

## Route-Entry Device Split (first real use of DeviceProvider for a screen)
```
DashboardRoute (app/pages/DashboardRoute.tsx, replaces direct UserDashboardPage import in App.tsx):
  const { isMobile } = useDevice()
  return isMobile ? <MobileUserDashboardPage/> : <DesktopUserDashboardPage/>
```
Same pattern applies to `/login`, `/signup`. `/admin` and `/admin/dashboard` are untouched (trainer
side is U5/U6).

## Desktop Dashboard Tab Logic (unchanged behavior, relocated + restyled)
- Tabs: `overview` (profile + InBody), `chat` (AI Coach), `bookings` (booking calendar).
- All three tab contents stay mounted (existing `display: none` toggle pattern) so chat history and
  scroll position survive tab switches — this is existing, correct behavior, preserved as-is.
- Onboarding tour: continues to target desktop sidebar `data-tour` anchors; still skipped on mobile
  (mobile onboarding remains a U4 concern, unchanged from the current codebase's own comment).

## Data Wiring Change (rewiring, per U2 hooks)
- Profile form + InBody section → `useProfile()` + `useInbodyHistory(customerId, 'customer')`
  (replaces the local `updateProfile` call + inline `fetchMyInbody`).
- Booking tab → `useBookingAvailability`, `useCreateBooking`, `useCancelBooking` (replaces the
  local `fetchAvailability`/`createBooking`/`cancelBooking` + 5s manual `setInterval`, which
  `useBookingAvailability` does not itself poll — see Business Rules DL-3 for the decision on
  whether to keep polling here).
- Notification bell → `useNotifications(customerId)` (replaces `NotificationBell.tsx`'s internal
  fetch/poll — but `NotificationBell.tsx` itself is not touched in U3; only the *desktop dashboard
  page* is rebuilt. `NotificationBell` stays a drop-in child component for now, still using its own
  internal fetching; rewiring `NotificationBell.tsx` itself to the hook is a nice-to-have, not
  required for TS-2, and is deferred to avoid scope creep beyond the approved plan).
- Auth pages → `useAuth()` (replaces direct `login`/`signup` calls + `setAuthUser`).

## Mobile Bridge Logic (temporary, per Q1=A)
- The current `UserDashboardPage.tsx`'s mobile-only JSX (bottom tab bar, drawer, header mobile
  variant) is extracted verbatim into a new `app/mobile/pages/UserDashboardPage.tsx`, sharing the
  *existing* (pre-U2) inline data logic — no functional change, just a relocation so mobile users
  keep working while U4 hasn't rebuilt it yet. This temporary file is explicitly marked for
  wholesale replacement in U4, not for incremental improvement.

## Testable Properties (PBT-01)
- No new pure transformation logic introduced in U3 — this unit is UI restructuring + rewiring to
  already-tested U2 hooks. `withSundays()` (day-list transform in `BookingCalendar.tsx`, used
  as-is) is a pre-existing pure function; if it's touched while relocating `BookingCalendar.tsx`
  into the desktop tree, it becomes a PBT-03 invariant candidate then (day-count preserved across
  the Sunday-insertion transform) — flagged for whoever executes Step covering that file, not a
  blocking requirement for U3 to pass.

# U2 Shared Data Layer — Business Logic Model

## Hook State Machine
Every data hook follows the same shape already used ad hoc in `BookingCalendar.tsx` /
`AdminBookings.tsx`, now formalized and reused:

```
State: { data: T | null; loading: boolean; error: string | null }

on mount / dep change:
  loading = true; error = null
  call lib/api function
  on success: data = result; loading = false
  on failure: error = err.message; loading = false   # lib/api already normalizes to Vietnamese

refetch(): re-run the same fetch, but do NOT reset `data` to null first (avoids UI flash) —
  mirrors the existing `load(silent=true)` pattern in AdminBookings.tsx.
```

## Silent Background Refresh (polling)
For hooks backing admin bookings and both notification bells (already polling today at 5s/30s/10s
respectively), preserve the exact existing cadence and the "pause while a modal is open" guard
(`AdminBookings.tsx` already does this via `selectedRef` — carry the same guard into the hook so
polling never yanks state out from under an open confirm/assign dialog).

## Mutation / Optimistic Update Pattern
For booking create/cancel and admin status-update/assign — mirror the current components' pattern:
1. Call the mutation (`createBooking`, `cancelBooking`, `updateBookingStatus`, `assignBooking`).
2. On success, either (a) locally patch the cached list (as `ChatArtifactCard`'s
   `BookingAvailabilityArtifact` already does for its own local state) or (b) trigger a silent
   `refetch()` of the underlying list — decision per hook, matching what the call site already does
   today (booking calendars refetch; chat artifact patches locally since it has no shared cache).
3. On failure, surface the normalized Vietnamese error message; do not mutate cached state.

## Auth/session hooks
`useAuth()` / `useAdminAuth()` wrap the existing `lib/auth.ts` / `lib/adminAuth.ts` localStorage
functions in a hook so components get reactive updates (e.g. after `setAuthUser`, consumers
re-render) instead of reading localStorage directly and needing a manual re-render trigger.

## Testable Properties (PBT-01)
- No new pure transformation logic is introduced in U2 beyond what already exists in components
  (e.g. `withSundays()` in `BookingCalendar.tsx`, `parseNotificationTarget`/
  `parseAdminNotificationTarget` in `lib/api/*`). If/when those are relocated into the shared layer
  during U3–U6 migration, they become PBT-02/PBT-03 candidates then (round-trip for target parsing,
  invariant for `withSundays` day-count). Not applicable to U2 itself, which only wraps existing
  `lib/api` calls without adding new pure logic.

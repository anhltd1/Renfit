# U2 Shared Data Layer — Code Generation Summary

**Stories supported**: FR-5 (parity foundation) — no user-facing screen changes in this unit.
**Verification**: `npm run test` → 50 passed (12 test files, incl. U1's 22); `npm run build` →
success (2431 modules, no errors; known chunk-size warning tracked under U7).

## Files Created
- `frontend/src/app/shared/hooks/useQuery.ts` — internal `useQueryState`/`usePolling` primitives
  (not in the barrel; plumbing shared by the read hooks below).
- `frontend/src/app/shared/hooks/useBookingAvailability.ts` (+ `.test.ts`) — trainee booking hooks.
- `frontend/src/app/shared/hooks/useAdminBookings.ts` (+ `.test.ts`) — trainer booking hooks, 5s
  pausable poll (`setPaused`).
- `frontend/src/app/shared/hooks/useInbody.ts` (+ `.test.ts`) — `useInbodyHistory` (customer/admin
  viewer), `useAddInbody`.
- `frontend/src/app/shared/hooks/useProfile.ts` (+ `.test.ts`).
- `frontend/src/app/shared/hooks/useChat.ts` (+ `.test.ts`).
- `frontend/src/app/shared/hooks/useNotifications.ts` (+ `.test.ts`) — customer, 30s poll.
- `frontend/src/app/shared/hooks/useTrainerNotifications.ts` (+ `.test.ts`) — trainer, 10s poll +
  popup queue (mirrors `TrainerNotificationBell.tsx`'s existing seen-ids logic exactly).
- `frontend/src/app/shared/hooks/useAuth.ts` (+ `.test.ts`), `useAdminAuth.ts` (+ `.test.ts`).
- `frontend/src/app/shared/hooks/index.ts` — barrel export.

## Files Modified
- `frontend/src/lib/api/profile.ts` — added `fetchMyInbody`/`InbodyRecordOut` (previously an inline
  `fetchMyInbody` helper duplicated in `UserDashboardPage.tsx`) and a module-level `url()` helper,
  consistent with the other `lib/api/*` modules, so `useInbodyHistory` has a single typed client to
  wrap (per U2's OWN-1 rule: hooks call into `lib/api`, never `fetch` directly).

## Not Modified (by design — deferred to U3–U6)
`BookingCalendar.tsx`, `AdminBookings.tsx`, `NotificationBell.tsx`, `TrainerNotificationBell.tsx`,
`ChatPanel.tsx`, `UserDashboardPage.tsx`'s inline `fetchMyInbody` call site, and all auth
pages/guards still use their original inline data-fetching. They will be rewired to the U2 hooks
as each screen migrates to its desktop/mobile tree in U3–U6 — rewiring now would touch UI code
outside this unit's scope.

## Notes for downstream units
- Import hooks via `@/app/shared/hooks` (barrel) once path aliasing is confirmed, or relative
  paths — both work; the barrel is for convenience.
- `useAdminBookings`'s `setPaused(true)` must be called by whichever component owns a booking
  status/assign modal, mirroring the existing `selectedRef` guard, to satisfy DR-4.
- `useTrainerNotifications` returns `popups`/`dismissPopup` separately from `notifications` —
  the consuming component owns the auto-dismiss timer (5s), matching current behavior; this hook
  only owns "what's new since last poll."

## Deviations from plan
- Added `useQuery.ts` (not itemized in the plan) as shared internal plumbing to avoid duplicating
  the loading/error/refetch state machine across 5 read hooks — same rationale as U1's
  `DeviceContext.ts` addition.
- Modified `lib/api/profile.ts` (not itemized in the plan) to add the missing `fetchMyInbody`
  typed client — required to satisfy OWN-1 without duplicating an untyped inline fetch inside the
  new hook.

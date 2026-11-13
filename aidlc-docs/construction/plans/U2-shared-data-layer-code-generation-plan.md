# U2 Shared Data Layer — Code Generation Plan

**Unit**: U2 Shared data layer
**Stories**: supports FR-5 (parity) — no user-facing screen changes yet
**Dependencies**: U1 (uses none of U1's primitives directly, but follows its no-new-deps decision)
**Application code location**: `frontend/src/app/shared/hooks/`
**Documentation location**: `aidlc-docs/construction/U2-shared-data-layer/code/`

Existing components (`BookingCalendar.tsx`, `AdminBookings.tsx`, etc.) are **not modified** in this
unit — only the new hook files are added. Rewiring happens per-screen in U3–U6.

---

## Step 1: Booking (customer) hooks
- [ ] Create `frontend/src/app/shared/hooks/useBookingAvailability.ts` — `useBookingAvailability`,
      `useCreateBooking`, `useCancelBooking` (wrap `lib/api/bookings.ts`)
- [ ] Create `frontend/src/app/shared/hooks/useBookingAvailability.test.ts`

## Step 2: Admin booking hooks
- [ ] Create `frontend/src/app/shared/hooks/useAdminBookings.ts` — `useAdminBookings` (5s silent
      poll with pausable ref), `useUpdateBookingStatus`, `useAssignBooking`, `useCustomers`
      (wrap `lib/api/admin.ts`)
- [ ] Create `frontend/src/app/shared/hooks/useAdminBookings.test.ts`

## Step 3: InBody hooks
- [ ] Create `frontend/src/app/shared/hooks/useInbody.ts` — `useInbodyHistory` (customer via
      `lib/api/profile.ts`'s inbody endpoint if present, else `lib/api/admin.ts` for admin view —
      confirm at implementation time and unify signature), `useAddInbody`
- [ ] Create `frontend/src/app/shared/hooks/useInbody.test.ts`

## Step 4: Profile hook
- [ ] Create `frontend/src/app/shared/hooks/useProfile.ts` — wraps `lib/api/profile.ts` +
      `lib/auth.ts` (reads current user, exposes `update`)
- [ ] Create `frontend/src/app/shared/hooks/useProfile.test.ts`

## Step 5: Chat hook
- [ ] Create `frontend/src/app/shared/hooks/useChat.ts` — wraps `lib/api/chat.ts::sendChatMessage`
- [ ] Create `frontend/src/app/shared/hooks/useChat.test.ts`

## Step 6: Notification hooks
- [ ] Create `frontend/src/app/shared/hooks/useNotifications.ts` — 30s poll, unread count
      (wrap `lib/api/notifications.ts`)
- [ ] Create `frontend/src/app/shared/hooks/useTrainerNotifications.ts` — 10s poll, unread count,
      popup queue tracking (wrap `lib/api/admin.ts` trainer notification functions)
- [ ] Create `frontend/src/app/shared/hooks/useNotifications.test.ts`
- [ ] Create `frontend/src/app/shared/hooks/useTrainerNotifications.test.ts`

## Step 7: Auth hooks
- [ ] Create `frontend/src/app/shared/hooks/useAuth.ts` — wraps `lib/auth.ts` + `lib/api/auth.ts`
- [ ] Create `frontend/src/app/shared/hooks/useAdminAuth.ts` — wraps `lib/adminAuth.ts` +
      `lib/api/admin.ts::adminLogin`
- [ ] Create `frontend/src/app/shared/hooks/useAuth.test.ts`
- [ ] Create `frontend/src/app/shared/hooks/useAdminAuth.test.ts`

## Step 8: Barrel export
- [ ] Create `frontend/src/app/shared/hooks/index.ts` — re-export all hooks

## Step 9: Documentation summary
- [ ] Create `aidlc-docs/construction/U2-shared-data-layer/code/summary.md`

## Step 10: Story/tracking update
- [ ] Annotate FR-5 progress in `unit-of-work-story-map.md` (hooks exist; rewiring pending in U3–U6)

---

## Story Traceability
All steps support FR-5 (parity) by centralizing data access ahead of the U3–U6 screen migrations.

## Notes
- No changes to `lib/api/*`, `lib/auth.ts`, or `lib/adminAuth.ts` — U2 only adds a wrapping layer.
- No existing component is rewired in this unit (explicitly deferred to U3–U6, per Functional Design).
- Run `npm run test` + `npm run build` at the end, per NFR-8.

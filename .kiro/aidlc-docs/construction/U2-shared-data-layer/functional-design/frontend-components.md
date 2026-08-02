# U2 Shared Data Layer — Frontend Components (Hooks)

## Files to create
```text
frontend/src/app/shared/hooks/
├── useBookingAvailability.ts   (+ useCreateBooking, useCancelBooking in the same file — cohesive booking-customer concern)
├── useAdminBookings.ts         (+ useUpdateBookingStatus, useAssignBooking, useCustomers)
├── useInbody.ts                (+ useAddInbody)
├── useProfile.ts
├── useChat.ts
├── useNotifications.ts
├── useTrainerNotifications.ts
├── useAuth.ts
├── useAdminAuth.ts
└── index.ts                    (barrel export)
```

## Which existing call sites each hook will eventually replace (in U3–U6, not in U2)
| Hook | Current inline logic to replace | File |
|---|---|---|
| `useBookingAvailability` / `useCreateBooking` / `useCancelBooking` | `fetchAvailability`/`createBooking`/`cancelBooking` calls + local state | `BookingCalendar.tsx` |
| `useAdminBookings` / `useUpdateBookingStatus` / `useAssignBooking` / `useCustomers` | `load()`/`fetchBookings`/`fetchCustomers`/mutation calls + 5s poll + `selectedRef` pause guard | `AdminBookings.tsx` |
| `useInbody` / `useAddInbody` | InBody fetch/add logic | `InbodyCharts.tsx` + admin InBody entry UI |
| `useProfile` | profile fetch/update logic | Profile tab in `UserDashboardPage.tsx` |
| `useChat` | `sendChatMessage` call + message list state | `ChatPanel.tsx` |
| `useNotifications` | fetch/unread-count/poll logic | `NotificationBell.tsx` |
| `useTrainerNotifications` | fetch/unread-count/10s poll/popup-queue logic | `TrainerNotificationBell.tsx` |
| `useAuth` / `useAdminAuth` | direct `lib/auth`/`lib/adminAuth` reads | `LoginPage.tsx`, `SignupPage.tsx`, `AdminLoginPage.tsx`, guards |

**U2 itself only creates the hooks** — it does not yet rewire the listed components (that
migration happens per-unit in U3–U6 as each screen is rebuilt, per the approved unit sequence).
This keeps U2 a small, independently testable slice.

## State Management
- Each hook is self-contained (`useState` + `useEffect`/`useCallback`), no global store.
- No new dependency added (React Query/SWR not introduced — see the flagged judgment call).

## API Integration Points
All hooks call directly into existing `frontend/src/lib/api/*` functions — no new endpoints, no
changed request/response shapes.

## Test Plan
- Mock the underlying `lib/api` module per hook test (Vitest `vi.mock`) and assert:
  loading → success transition, loading → error transition (Vietnamese message surfaced as-is),
  `refetch` doesn't null out `data` first, and (for polling hooks) the interval fires and can be
  paused via the exposed pause mechanism.
- Use `@testing-library/react`'s `renderHook` (via `@testing-library/react`) for hook-only tests.

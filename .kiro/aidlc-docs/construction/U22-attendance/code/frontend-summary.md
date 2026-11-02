# U22 Attendance Tracking — Frontend Summary

**Status**: code generated, related Vitest suites green. `npm run build` not run (parallel agents);
note that the repo has no local `typescript` install / `tsconfig.json`, so types are only checked by
editor tooling — run a typecheck at the V5 integration gate if one is added.

## Files
| File | Change |
|---|---|
| `src/lib/api/admin.ts` | `BookingStatus` += `completed`, `no_show`; `TodaySession.id`, `TodaySession.status: BookingStatus`; `TodayData.unmarked_count`; `AttendanceSummary`, `fetchAttendance(customerId)` |
| `src/lib/api/bookings.ts` | member `BookingStatus` += `completed`, `no_show` (`Slot.my_status`) |
| `src/app/shared/booking/BookingStatusActions.tsx` (+ test) | New: `hasSessionStarted`, `getStatusActions`, `BookingStatusActions`, `useBookingStatusChange` |
| `src/app/shared/hooks/useAttendance.ts` (+ test) | New; exported from `hooks/index.ts` |
| `src/app/shared/hooks/useAdminToday.ts` | Doc only — new fields flow through `TodayData` |
| `src/app/components/AdminBookings.tsx` | Shared status visuals, BookingStatusActions dialog, `useToast`, assign search, occupancy |
| `src/app/components/CalendarKiosk.tsx` | Shows completed / no_show, shared visuals, BookingStatusActions (lg), `useToast`, larger text |
| `src/app/components/BookingCalendar.tsx` | Slot cell: completed / no_show → read-only `StatusBadge` |
| `src/app/mobile/screens/BookingScreen.tsx` | Hour row: completed / no_show → read-only row with `StatusBadge` |

## Public API
```ts
// shared/booking/BookingStatusActions.tsx
function hasSessionStarted(time: string, now?: Date /* = new Date() */): boolean;   // wall-clock ISO parsed as ICT (UTC+7); unparseable → false
interface StatusAction { next: BookingStatusKey; label: string }
function getStatusActions(status: string, started: boolean): StatusAction[];
interface BookingStatusActionsBooking { id: string; customer_id: string; time: string; status: BookingStatusKey }
function BookingStatusActions(props: {
  booking: BookingStatusActionsBooking;
  onChange: (next: BookingStatusKey, prev: BookingStatusKey) => Promise<void>;
  busy?: boolean; layout?: 'grid' | 'inline' /* grid */; size?: 'md' | 'lg' /* md */;
  now?: Date; className?: string;
}): JSX.Element | null;   // data-testid="booking-status-actions", buttons "status-action-{next}"
function useBookingStatusChange(o: { show: UseToastResult['show']; refresh: () => unknown }): {
  change(booking: { id: string; customer_id: string }, next: BookingStatusKey, prev: BookingStatusKey): Promise<boolean>;
  pending: boolean;
};
// shared/hooks/useAttendance.ts
function useAttendance(customerId: string | null | undefined): QueryState<AttendanceSummary | null>;
// lib/api/admin.ts
interface AttendanceSummary { customer_id: string; completed: number; no_show: number }
function fetchAttendance(customerId: string): Promise<AttendanceSummary>;
```

## Behaviour
- Actions per status: pending → Duyệt, Từ chối; approved (not started) → Từ chối, Chờ duyệt;
  approved (started) → Đã tập, Vắng, Từ chối; completed → Vắng, Về Đã duyệt; no_show → Đã tập,
  Về Đã duyệt; rejected → Chờ duyệt, Duyệt. Buttons: statusMeta icon + label, `tap-target`,
  `text-sm` (md) / `text-base` (lg), aria-label `"{label}: {member}"`, all disabled while one runs.
- `useBookingStatusChange`: reject / completed / no_show → 5 s "Hoàn tác" back to `prev`
  ("Đã từ chối lịch của X.", "Đã điểm danh X: Đã tập.", "Đã điểm danh X: Vắng."); approve →
  "Đã duyệt lịch của X.", pending → "Đã chuyển lịch của X về Chờ duyệt." (no undo). Backend 400
  `detail` is the error toast text. `refresh` runs after the change and after a successful undo.
  The previous success toast text (backend `message`) is replaced by these fixed texts.
- AdminBookings: pill = icon + name with statusMeta colours (rejected dashed + line-through name),
  `aria-label = bookingAccessibleName(...)` (no `title`), `tap-target`; slot count "n / cap" now
  counts only non-rejected bookings (previously rejected bookings inflated it) and is `white/60`;
  stat pills use statusMeta, Đã tập / Vắng appear when non-zero. Dialog close buttons are
  `tap-target` with "Đóng cập nhật lịch đặt" / "Đóng đặt lịch tập". Assign search matches name or
  phone (diacritic-insensitive), labelled input `data-testid="input-assign-search"`.
- CalendarKiosk: lists every non-rejected booking ordered approved, pending, no_show, completed;
  each card = status icon + name + "· label" (+ note) at `text-base`+; past rows no longer dimmed
  to 40 % opacity (attendance is marked on past rows, text must stay ≥ white/60); hover scale
  removed; count `text-sm white/60`.
- Member: completed / no_show slots render a read-only `StatusBadge` (desktop calendar cell
  `data-testid="slot-attendance-{status}"`; mobile hour row keeps `booking-slot-{hour}` as a div).
  Next-session heroes (MemberHomeDashboard, OverviewScreen) already only pick approved / pending.

## Tests
`npx vitest run src/app/shared src/lib src/app/mobile src/app/components src/app/desktop` →
75 files, 334 tests passed. New: `BookingStatusActions.test.tsx` (11, incl. fast-check ICT
property), `useAttendance.test.ts` (2). No existing tests changed.
Test note: `vi.fn().mockRejectedValue` on a mocked API module surfaced as an unhandled rejection
under Vitest 2.1 here; the new tests mock the API with a plain delegating function instead.

## Notes for U23 (Hôm nay hub)
- Session rows: `<BookingStatusActions layout="inline" booking={{ id: s.id, customer_id: s.customer_id, time: s.time, status: s.status }} onChange={(n, p) => change(s, n, p).then(() => {})} />`
  with `const { change } = useBookingStatusChange({ show, refresh: () => refetch(true) })`.
  Pause `useAdminToday` polling (`setPaused`) while an action runs if needed.
- `data.unmarked_count` = started, still-approved sessions not yet marked.
- Pending rows can also use the component (pending → Duyệt / Từ chối) to replace the ad hoc
  approve/reject buttons in `AdminTodayScreen`.

## Notes for U24 / later
- `useAttendance(customerId)` for the client detail ("Đã tập n · Vắng m"); `refetch(true)` after
  marking attendance from the same screen.
- `BatchBookingMode.tsx` (not in U22 scope) still computes "slot đầy" with `bookings.length`,
  which also counts rejected bookings — completed / no_show are correctly counted, rejected are
  over-counted. Use non-rejected count when that file is next touched.
- `MemberHomeDashboard` / `OverviewScreen` next-session pickers don't skip past approved slots
  (pre-existing).
- `BookingCalendar` legend has no Đã tập / Vắng entries (badges are self-labelled).

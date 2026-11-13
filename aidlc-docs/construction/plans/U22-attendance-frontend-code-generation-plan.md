# U22 Attendance — Frontend Code Generation Plan

Backend contract: `construction/U22-attendance/code/backend-summary.md`. Building blocks: U20 summary.

- [x] 1. `lib/api/admin.ts` + `bookings.ts`: `BookingStatus` += `completed` | `no_show`; `TodaySession.id`, `status: BookingStatus`; `TodayData.unmarked_count`; `fetchAttendance(customerId)` + `AttendanceSummary`
- [x] 2. `shared/booking/BookingStatusActions.tsx`: `hasSessionStarted` (ICT parse), `getStatusActions` (backend transition table), `BookingStatusActions` component, `useBookingStatusChange` (undo for reject / completed / no_show) + tests (fast-check + RTL)
- [x] 3. `shared/hooks/useAttendance.ts` (+ test), exported from `hooks/index.ts`; `useAdminToday` doc for new fields (types flow through `TodayData`)
- [x] 4. `AdminBookings.tsx`: shared statusMeta pills (icon + label, accessible name, tap-target), stat pills from statusMeta (+ Đã tập / Vắng when non-zero), dialog = StatusBadge + BookingStatusActions, `useToast`, assign search via `matchesQuery` + label, occupied count excludes only `rejected`
- [x] 5. `CalendarKiosk.tsx`: all non-rejected bookings, statusMeta icon + label, text ≥ base, dialog = StatusBadge + BookingStatusActions (lg), `useToast`, tap-target close
- [x] 6. Member side: `BookingCalendar` slot cell + mobile `BookingScreen` render completed / no_show read-only via StatusBadge (no cancel)
- [x] 7. Verify: `npx vitest run src/app/shared src/lib src/app/mobile src/app/components src/app/desktop`
- [x] 8. `construction/U22-attendance/code/frontend-summary.md`

# U23 Hôm nay Hub — Summary

Tests: `npx vitest run src/app/desktop src/app/shared src/app/components` → 54 files, 256 tests passed. `npm run build` not run (parallel agent).

## Files
New: `shared/booking/todayModel.ts(+test)`, `shared/hooks/useFreshness.ts`, `shared/components/FreshnessIndicator.tsx(+test)`, `components/AdminBookings.test.tsx`.
Changed: `desktop/components/AdminTodayScreen.tsx(+test rewritten)`, `shared/hooks/useAdminToday.ts`, `shared/hooks/useBatchBooking.ts`, `components/AdminBookings.tsx`, `components/CalendarKiosk.tsx`, `desktop/pages/AdminDashboardPage.tsx`, and (outside list, additive types only) `lib/api/admin.ts`: `TodaySession.id`, `TodayData.unmarked_count?` — U22's summary claimed these but they were missing.

## APIs
- `AdminTodayScreen({ onOpenMember?(customerId), headerActions? })`
- `AdminBookings({ headerActions? })`
- `useBatchBooking().activate(member?: CustomerSummary)` (safe as onClick; AdminBookings now calls `activate()` explicitly)
- `todayModel`: `pickCurrentAndNext`, `groupPendingByDay`, `countdownLabel`, `dayLabel`, `ictEpoch`
- `useFreshness({loading,error,data}) → {lastUpdatedAt, offline}`; `<FreshnessIndicator lastUpdatedAt offline />`, `formatIctHm`

## Behaviour changes
- Hôm nay: hero (Đang tập / Tiếp theo, 30 s countdown tick), "Chưa điểm danh: N" chip, attendance actions only on started sessions, pending grouped by day (Hôm nay / Ngày mai / "T5 31/10") with Duyệt / Từ chối via BookingStatusActions; polling paused during changes; kiosk shortcut; no row-leave animation (refetch only).
- `useAdminToday` and `AdminBookings`: a silent poll failure no longer clears data or replaces the screen with the error box; it flips the freshness indicator to offline. Error screen only when there is no data.
- Pending approve/reject buttons now labelled "Duyệt: {tên}" / "Từ chối: {tên}" (previously "Chấp nhận lịch đặt của …").
- AdminBookings: faint always-visible "+" (`data-testid="cell-free-plus"`) in empty cells; assign success toast has "Đặt thêm buổi" → batch mode with member preselected.
- CalendarKiosk: freshness in header (md+); "Hôm nay" badge now text-xs/primary-text.

## Notes
- Mobile agent: pass `onOpenMember` and `headerActions`; the screen is `ops-surface` root itself. Mobile pages can't rely on `data-testid` `today-session-row`/`pending-row` changes — new ids added.
- U25: AdminBookings still has `text-[#0F6B3E]` / `text-[10px]` leftovers (hour label, "Đã chặn", assign dialog icon) and hover-only ring overlay; kiosk has more.
- `ops-surface` class assumed defined by U20 (DESIGN.md); not verified in theme.css.

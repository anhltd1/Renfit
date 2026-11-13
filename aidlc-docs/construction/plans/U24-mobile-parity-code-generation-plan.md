# U24 Mobile Parity, Day Agenda & Client Filters — Code Generation Plan

**Scope**: FR-1 (member-detail attendance summary), FR-4, FR-5, FR-10, FR-12 (InBody deltas),
FR-13 (mobile tablet-mode menu), NFR-1..4. Parallel agent owns AdminTodayScreen, AdminBookings,
CalendarKiosk, desktop AdminDashboardPage, useAdminToday, useBatchBooking, useFreshness.

## Steps
- [x] 1. `shared/clients/clientFilters.ts` — `ClientFilter`, predicates (ICT week / 14-day window), `filterClients`, `sortClients` (moved from desktop sidebar, unchanged behaviour), labels
- [x] 2. `shared/clients/ClientFilterChips.tsx`, `useClientFilter.ts` (URL key `filter`, default omitted; plain state outside a router)
- [x] 3. `useDashboardUrlState.ts` — register `day`, `filter` (`DASHBOARD_URL_KEYS`), `readDateParam`
- [x] 4. Desktop `CustomerSidebar` — chips + shared sort; `text-[10px]` removed; contrast fixes
- [x] 5. `shared/clients/AttendanceSummary.tsx`; desktop `CustomerDetail` identity column uses it
- [x] 6. `shared/forms/inbodyDelta.ts`; AddInbodyModal / AddInbodySheet success toast shows deltas
- [x] 7. `mobile/shell/AdminHeaderActions.tsx` — bell + "Thêm" menu (Làm mới / Chế độ máy tính bảng / Tự động / Đăng xuất)
- [x] 8. `mobile/screens/CustomerListScreen.tsx` — `headerActions`, chips, sort, "Đã nghỉ" marker
- [x] 9. `mobile/screens/CustomerDetailScreen.tsx` — Sửa / Đã nghỉ (confirm) / Khôi phục, toasts, attendance, label cleanup
- [x] 10. `mobile/components/AdminDayScroller.tsx`, `AssignBookingSheet.tsx`, `mobile/screens/AdminDayAgenda.tsx`
- [x] 11. `mobile/pages/AdminDashboardPage.tsx` — header actions on all tabs, Today → member → Back, agenda/grid toggle, `day` sync, `.ops-surface`
- [x] 12. `AdminBottomTabBar` — `text-xs`, `text-primary-text`, inactive `white/60`
- [x] 13. Tests (filters + fast-check, InBody delta + fast-check, header menu, detail edit/archive, list filters/sort/URL, agenda, page flows)
- [x] 14. `npx vitest run src/app/mobile src/app/shared src/app/desktop/components` — 69 files / 341 tests green
- [x] 15. Summary `construction/U24-mobile-parity/code/summary.md`

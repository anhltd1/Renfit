# U24 Mobile Parity, Day Agenda & Client Filters — Code Summary

**Status**: Code generated, unit tests green
(`npx vitest run src/app/mobile src/app/shared src/app/desktop/components` → 69 files, 341 tests).
`npm run build` deliberately not run (parallel agent); type-check at the V5 integration gate.

## Files
| File | Change |
|---|---|
| `shared/clients/clientFilters.ts` (+ test) | New: filters, ICT helpers, sort (moved from CustomerSidebar) |
| `shared/clients/ClientFilterChips.tsx` | New: 4 chips, `aria-pressed`, `.tap-target`, `data-testid="client-filter-{key}"` |
| `shared/clients/useClientFilter.ts` | New: filter state ↔ URL `filter` (default omitted); plain state outside a router |
| `shared/clients/AttendanceSummary.tsx` | New: "Đã tập N · Vắng M" via `useAttendance` (`data-testid="attendance-summary"`) |
| `shared/forms/inbodyDelta.ts` (+ test) | New: `formatSignedDelta`, `formatInbodyDelta`, `inbodySavedText` |
| `shared/hooks/useDashboardUrlState.ts` | `DASHBOARD_URL_KEYS` (tab, member, day, filter), `readDateParam` |
| `desktop/components/CustomerSidebar.tsx` | Filter chips + shared sort; sort pills `text-xs` + `aria-pressed`; footer `white/60`, "a / b hội viên" when filtered; create button `text-sm text-primary-text`; unused `highlightIdx` state removed |
| `desktop/components/CustomerDetail.tsx` | `AttendanceSummary` in the identity column (only change) |
| `desktop/components/AddInbodyModal.tsx`, `mobile/components/AddInbodySheet.tsx` | Success toast = "Đã lưu kết quả InBody. Cân nặng −1.2 kg · Cơ +0.4 kg · Mỡ −0.8 kg" |
| `mobile/shell/AdminHeaderActions.tsx` (+ test) | New |
| `mobile/shell/AdminBottomTabBar.tsx` | Labels `text-xs`, active `text-primary-text`, inactive `white/60` |
| `mobile/screens/CustomerListScreen.tsx` (+ test) | `headerActions` slot replaces own refresh/bell/logout; chips, sort, archived marker |
| `mobile/screens/CustomerDetailScreen.tsx` (+ test) | Sửa / Đã nghỉ / Khôi phục, toasts, attendance, labels `text-xs white/60` (no uppercase) |
| `mobile/screens/AdminDayAgenda.tsx` (+ test) | New |
| `mobile/components/AdminDayScroller.tsx`, `AssignBookingSheet.tsx` | New |
| `mobile/pages/AdminDashboardPage.tsx` (+ test) | Header actions everywhere, Today → member flow, agenda/grid, `day` sync, `.ops-surface` |

## Public API
```ts
// shared/clients/clientFilters.ts
type ClientFilter = 'active' | 'archived' | 'booked_this_week' | 'inactive_14d';
CLIENT_FILTERS, DEFAULT_CLIENT_FILTER = 'active', CLIENT_FILTER_LABELS, INACTIVE_DAYS = 14;
ictDateString(now?): string; ictWeekRange(now?): { start; end };      // Mon–Sun, ICT
isActiveClient(c); isBookedThisWeek(c, now?); isInactive14d(c, now?);
matchesClientFilter(c, f, now?); filterClients(list, f, now?);
type SortMode = 'alpha' | 'lastSession' | 'nextSession'; SORT_OPTIONS; sortClients(list, sort); // returns a copy
// shared/clients
ClientFilterChips({ value, onChange, className? }); useClientFilter(): [ClientFilter, set];
AttendanceSummary({ customerId, className? });
// shared/forms/inbodyDelta.ts
formatSignedDelta(diff): string; formatInbodyDelta(prev, next): string | null; inbodySavedText(base, prev, next): string;
// shared/hooks/useDashboardUrlState.ts
DASHBOARD_URL_KEYS; readDateParam(params, key, fallback): string;
// mobile
AdminHeaderActions({ onNavigate, onLogout, onRefresh?, refreshing? });
CustomerListScreen({ customers, loading, error, search, onSearchChange, onSelect, onRefresh, headerActions?, onCreateMember? });
CustomerDetailScreen({ customer, onBack, onChanged? });
AdminDayAgenda({ day, today, onDayChange, onShowGrid, headerActions? }); occupiedCount(); canAssign(slot, capacity);
AdminDayScroller({ days, selected, today, onSelect }); buildScrollerDays(workingDates); weekdayOf; fmtDayMonth; shortWeekday;
AssignBookingSheet({ open, time, hour, date, onClose, onAssigned, showToast });
```

## URL keys
- `day` — mobile agenda day (YYYY-MM-DD). Owned by the mobile page; written only while on
  Lịch đặt in agenda view and ≠ today (ICT). Invalid / outside the window → today, else first
  working day ≥ today.
- `filter` — client list filter; `active` omitted. Owned by the list components (desktop sidebar,
  mobile list) through `useClientFilter`; stays in the URL across tab switches (harmless, restores
  the chip when coming back).

## Behaviour changes (intentional)
- **Client list default now hides archived members** ("Đang tập" chip). Previously archived
  members were listed at the bottom; they are now under "Đã nghỉ". Counts show "a / b hội viên"
  when anything is filtered out.
- "Có lịch tuần này" = active and `next_session` in the current Mon–Sun ICT week, or a session
  today (the backend files today's sessions under `last_session`). "Lâu chưa tập" = active and no
  `last_session` or older than 14 days (exactly 14 days is not inactive).
- Mobile list: refresh/bell/logout buttons moved into the shared overflow menu
  (`admin-mobile-refresh` testid removed; `admin-mobile-logout` now the menu item); pull-to-refresh
  unchanged. Row avatar alt is now empty (name is visible next to it).
- Mobile Lịch đặt opens the day agenda; "Lưới 2 tuần" shows AdminBookings with a "Theo ngày" button
  in its `headerActions`. The view choice resets to agenda on page reload (component state).
- Today → member: detail opens on Hội viên; Back returns to Hôm nay (origin kept in state; after a
  reload of `?tab=clients&member=` Back goes to the list). Tab bar taps reset the origin.
- Mobile detail stays in sync after edit/archive (page reloads customers and refreshes `selected`).
- InBody success toast appends the delta line (desktop test expectation updated).
- AdminBottomTabBar colours updated (test expectation updated).

## Notes for U25
- `mobile/pages/AdminDashboardPage.tsx` still imports `desktop/components/AdminTodayScreen`
  (pre-existing; violates mobile ↛ desktop). Move AdminTodayScreen to `shared/` when its owner is done.
- Agenda single assign has no "Đặt thêm buổi" action (batch mode is internal to AdminBookings);
  could switch to the grid with batch pre-filled if AdminBookings accepted an initial batch member.
- Sheets are portalled outside `.ops-surface`, so the `Button` primitive's hover scale applies inside
  AssignBookingSheet (irrelevant on touch, but worth a primitive-level fix).
- `SidebarRow` still has `text-[10px]` badges and `text-[#0F6B3E]` text (not in U24's file list).
- AdminDayAgenda "today" uses ICT (`ictDateString`); AdminBookings still uses the UTC date for its
  "Hôm nay" column (per the dropped UTC/local item — only differs 00:00–07:00).
- Sundays in the scroller are disabled; a `?day=` Sunday still renders the "phòng tập nghỉ" state.

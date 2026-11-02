# Application Design (V5) — PT Experience Improvements

Requirements: `../requirements/requirements-v5.md` · Review: `../requirements/pt-ux-review-v5.md` ·
Design rules: `frontend/rules/DESIGN.md` v1.1.0 ("Operations Surfaces").

## Summary

V5 is mostly a frontend initiative on the trainer side, with **one backend data-model change**
(attendance statuses). It adds a small set of shared building blocks first (tokens, status meta,
toast actions, Vietnamese search, form guard), then applies them screen by screen.

Key decisions:

| # | Decision | Rationale |
|---|---|---|
| D1 | Extend `BookingStatus` with `completed`, `no_show` (no new collection) | Attendance is a lifecycle state of the booking; keeps queries and history in one place |
| D2 | Attendance statuses count as occupied capacity | A held session must never reopen its slot |
| D3 | Transitions validated server-side in `set_booking_status` | One rule set for Hôm nay, calendar, kiosk and any future client |
| D4 | Undo = immediate write + inverse write (A5) | Simple and crash-safe; delayed commit risks lost actions if the tab closes |
| D5 | Single shared `bookingStatusMeta` map (frontend) | Kills the per-component status drift (`STATUS_META` in AdminBookings, kiosk, Today) |
| D6 | `Toast` primitive gains an optional `action` + `useToast` queue hook | One toast system for every PT screen; additive, member side unaffected |
| D7 | Mobile Lịch đặt = new `AdminDayAgenda` (mobile tree) reusing `useAdminBookings` | Phone gets a day view; desktop grid untouched; data logic shared |
| D8 | Status/colour tokens added to `theme.css` `@theme` | Tailwind classes (`text-primary-text`, …) instead of raw hex in components |
| D9 | PT "ops" density/motion applied via a `.ops-surface` root class + tokens, not by forking primitives | Same primitives on both sides; ops rules scoped to the admin shell |

## Data model change (backend)

### Bookings.status
```
enum: pending | approved | rejected | completed | no_show      (was: pending | approved | rejected)
ACTIVE_STATUSES (capacity): pending, approved, completed, no_show
```
- `schema/booking.py` — add `COMPLETED = "completed"`, `NO_SHOW = "no_show"`.
- `schema/mongo.py` — validator enum extended. Startup hook runs an idempotent `collMod` on
  `Bookings` so existing deployments pick it up without `reset_database` (NFR-6).
- `docs/data-model.md` — status table + rules updated.

### Transition rules (`booking_service.set_booking_status`)
| From | Allowed to |
|---|---|
| pending | approved, rejected |
| approved | pending, rejected, completed*, no_show* |
| rejected | pending, approved (capacity-checked) |
| completed / no_show | approved (correction/undo), the other attendance status* |

`*` only if `slot start <= now (ICT)`. Invalid transitions return
`{"success": False, "message": "Không thể chuyển trạng thái này."}`. Notifications: none for
attendance changes; `approved → completed/no_show` does **not** retract anything (reminder already
fired or is irrelevant); `completed/no_show → approved` does **not** re-send `booking_approved`
(idempotency key `(type, related_id)` already guarantees this).

### `/admin/today` response (extended, backward-compatible)
`TodaySession` gains `id: str` (booking id) and returns statuses `approved | completed | no_show`
for today. New field `unmarked_count: int` = today's sessions with `status=approved` and start ≤ now.
`PendingBooking` unchanged (frontend derives the date from `time`).

### Attendance summary
`GET /admin/customers/{id}` detail (or the existing bookings payload) exposes
`attendance: {completed: int, no_show: int}` over the booking window. Implemented as a count query
in `booking_service.attendance_summary(customer_id)`.

## Frontend — new shared building blocks (`app/shared/`)

| Item | Path | Purpose |
|---|---|---|
| Status meta | `shared/booking/statusMeta.ts` | `bookingStatusMeta[status] → {label, icon, toneClass, borderStyle, recede}` + `bookingAccessibleName(b)` (FR-6) |
| `StatusBadge` | `shared/booking/StatusBadge.tsx` | Icon + label pill used in lists/dialogs |
| `BookingStatusActions` | `shared/booking/BookingStatusActions.tsx` | Context-aware action set (approve/reject or Đã tập/Vắng, per FR-1 rules) used by Today, calendar dialog, kiosk dialog |
| `normalizeVi` | `shared/text/normalizeVi.ts` | Accent-insensitive search (FR-7) + `matchesQuery(fields, q)` |
| `useToast` | `shared/hooks/useToast.ts` | Queue of 1, auto-hide, `show({kind, text, action?: {label, onClick}, durationMs})` |
| `Toast` (modified) | `shared/primitives/Toast.tsx` | Optional `action` button, `aria-live="polite"`, `pointer-events-auto` on the action, tokens |
| `useUndoableAction` | `shared/hooks/useUndoableAction.ts` | `run(do, undo, messages)` → executes, shows undo toast, calls `undo` on click, error toast on failure (FR-3) |
| `ConfirmDialog` | `shared/components/ConfirmDialog.tsx` | Built on `Modal`/`Sheet` by device; used for archive and "Bỏ thay đổi?" |
| `useDirtyGuard` | `shared/hooks/useDirtyGuard.ts` | Compares initial vs current form values; wraps `onClose` with a ConfirmDialog prompt |
| `useFreshness` | `shared/hooks/useFreshness.ts` | Tracks `lastUpdatedAt` + `stale/offline` from a query; renders via `FreshnessIndicator` |
| `FreshnessIndicator` | `shared/components/FreshnessIndicator.tsx` | "Cập nhật HH:MM" / "Mất kết nối — đang thử lại" (FR-9) |
| `validation` | `shared/forms/validation.ts` | Phone, age, InBody ranges + % change warning (FR-8) |

Tokens (`styles/theme.css`): `--color-primary-text: #3DBE7A`, `--color-error-text: #f87171`,
status tones, focus ring → `#3DBE7A`, `.ops-surface` scope (no hover scale, `--motion-view: var(--motion-fast)`,
coarse-pointer 44px min-size utility `.tap-target`).

## Frontend — modified / new screens

| Screen | Change | FRs |
|---|---|---|
| `desktop/components/AdminTodayScreen.tsx` (both trees) | Đang tập/Tiếp theo card; tappable rows → `onOpenMember(id)`; attendance actions; "Chưa điểm danh: N"; pending grouped by day; kiosk shortcut; undo + error toasts; freshness | FR-1/2/3/9 |
| `components/AdminBookings.tsx` | Status icons + accessible names; persistent "+"; shared status meta & actions in dialog; undo; freshness; stage style without loop; tokens | FR-1/3/5/6/9 |
| `components/CalendarKiosk.tsx` | Shared status meta/actions; ≥20px text; undo | FR-1/3/6 |
| `mobile/screens/AdminDayAgenda.tsx` (new) + `mobile/components/AdminDayScroller.tsx` (new) | Phone day agenda; URL key `day` | FR-5, NFR-4 |
| `mobile/pages/AdminDashboardPage.tsx` | Lịch đặt tab → `AdminDayAgenda`; shared `AdminMobileHeader` with bell on all tabs; Today→member navigation | FR-2/4/5 |
| `mobile/shell/AdminMobileHeader.tsx` (new) | Title + bell + overflow (refresh, tablet mode, logout) | FR-4/13 |
| `mobile/screens/CustomerDetailScreen.tsx` | Sửa / Đã nghỉ actions; attendance summary | FR-1/3/4 |
| `desktop/components/CustomerDetail.tsx` | Confirmed archive with toasts; attendance summary; ≥32px buttons | FR-1/3 |
| `desktop/components/CustomerSidebar.tsx`, `mobile/screens/CustomerListScreen.tsx` | `normalizeVi` search; filter chips (URL key `filter`); mobile sort + archived marker | FR-7/10, NFR-4 |
| `components/MemberFormModal.tsx` | Rebuild on `Modal`/`Sheet`; labels, inputMode, no age default, per-field errors, dirty guard | FR-3/8 |
| `AddInbodyModal.tsx` / `AddInbodySheet.tsx` | inputMode decimal, ranges + % warning, deltas on success, dirty guard | FR-3/8/12 |
| `components/TrainerNotes.tsx` | Undo on delete | FR-3 |
| `components/TrainerNotificationBell.tsx` | Push-aware polling (stop when subscribed) | FR-9 |
| `desktop/components/DesktopAdminHeader.tsx` | `aria-current` tabs, 32px targets, tablet-mode menu item | FR-13, NFR-3 |
| `desktop/pages/AdminDashboardPage.tsx` + mobile page | 401 → login with expiry message; `animate-panel-in` → fast fade on ops | FR-11, NFR-2 |
| `pages/AdminLoginRoute` / login pages | Read `?expired=1` and show message | FR-11 |
| Member side (`BookingCalendar`, Overview next-session, booking lists) | Render `completed`/`no_show` read-only via shared status meta | FR-1 |

## Cross-cutting concerns

- **Navigation from Hôm nay to a member** uses the existing URL state (`tab=clients&member=<id>`);
  desktop sets view + selection; mobile switches tab and pushes `detail` on the clients stack.
  Back on mobile returns to the previous tab (stack remembers origin `from=today`).
- **Optimistic updates**: status changes update local state first, then call the API; on failure
  restore and show the error toast (no silent `catch {}`).
- **Polling pause**: `useAdminToday.setPaused` / AdminBookings `selectedRef` pattern kept; undo
  window does not pause polling (the write already happened).
- **Device**: tablet-mode toggle writes `renfit.deviceOverride` through `DeviceProvider.setOverride`;
  no new detection logic (frontend-architecture rule).
- **Docs to update during Construction**: `backend/docs/data-model.md` (statuses),
  `backend/docs/notifications.md` (attendance sends nothing), `.kiro/steering/backend-architecture.md`
  (status line), `.kiro/steering/project-summary.md` (recent work).

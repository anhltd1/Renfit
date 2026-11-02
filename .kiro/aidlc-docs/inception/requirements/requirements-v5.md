# Requirements — PT Experience Improvements (V5)

## Intent Analysis

- **User Request**: Review the PT/trainer UI/UX with ui-ux-pro-max and implement the accepted fixes
  so the dashboard suits trainers best (review: `pt-ux-review-v5.md`).
- **Request Type**: Enhancement (workflow features + UX/visual pass on operations surfaces)
- **Scope**: Trainer side only — Hôm nay, Hội viên, Lịch đặt, Lịch để bàn, member/InBody forms,
  notes, notifications, admin shell. Member side touched only where a new booking status must be
  displayed.
- **Complexity**: Moderate (one backend data-model change; the rest is frontend)
- **Target Users**: 1 PT managing ~20 weekly members, on phone, front-desk tablet and laptop
- **Design source**: `frontend/rules/DESIGN.md` v1.1.0, section "Operations Surfaces (Trainer / PT)"
- **Explicitly dropped**: UTC-vs-local "today" fix (00:00–07:00 is outside gym hours)

---

## Functional Requirements

### FR-1: Attendance tracking (Đã tập / Vắng)
- Add booking statuses `completed` ("Đã tập") and `no_show` ("Vắng").
- Allowed transitions: `approved → completed | no_show`, and back `completed | no_show → approved`
  (correction / undo). No transition from `pending` or `rejected` to attendance statuses.
- Attendance can be set once the session's start time has been reached (same day or any past day
  in the booking window). Future sessions show no attendance actions.
- `completed` and `no_show` keep occupying slot capacity (the session happened / was held).
- Actions available in: Hôm nay session rows, calendar status dialog, kiosk status dialog.
- Member detail shows an attendance summary for the visible window: "N buổi · M vắng".
- Hôm nay shows a count of past sessions today that are still unmarked ("Chưa điểm danh: N").
- Member side shows the status read-only wherever the member sees their own bookings; no
  notification is sent to the member for attendance changes.
- AI Coach booking tools and availability keep working; attendance statuses are treated as
  occupied, never as bookable.

### FR-2: Hôm nay as the PT hub
- Top card **Đang tập / Tiếp theo**: current session (if any) and the next upcoming one, with
  member name, time and a countdown to start.
- Today's sessions as a chronological list; finished sessions recede visually; each row shows the
  attendance actions (FR-1) once started.
- **Tapping a session row opens that member's detail** (Hội viên tab with the member selected),
  on desktop and mobile; Back returns to Hôm nay.
- Pending requests are **grouped by day** with date headers ("T5 31/10"); each row shows date +
  time.
- Shortcut to **Lịch để bàn** from Hôm nay.
- Approve / reject failures show an error toast and restore the row.

### FR-3: Safety net for destructive and reversible actions
- **Undo toast (5 s)** after: reject booking (Hôm nay, calendar, kiosk), delete trainer note,
  attendance changes. Undo restores the previous state.
- **Confirmation dialog** before archiving a member ("Đánh dấu {tên} đã nghỉ?"). Restore needs no
  confirmation.
- Archive/restore, member edit and InBody save show a success or error toast. No unhandled
  promise rejections.
- Closing the member form or InBody form with unsaved changes (backdrop, Esc, X, Huỷ) asks
  "Bỏ thay đổi?" before discarding.

### FR-4: Mobile parity
- Mobile member detail gets **Sửa** and **Đã nghỉ / Khôi phục** actions (form opens in a `Sheet`).
- New trainer notifications are visible from every mobile PT tab: bell available in a shared PT
  header, or an unread badge on the Hôm nay tab that opens the notification list.

### FR-5: Calendar on phones
- On the mobile tree, Lịch đặt defaults to a **single-day agenda** with a horizontal day scroller;
  the 2-week grid remains on desktop/tablet.
- The agenda lists each hour with its bookings (status per FR-6) and an always-visible
  "+ Đặt lịch" control on hours with free capacity; blocked hours and Sundays are shown as such.
- Block-off, batch booking and kiosk entry points remain reachable on mobile.
- The pending count is visible in the mobile Lịch đặt header.
- Desktop/tablet grid: empty cells show a faint persistent "+" (no hover-only affordance).

### FR-6: Status visual language
- One shared status-meta map (label, colour token, lucide icon, border style, emphasis) per
  DESIGN.md `booking_status`, used by Hôm nay, calendar grid, mobile agenda, kiosk, dialogs and the
  member side.
- Calendar pills show a leading status icon; `rejected` uses dashed border + line-through.
- Accessible name of every booking control includes member, time and status (no `title`-only).

### FR-7: Vietnamese-aware search
- One shared `normalizeVi()` (NFD, strip combining marks, `đ/Đ → d`, lowercase, trim) used by the
  desktop sidebar, mobile list and assign dialog.
- Assign dialog also matches phone numbers.

### FR-8: Fast, correct data entry
- Phone: `type="tel" inputMode="tel" autoComplete="tel"`. Height, weight and all InBody fields:
  `inputMode="decimal"`.
- Age has **no default** (empty); optional in edit mode, validated if present (10–100).
- Labels associated with inputs (`htmlFor`/`id`); per-field errors with `aria-invalid` and
  `aria-describedby`.
- Phone format check (Vietnamese mobile: 10 digits starting with 0).
- InBody sanity ranges (weight 25–250 kg, height 100–230 cm, SMM 5–80 kg, BFM 1–150 kg): outside →
  blocking error; differs from "Lần trước" by >10 % → non-blocking warning.
- Member form uses the shared `Modal` (desktop) / `Sheet` (mobile) primitives: dialog semantics,
  focus trap, Esc, dirty-guard per FR-3.

### FR-9: Data freshness and notifications
- Live screens (Hôm nay, Lịch đặt, Lịch để bàn) show "Cập nhật HH:MM" next to refresh, and an
  offline/error state ("Mất kết nối — đang thử lại") when a background refresh fails.
- Trainer notification bell: when Web Push (U17) is subscribed, the 10 s polling interval stops
  and the bell refetches on push-message receipt and on `visibilitychange`. When push is
  unsupported or denied, the existing polling stays as the fallback (no regression).

### FR-10: Client list filters
- Filter chips: **Đang tập** (default), **Đã nghỉ**, **Có lịch tuần này**, **Lâu chưa tập
  (>14 ngày)**, on desktop and mobile.
- Mobile list gets the same sort options as desktop and an "Đã nghỉ" marker on archived rows.

### FR-11: Session expiry message
- On a 401 the PT lands on the admin login page with "Phiên đăng nhập đã hết hạn. Vui lòng đăng
  nhập lại."

### FR-12: Next-step suggestions
- After booking a member (single assign): toast action "Đặt thêm buổi" that enters batch mode
  pre-filled with that member.
- After saving an InBody result: the success state shows the change since the previous record
  (weight, SMM, BFM deltas).

### FR-13: Tablet mode
- Admin header menu gets a "Chế độ máy tính bảng" option that sets the existing device override
  (`setOverride`), and an "Tự động" option to clear it. Persisted (existing localStorage key).

---

## Non-Functional Requirements

### NFR-1: Design conformance (DESIGN.md v1.1.0 Operations Surfaces)
- Green fills `#0F6B3E`; green text/icons/focus `#3DBE7A`; error text `#f87171`.
- No informational text below `white/60`; no text below 12px; no `uppercase` Vietnamese.
- Flat `ambient` tier on PT work screens; blur only on overlays.
- 44px minimum targets on `pointer: coarse`; 32px on fine pointers.
- Backgrounds `#0B0B0B` (sidebar `#000`); pill primary buttons; modal/sheet per tokens via shared
  primitives; status colours via tokens only.

### NFR-2: Motion on operations surfaces
- PT view/tab switches ≤ `--motion-fast` (150ms) fade.
- No infinite animations except spinners and the kiosk now-line (batch staging: static style,
  at most one bounce on add).
- No hover `scale` on rows, cells or pills.
- Background polling never shows a spinner, flash or re-staggered entrance.
- Reduced-motion handling stays global (`theme.css`).

### NFR-3: Accessibility
- Toasts `role="status"` / `aria-live="polite"`; undo button reachable by keyboard.
- Tabs expose `aria-current`/`aria-selected`; toggle chips expose `aria-pressed`.
- Focus ring visible on green cells (uses `#3DBE7A`).

### NFR-4: State survives refresh
- New screens/selections register in `useDashboardUrlState` so a reload stays put: member opened
  from Hôm nay (`tab=clients&member=…`), mobile agenda selected day (new key `day`), client list
  filter (new key `filter`, default omitted).

### NFR-5: No new dependencies
- Frontend: no new npm packages (lucide-react icons, existing primitives/hooks). Backend: none.

### NFR-6: Compatibility
- Existing bookings and API clients keep working; status enum extended, not changed.
- Mongo validator for `Bookings.status` updated on startup (non-destructive `collMod`), not only
  via `reset_database`.
- Shared primitive changes (`Toast` action, `Modal`/`Sheet` dirty guard) are additive and
  backward-compatible with member-side usage.

### NFR-7: Verification
- `npm run build` + `npm run test` (Vitest/RTL/fast-check per `testing-conventions.md`) and backend
  `pytest` pass, with known flakes per project memory treated as pre-existing.
- New tests: `normalizeVi` (property: idempotent; accent-insensitive equality), status transition
  rules (backend unit tests), InBody range validation, undo-toast behaviour.
- `dist/` cleaned after verification builds.

---

## Assumptions (confirm or change before Construction)

| # | Assumption | Default chosen |
|---|---|---|
| A1 | When attendance can be marked | From session start time onward, any day in the window |
| A2 | Attendance visible to members | Yes, read-only label; no notification |
| A3 | Attendance and capacity | `completed`/`no_show` keep occupying the slot |
| A4 | Auto-marking past sessions | No — manual only; Hôm nay shows "Chưa điểm danh: N" |
| A5 | Undo mechanism | Immediate API call; undo issues the inverse status change |
| A6 | Mobile bell placement | Shared PT header on all mobile tabs |

---

## Out of Scope

- UTC/local "today" change (dropped by user).
- AI Coach for PTs; CMS editor redesign; member-side redesign.
- Attendance-based billing, packages or reports.
- New animation libraries or effects; changes to the landing page.
- Auth model changes (MVP posture unchanged).

# PT/Trainer UI/UX Review — Input to V5

**Date**: 2026-10-30
**Scope**: trainer side (`/admin/dashboard`) on desktop and mobile — Hôm nay, Hội viên, Lịch đặt,
Lịch để bàn, member forms, InBody entry, notes, notifications. Member side out of scope.
**Method**: code reading (no changes) checked against ui-ux-pro-max guidelines (confirmation
dialogs, color-only status, touch target size, mobile keyboards, input labels, real-time
operations pattern). The tool's generic palette/fonts were not adopted — `DESIGN.md` wins.
**Outcome**: user accepted all findings except the "today is UTC before 07:00" item (outside gym
hours, not an issue — dropped). User also accepted the theme/design/motion/UX recommendations in
§B. Paths below are relative to `frontend/src/app/`.

---

## A. Findings

### How a PT's day maps to the UI (before V5)

| PT job | Where | Taps | Problem |
|---|---|---|---|
| See today's sessions | Hôm nay | 0 | Rows are plain text; can't open the member; no attendance action |
| Approve / reject | Hôm nay | 1 | Reject has no undo; errors swallowed; no date shown |
| Mark done / no-show | — | — | Not possible: statuses are only pending / approved / rejected |
| Book for a member | Lịch đặt → cell → pick → confirm | 3 + search | "+ Đặt lịch" hint is hover-only; search not accent-insensitive |
| Find a member | Hội viên → search | 1 + typing | "nguyen" doesn't match "Nguyễn" |
| Add InBody result | member → Thêm kết quả → 4 fields → Lưu | 3 + typing | Full keyboard on iOS; no range checks |
| Edit / archive member (phone) | — | — | Missing on mobile; on desktop archive is one click, no confirm |
| Glance at schedule on phone | Lịch đặt | — | 2-week grid shows ~1.5 days per screen |

### P0 — workflow gaps
1. **No attendance tracking.** `STATUS_META` (`components/AdminBookings.tsx:84-97`) and the backend
   `BookingStatus` enum (`backend/src/schema/booking.py:9`, Mongo validator
   `backend/src/schema/mongo.py:113`) only have pending/approved/rejected.
2. **Hôm nay is a dead end** (`desktop/components/AdminTodayScreen.tsx`): session rows not
   tappable (`:126-141`); no current/next session; pending list spans all days but shows only
   HH:MM (`:180`); approve/reject errors swallowed (`:45-47`); kiosk only reachable from Lịch đặt.
3. **Destructive actions without a safety net**: reject booking (Today `:196`, calendar dialog
   `:520`), archive member (`desktop/components/CustomerDetail.tsx:57-74`, no try/catch either),
   delete note (`components/TrainerNotes.tsx:69-73`), backdrop click discards member form
   (`components/MemberFormModal.tsx:126-129`).
4. ~~UTC "today" before 07:00~~ — **dropped** (outside gym working hours).
5. **Mobile parity**: `mobile/screens/CustomerDetailScreen.tsx` has no edit/archive; the bell only
   exists in the Hội viên header (`mobile/screens/CustomerListScreen.tsx:112`).

### P1 — speed and readability
6. **Phone calendar**: day columns ≥150px (`AdminBookings.tsx:321-325`); "+ Đặt lịch" hover-only
   (`:469`); stat pills `hidden md:flex`.
7. **Color-only status**: calendar pills carry status by color + `title` only (`:457-462`).
8. **Search not Vietnamese-aware**: `desktop/components/CustomerSidebar.tsx:38-44`, mobile list,
   assign dialog (`AdminBookings.tsx:551`).
9. **Forms**: phone `type="text"`; height/weight/InBody without `inputMode="decimal"`; age defaults
   to `'20'` (`MemberFormModal.tsx:29`); labels not associated; single generic error; no InBody
   range checks; `MemberFormModal` lacks dialog semantics/focus trap/Esc.
10. **No data freshness**: calendar polls 5 s, kiosk 10 s, trainer bell 10 s
    (`components/TrainerNotificationBell.tsx:80`, despite U17 Web Push) — no "updated at".
11. **Client list**: no filters; mobile list has no sort and no archived marker.
12. **Session expiry**: 401 silently redirects to login (`desktop/pages/AdminDashboardPage.tsx:56`).

### P2 — readability, targets, drift
13. **Contrast**: `white/20`–`/40` used for information (2:1–3.8:1); active tab label is
    `#0F6B3E` at 11px (2.99:1).
14. **~18 sub-12px text instances** (10/11px), plus `uppercase` labels in
    `CustomerDetailScreen.tsx:33`.
15. **Touch targets**: modal close ≈20px (5 dialogs), booking pills ≈30px, sort pills/header tabs/
    Sửa–Đã nghỉ ≈20–24px, mobile refresh/logout ≈32px, block-off checkbox 16px. Tablets ≥1024px get
    the desktop tree, so these matter on touch too. `setOverride` exists but nothing calls it.
16. **DESIGN.md drift**: `#080808`/`#0A0A0A`/`#111` backgrounds; `rounded-xl` buttons;
    `rounded-2xl p-5 bg-black/70` modals; raw Tailwind status colors (`#6ee7b7`); toasts without
    `aria-live`; tabs/pills without `aria-current`/`aria-pressed`.

---

## B. Theme, design, motion and UX recommendations (accepted)

### Theme
- Keep dark + emerald. Split the green: `#0F6B3E` for fills, new `primary_text` `#3DBE7A` (same
  hue, 8.29:1) for text, icons and focus ring.
- Give booking statuses their own colour + icon + label language, distinct from the "today"
  green. Finished states recede (completed, rejected); attention states stand out (pending,
  no_show).
- `white/60` is the minimum for informational text.

### Design
- Glassmorphism for the member side and overlays; PT work screens use the flat `ambient` tier.
- PT type scale: 14px body, 12px minimum, bold name + time pair, `tabular-nums`, large kiosk text.
- Organise around time: Đang tập / Tiếp theo card first, then a timeline.
- One PT header and one toast system, via the shared primitives.

### Motion
- Tab/stack entrance on PT screens ≤150ms (currently `animate-panel-in` replays on every switch).
- No looping stage-bounce in batch mode: static dashed border + check, optional single bounce.
- No hover `scale` on rows/cells/pills.
- Motion confirms results (row-leave + undo toast, brief highlight on changed booking, kiosk
  now-line); polling refreshes are silent.

### UX
- Show results immediately, offer undo; never silent failures.
- One tap for approve / reject / Đã tập / Vắng; confirm dialog only for archive.
- Same booking actions, labels and icons in every place a booking appears.
- Suggest the next step after an action ("Đặt thêm buổi?", change since last InBody).
- Treat tablets as touch: 44px targets on `pointer: coarse`, plus a "Chế độ máy tính bảng" toggle
  via the existing device override.

These rules are now codified in `frontend/rules/DESIGN.md` v1.1.0 ("Operations Surfaces").

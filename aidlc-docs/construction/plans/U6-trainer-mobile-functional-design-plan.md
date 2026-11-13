# U6 Trainer Mobile — Functional Design Plan

**Unit**: U6 (TR-2 mobile shell/nav, TR-4 mobile booking management, TR-5 InBody recording mobile,
TR-6 mobile notifications). Replaces the temporary bridge from U5
(`app/mobile/pages/AdminDashboardPage.tsx` / `AdminLoginPage.tsx`).

## Context found

The current mobile bridge is a verbatim copy of the old combined component: a top header with a
clients/bookings tab toggle, then either a list→detail (via `mobileShowDetail` boolean, not a real
stack) for clients, or `AdminBookings.tsx`'s horizontal-scroll day×hour grid for bookings. TR-2
explicitly asks for "app-style navigation (list → detail as full-screen stack, back affordance)"
and TR-4 asks for "touch-friendly... via mobile sheets" for approve/reject/assign. U4 already
established the shell primitives this unit will reuse: `useStack()`, `StackHeader`, `BottomTabBar`
(generic over a tab-key type), and `Sheet` for mobile overlays (vs. `Modal` on desktop).

`AdminBookings.tsx` already implements assign/status-change as fixed-position centered dialogs
(functionally sheet-like, but not the `Sheet` primitive) inside its own horizontal-scroll calendar
grid — this was reused as-is for U5 desktop (DL-3 precedent) and currently also serves the mobile
bridge unmodified.

## Decisions needed (please answer)

### Question 1 — Trainer mobile shell structure
A) **Bottom tab bar with 2 tabs (Hội viên / Lịch đặt) + per-tab `useStack()`** (recommended) —
   mirrors U4's `BottomTabBar`/`MobileShell` pattern exactly (generalize `BottomTabBar` to accept a
   trainer tab-key type, or add a sibling `AdminBottomTabBar`). "Hội viên" tab root is the customer
   list; tapping a row pushes a detail screen (back chevron via `StackHeader`). "Lịch đặt" tab shows
   the booking calendar. Logout lives as a header action (top-right icon) on the customer-list root,
   matching `OverviewScreen`'s notification-bell-in-header pattern.

B) Keep the current top tab-toggle header (no bottom tab bar) and only replace the list→detail
   `mobileShowDetail` boolean with a real `useStack()` + `StackHeader` back button. Less consistent
   with the trainee mobile shell, but smaller diff.

X) Other (please describe after [Answer]: tag below)

[Answer]: A (recommendation)

### Question 2 — Booking management mobile UX (TR-4)
`AdminBookings.tsx`'s day×hour grid (72px label column + ~160px/day, horizontal scroll) works on
touch but wasn't designed mobile-first; it's already what mobile users see today via the bridge.

A) **Reuse `AdminBookings.tsx` as-is** inside the "Lịch đặt" tab (recommended, consistent with
   DL-3's reuse precedent from U5 and this project's reuse-over-rewrite bias) — its own
   assign/status dialogs are already fixed-centered "sheet-like" overlays that work on narrow
   viewports; no rebuild risk, ships TR-4's approve/reject/assign capability immediately.

B) Rebuild a native day-scroller + vertical per-hour list (like the trainee `BookingScreen`) with
   `Sheet`-based assign/approve/reject actions — closer to a "native app" feel and literally uses
   the `Sheet` primitive, but is a substantially larger new component with new interaction design
   not explicitly speced anywhere, and duplicates logic already correct in `AdminBookings.tsx`.

X) Other (please describe after [Answer]: tag below)

[Answer]: A (recommendation)

### Question 3 — InBody recording sheet (TR-5, mobile)
The desktop `AddInbodyModal` was just rebuilt on the shared `Modal` primitive (U5, MODAL-1). Per
the approved architecture, mobile overlays use `Sheet` instead of `Modal`.

A) **New `AddInbodySheet` built on the shared `Sheet` primitive** (recommended) — same fields/
   validation as the desktop version, chrome swapped for the bottom-sheet primitive per the
   established Modal-on-desktop/Sheet-on-mobile convention.

B) Reuse the desktop `AddInbodyModal` (centered `Modal`) unchanged on mobile too.

X) Other (please describe after [Answer]: tag below)

[Answer]: A (recommendation)

### Question 4 — Customer detail screen content (mobile)
The desktop `CustomerDetail` (hero + `DetailField` rows + `InbodySection`) has no `onBack` (both
panes always visible). On mobile this becomes a single pushed screen.

A) **New mobile `CustomerDetailScreen`** — same content/order as the desktop `CustomerDetail`, but
   as a full-screen pushed stack entry with a `StackHeader` back button (title = customer name),
   and its InBody section opens the new `AddInbodySheet` (Q3) instead of the desktop `Modal` version
   (recommended — keeps desktop/mobile trees decoupled per the shared/desktop/mobile import rule).

B) Share one `CustomerDetail`-like component parameterized by `onBack`/sheet-vs-modal, imported from
   `shared/`. Less duplication, but risks re-coupling desktop/mobile trees the architecture
   deliberately keeps separate (`shared/*` must never branch internally by device).

X) Other (please describe after [Answer]: tag below)

[Answer]: A (recommendation)

### Question 5 — Notifications (TR-6, mobile)
`TrainerNotificationBell.tsx` already renders a viewport-clamped dropdown
(`w-[min(20rem,calc(100vw-2rem))]`) and centered top popups — it looks mobile-safe as written and
is already used unmodified in the current bridge.

A) **Reuse `TrainerNotificationBell.tsx` as-is**, placed as a header action next to logout on the
   customer-list root (recommended — no known mobile defects, consistent with DL-3-style reuse).

B) Rebuild a mobile-specific notification bell/dropdown.

X) Other (please describe after [Answer]: tag below)

[Answer]: A (recommendation)

---

## Execution Checklist (runs after answers)

- [x] business-rules.md — shell/nav rules, sheet-vs-modal rule, reuse rules, parity rule
- [x] domain-entities.md — trainer tab-key type, mobile component props
- [x] frontend-components.md — full mobile trainer tree file structure + reuse map

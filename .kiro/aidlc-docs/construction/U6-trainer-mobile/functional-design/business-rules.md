# U6 Trainer Mobile — Business Rules

## SHELL (Trainer Mobile Shell/Nav) Rules
- **SHELL-1**: `app/mobile/shell/AdminBottomTabBar.tsx` renders 2 tabs — "Hội viên" (customers) and
  "Lịch đặt" (bookings) — generalized sibling of U4's `BottomTabBar` (same visual/interaction
  pattern, trainer-specific tab-key type). Per Q1.
- **SHELL-2**: Each tab holds its own `useStack()` (U4, reused as-is) — the "Hội viên" tab's stack
  starts at a customer-list root and pushes a `CustomerDetailScreen` on row tap; the "Lịch đặt" tab
  has no stack depth (single screen, `AdminBookings` reused as-is).
- **SHELL-3**: `StackHeader` (U4, reused as-is) provides the back chevron on `CustomerDetailScreen`
  and the customer-list root's header, with logout + `TrainerNotificationBell` as header actions on
  the customer-list root (mirrors `OverviewScreen`'s notification-bell-in-header pattern, TR-6).

## BOOKINGS (Mobile Booking Management) Rule
- **BOOK-ADMIN-1**: `AdminBookings.tsx` is reused unchanged inside the "Lịch đặt" tab (per Q2,
  DL-3 precedent from U5) — no rebuild, no rewiring to U2 hooks. Its existing assign/status-change
  dialogs already behave as viewport-safe centered overlays on narrow screens.

## INBODY (Mobile InBody Recording) Rule
- **INBODY-ADMIN-1**: `AddInbodySheet` is a new component built on the shared `Sheet` primitive
  (mobile convention — never `Modal` on mobile), with the same fields/validation as the desktop
  `AddInbodyModal` (per Q3). Opened from `InbodySectionMobile` inside `CustomerDetailScreen`.

## CUSTOMER DETAIL (Mobile) Rule
- **DETAIL-1**: `CustomerDetailScreen` is a new mobile-tree-only component (not shared with
  desktop) — pushed via the customer-list tab's `useStack()`, `StackHeader` back button, same
  content/order as desktop's `CustomerDetail` (hero, `DetailField` rows, InBody section) but with
  its own `InbodySectionMobile` that opens `AddInbodySheet` instead of the desktop `Modal` version
  (per Q4). Enforces the `shared/*` vs `desktop/*` vs `mobile/*` import-isolation rule — no direct
  reuse of desktop components across trees.

## NOTIFICATIONS (Mobile) Rule
- **NOTIF-1**: `TrainerNotificationBell.tsx` is reused unchanged as a header action on the
  customer-list tab root (per Q5) — no mobile-specific notification component is built.

## BRIDGE RETIREMENT Rule
- **RETIRE-1**: `app/mobile/pages/AdminDashboardPage.tsx` and `AdminLoginPage.tsx` (U5's temporary
  bridge, BRIDGE-1/2/3) are wholesale REPLACED by this unit's real implementation — not extended or
  patched. `AdminLoginPage.tsx` mobile is rebuilt full-bleed on `useAdminAuth()` (U2), mirroring
  U4's `LoginPage.tsx` mobile treatment of the trainee login screen.

## PARITY Rule
- **PARITY-1**: All U6 trainer mobile screens must preserve exact functional behavior versus the
  bridge/original combined component — customer search, InBody add/view, booking-status/assign
  flows (via reused `AdminBookings`), notification click-through, and logout — only navigation
  structure and presentation change (mirrors U5's PARITY-1).

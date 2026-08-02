# U6 Trainer Mobile — Frontend Components

## New file structure
```text
frontend/src/app/mobile/
├── shell/
│   └── AdminBottomTabBar.tsx     (+ .test.tsx)  — 2 tabs: Hội viên, Lịch đặt (sibling of U4's BottomTabBar)
├── screens/
│   ├── CustomerListScreen.tsx    (+ .test.tsx)  — root of "Hội viên" tab: search + list + header actions
│   └── CustomerDetailScreen.tsx  (+ .test.tsx)  — pushed screen: hero + DetailField rows + InbodySectionMobile
├── components/
│   ├── InbodySectionMobile.tsx   (+ .test.tsx)  — chart + "Thêm kết quả" opening AddInbodySheet
│   └── AddInbodySheet.tsx        (+ .test.tsx)  — rebuilt on shared Sheet primitive (INBODY-ADMIN-1)
└── pages/
    ├── AdminDashboardPage.tsx    (REPLACES the U5 temporary bridge)
    └── AdminLoginPage.tsx        (REPLACES the U5 temporary bridge)
```

## Reused as-is (imported into the mobile trainer tree, not modified)
- `app/components/AdminBookings.tsx` — booking-view content (per Q2/BOOK-ADMIN-1).
- `app/components/InbodyCharts.tsx` (`StackedInbodyChart`) — InBody display, same as desktop.
- `app/components/TrainerNotificationBell.tsx` — header notification bell (per Q5/NOTIF-1).
- `app/components/LiveClock.tsx` — not used on mobile (desktop-only per space constraints, same as
  the pre-rebuild mobile bridge which hid it via `hidden md:flex`).
- `app/mobile/shell/useStack.ts`, `StackHeader.tsx` (U4) — stack nav + header chrome.
- `app/shared/hooks/useAdminAuth`, `useCustomers`, `useInbodyHistory`, `useAddInbody` (U2).
- `app/shared/primitives/Sheet`, `Button`, `Input` — for the new mobile-only components.

## App.tsx changes
None — `/admin` and `/admin/dashboard` already route through `AdminLoginRoute`/`AdminDashboardRoute`
(U5), which already import from `../mobile/pages/*`. This unit only replaces the target files'
contents.

## Component Specs

### AdminBottomTabBar
- Props: see domain-entities.md. Same visual/interaction pattern as U4's `BottomTabBar`, restyled
  with the 2 trainer tab keys and lucide icons (`Users`, `CalendarDays`).

### CustomerListScreen
- `StackHeader` with title "Hội viên" and header actions: `TrainerNotificationBell` +  logout icon
  button (mirrors desktop `DesktopAdminHeader`'s logout placement, relocated per mobile's lack of a
  persistent top bar). Search `Input` + scrollable list of rows (reuses the same row visual as
  desktop's `SidebarRow` content, but as a new mobile-tree file — no cross-tree import per the
  architecture's isolation rule). Refresh action available (pull-to-refresh is out of scope; a
  header refresh icon button suffices, matching desktop's refresh button).

### CustomerDetailScreen
- Pushed via the customer tab's `useStack()`. `StackHeader` back button + customer name as title.
  Hero (avatar/name/phone/goal) + `DetailField`-style rows (inline, not cross-imported from
  `desktop/components/DetailField.tsx` — mobile owns its own copy per the isolation rule) +
  `InbodySectionMobile`.

### InbodySectionMobile + AddInbodySheet
- `InbodySectionMobile`: `StackedInbodyChart` (reused) + "Thêm kết quả" button opening
  `AddInbodySheet`.
- `AddInbodySheet`: same fields (date, height, weight, SMM, BFM) and validation as the desktop
  `AddInbodyModal`, chrome swapped for the shared `Sheet` primitive (open/onClose/title props,
  bottom-sheet slide-up).

### Mobile admin login page
- `AdminLoginPage`: full-bleed (not centered-card) layout, same fields/validation as desktop,
  rewired to `useAdminAuth()` (U2) — mirrors U4's `LoginPage.tsx` mobile treatment. Per RETIRE-1.

## Test Plan
- `AdminBottomTabBar.test.tsx`: render + tab-change interaction (same shape as
  `BottomTabBar.test.tsx`).
- `CustomerListScreen.test.tsx`: search filter, row tap calls `onSelect`, refresh/logout actions
  fire their callbacks (mocks `useCustomers`).
- `CustomerDetailScreen.test.tsx`: renders hero/detail fields, back button calls `onBack`, mocks
  `useInbodyHistory`.
- `InbodySectionMobile.test.tsx` / `AddInbodySheet.test.tsx`: mirrors U5's `InbodySection`/
  `AddInbodyModal` tests, mocking `lib/api/admin`, asserting the sheet opens/submits/closes.
- `AdminDashboardPage.test.tsx` (mobile): smoke-renders the two-tab shell.
- `AdminLoginPage.test.tsx` (mobile): mirrors U5's desktop version — mocks `useAdminAuth()`,
  asserts validation + submit + error handling.

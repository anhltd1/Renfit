# U5 Trainer Desktop — Frontend Components

## New file structure
```text
frontend/src/app/
├── pages/
│   ├── AdminDashboardRoute.tsx    (NEW, thin — replaces AdminDashboardPage import in App.tsx)
│   └── AdminLoginRoute.tsx        (NEW, thin)
├── desktop/
│   ├── pages/
│   │   ├── AdminDashboardPage.tsx     (NEW — rebuilt master-detail shell)
│   │   └── AdminLoginPage.tsx         (NEW — rebuilt with useAdminAuth())
│   └── components/
│       ├── DesktopAdminHeader.tsx     (NEW — view toggle, clock, notif bell, logout)
│       ├── CustomerSidebar.tsx        (NEW — search + customer list, wraps SidebarRow)
│       ├── SidebarRow.tsx             (NEW — extracted)
│       ├── CustomerDetail.tsx         (NEW — extracted, no onBack prop — desktop only)
│       ├── DetailField.tsx            (NEW — extracted)
│       ├── InbodySection.tsx          (NEW — extracted, uses Modal-based AddInbodyModal)
│       └── AddInbodyModal.tsx         (NEW — rebuilt on shared Modal primitive, per MODAL-1)
└── mobile/
    └── pages/
        ├── AdminDashboardPage.tsx     (TEMP bridge — verbatim copy, marked for U6 replacement)
        └── AdminLoginPage.tsx         (TEMP bridge — verbatim copy)
```

## Reused as-is (imported into the new desktop tree, not modified)
- `app/components/AdminBookings.tsx` — booking-view content (per DL-3).
- `app/components/InbodyCharts.tsx` (`StackedInbodyChart`) — InBody display (per DL-3).
- `app/components/TrainerNotificationBell.tsx` — header notification bell.
- `app/components/LiveClock.tsx`.

## App.tsx changes
- Routes for `/admin/dashboard` and `/admin` point to the new thin `AdminDashboardRoute`/
  `AdminLoginRoute` instead of directly importing `AdminDashboardPage`/`AdminLoginPage`.
- `AdminGuard` continues to wrap `/admin/dashboard` exactly as today.

## Component Specs (new desktop components)
### DesktopAdminHeader
- Props: see domain-entities.md. Renders the "Renfit Admin / Coach Dashboard" label, the
  clients/bookings view toggle, customer-count pill, refresh button, `TrainerNotificationBell`,
  and logout — same content as today's header, using shared `Button`/`Card` primitives where
  applicable, restyled per `design-system.md`.

### CustomerSidebar
- Props: see domain-entities.md. Search input (using shared `Input`) + scrollable list of
  `SidebarRow`s + footer count. Always visible (no `hidden md:flex` — DL-1).

### SidebarRow
- Same visual content as today's local function, extracted with `data-testid="sidebar-row-{id}"`.

### CustomerDetail
- Hero (avatar/name/phone/goal) + `DetailField` rows + `InbodySection`. No `onBack` prop — that
  was mobile-only in the combined component; desktop always shows both panes (DL-1).

### InbodySection + AddInbodyModal
- `InbodySection`: chart + "Thêm kết quả" button opening `AddInbodyModal`.
- `AddInbodyModal`: same form fields (date, height, weight, SMM, BFM) and validation as today,
  rebuilt on the shared `Modal` primitive (open/onClose/title) instead of hand-rolled backdrop
  markup (MODAL-1).

## Test Plan
- `AdminDashboardRoute`/`AdminLoginRoute`: RTL test with `DeviceProvider forceDevice="desktop"` vs
  `"mobile"`, mocking the desktop/mobile page modules (same pattern as U3's `DashboardRoute.test.tsx`
  fix — avoids the redirect-on-render infinite-loop pitfall).
- `DesktopAdminHeader`, `CustomerSidebar`, `SidebarRow`, `CustomerDetail`, `DetailField`: render +
  interaction tests.
- `InbodySection`/`AddInbodyModal`: mock `lib/api/admin` calls, assert modal opens, form submits,
  list updates.
- `AdminLoginPage`: mock `useAdminAuth()`, assert validation + submit + error handling (same
  pattern as U3's `LoginPage.test.tsx`).

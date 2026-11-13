# U3 Trainee Desktop — Frontend Components

## New file structure
```text
frontend/src/app/
├── pages/
│   ├── DashboardRoute.tsx     (NEW, thin — replaces UserDashboardPage import in App.tsx)
│   ├── LoginRoute.tsx         (NEW, thin)
│   └── SignupRoute.tsx        (NEW, thin)
├── desktop/
│   ├── pages/
│   │   ├── UserDashboardPage.tsx   (NEW — rebuilt shell, uses U2 hooks + shared primitives)
│   │   ├── LoginPage.tsx           (NEW — rebuilt with useAuth())
│   │   └── SignupPage.tsx          (NEW — rebuilt with useAuth())
│   └── components/
│       ├── DesktopSidebar.tsx      (NEW — extracted from current inline sidebar)
│       ├── DesktopHeader.tsx       (NEW — extracted from current inline header)
│       ├── OverviewTab.tsx         (NEW — profile form + InBody section, using useProfile/useInbodyHistory)
│       └── BookingTab.tsx          (NEW — thin wrapper around existing BookingCalendar, per DL-3)
└── mobile/
    └── pages/
        ├── UserDashboardPage.tsx   (TEMP bridge — verbatim mobile JSX + existing data logic, marked for U4 replacement)
        ├── LoginPage.tsx           (TEMP bridge — verbatim copy)
        └── SignupPage.tsx          (TEMP bridge — verbatim copy)
```

## Reused as-is (imported into the new desktop tree, not modified)
- `app/components/chat/ChatPanel.tsx` (+ its children) — chat tab content.
- `app/components/BookingCalendar.tsx` — booking tab content (per DL-3).
- `app/components/InbodyCharts.tsx` (`StackedInbodyChart`) — InBody display (per INBODY-1).
- `app/components/NotificationBell.tsx` — header notification bell.
- `app/components/OnboardingTour.tsx` — desktop onboarding (unchanged targets).
- `app/components/AvatarUpload.tsx`, `LiveClock.tsx`, `Link.tsx`, `figma/ImageWithFallback.tsx`.

## Deleted (per CLEAN-1, confirmed unrouted)
- `app/pages/DashboardPage.tsx`
- `app/pages/ProfilePage.tsx`
- `app/pages/BookingPage.tsx`
- `app/pages/AIChatPage.tsx`

## App.tsx changes
- Routes for `/dashboard`, `/login`, `/signup` point to the new thin `DashboardRoute`/`LoginRoute`/
  `SignupRoute` instead of directly importing `UserDashboardPage`/`LoginPage`/`SignupPage`.
- `AuthGuard` continues to wrap `/dashboard` exactly as today (guard logic unchanged).

## Component Specs (new desktop components)
### DesktopSidebar
- Props: see domain-entities.md. Renders logo, user identity card, 3 `NavItem`s (via `Button`
  variant="ghost" styled active/inactive per `design-system.md`), "new chat" button (chat tab
  only), logout button.

### DesktopHeader
- Props: see domain-entities.md. Renders tab-specific title/icon, `LiveClock` (center), and
  `NotificationBell` (right), wired to `onNavigateFromNotification` for the existing
  `target` → tab-switch behavior (unchanged).

### OverviewTab
- Uses `useProfile()` for read + `update`, `useInbodyHistory(customerId, 'customer')` for the
  chart. Form fields keep their current validation (age ≥10, password rules) — moved from inline
  handlers into the component, logic unchanged, just now calling `update(...)` instead of
  `updateProfile(...)` + manual `setAuthUser`.

### BookingTab
- Thin: renders `<BookingCalendar customerId data loading error onBook onCancel onRefresh/>` with
  its own local `fetchAvailability`/`createBooking`/`cancelBooking` + 5s poll **retained as-is**
  per DL-3 (not switched to `useBookingAvailability` in this unit, to avoid double-polling and
  because `BookingCalendar` already owns this concern correctly).

## Test Plan
- `DashboardRoute`/`LoginRoute`/`SignupRoute`: RTL test with `DeviceProvider forceDevice="desktop"`
  vs `"mobile"` asserting the correct page renders.
- `DesktopSidebar`, `DesktopHeader`: render + interaction tests (tab change, logout, new-chat).
- `OverviewTab`: mock `useProfile`/`useInbodyHistory`, assert form submit calls `update` with
  expected payload; error/success message rendering.
- No new tests needed for reused components (`BookingCalendar`, `ChatPanel`, etc.) — unchanged.

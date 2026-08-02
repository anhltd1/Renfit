# Components

High-level component/layout inventory for the rebuild. Three layers: **shared**, **desktop tree**,
**mobile tree**. Device selection happens once at the shell via `DeviceProvider`.

## Proposed frontend structure

```text
frontend/src/
├── app/
│   ├── App.tsx                     # routes + DeviceProvider wrapper
│   ├── device/                     # NEW — device detection + provider
│   │   ├── DeviceProvider.tsx
│   │   └── useDevice.ts
│   ├── shared/                     # device-agnostic building blocks
│   │   ├── hooks/                  # data hooks (bookings, inbody, chat, notifications, auth)
│   │   ├── primitives/             # design-system atoms (Button, Card, Input, Sheet, Modal...)
│   │   └── feature/                # headless/logic components reused by both trees
│   ├── desktop/                    # DESKTOP UI TREE
│   │   ├── shell/                  # sidebar/header dashboard shells
│   │   ├── pages/                  # UserDashboard, AdminDashboard, auth (desktop)
│   │   └── components/             # BookingCalendar, AdminBookings, ChatPanel, InbodyCharts...
│   ├── mobile/                     # MOBILE UI TREE (native-like)
│   │   ├── shell/                  # bottom-tab shell + stack navigation
│   │   ├── screens/                # Overview, Booking, Coach, Progress, Profile, Admin screens
│   │   └── components/             # touch calendar, chat, sheets, mobile cards
│   └── pages/                      # thin route entries that render desktop|mobile via useDevice
└── lib/                            # api clients, auth, registerServiceWorker (unchanged location)
```

## Shared Layer

### DeviceProvider / useDevice `(device)`
- **Purpose**: Detect device class once and expose it to the tree; provide manual override.
- **Responsibilities**: viewport + pointer/touch detection, resize/orientation updates, override state.

### Design-system primitives `(shared/primitives)`
- **Purpose**: Single set of `DESIGN.md`-conformant atoms used by both trees.
- **Responsibilities**: Button (pill/glow), Card (glassmorphism), Input, Sheet, Modal/Dialog,
  Toast, Badge, Tab primitives, focus-ring behavior, Vietnamese-safe typography.

### Data hooks `(shared/hooks)`
- **Purpose**: One data/state layer for both UIs (no duplication).
- **Responsibilities**: wrap `lib/api/*` (bookings, inbody, chat, notifications, profile, admin),
  auth/session, loading/error state, optimistic updates where already present.

### Shared feature logic `(shared/feature)`
- **Purpose**: Headless logic reused across trees (e.g. availability transforms, chat artifact
  handling, notification routing).
- **Responsibilities**: pure/format utilities and hook-based logic — presentation-free.

## Desktop Tree

### Desktop shells `(desktop/shell)`
- User dashboard shell (sidebar + header + tabs); Admin dashboard shell (master-detail).

### Desktop pages/components
- **UserDashboard (desktop)**, **AdminDashboard (desktop)**, **Auth pages (desktop)**.
- **BookingCalendar** (multi-day grid), **AdminBookings** (admin grid + modals),
  **ChatPanel + ChatArtifactCard**, **InbodyCharts**, **NotificationBell/TrainerNotificationBell**,
  **OnboardingTour (desktop)**.
- All refined to `DESIGN.md`; behavior parity with today.

## Mobile Tree (native-like)

### Mobile shell `(mobile/shell)`
- **BottomTabBar** (Overview / Booking / Coach / Progress-Profile; trainer: Members / Bookings /
  Notifications / Profile) with safe-area insets.
- **StackNavigator** — full-screen push/pop views with back affordance.
- **SheetHost** — bottom sheets/drawers replacing centered modals.

### Mobile screens/components
- **Trainee**: OverviewScreen, MobileBookingScreen (touch slot flow), CoachScreen (full-screen chat +
  touch artifact cards), ProgressScreen (mobile InBody viz), ProfileScreen, NotificationsScreen,
  MobileOnboarding.
- **Trainer**: MembersListScreen → MemberDetailScreen (stacked), MobileBookingMgmtScreen (sheet-based
  approve/reject/assign), InbodyRecordSheet, TrainerNotificationsScreen.
- **Auth (mobile)**: mobile-optimized Login/Signup/AdminLogin.

## Notes
- Auth screens differ modestly between devices; per plan Q1 they may still live as separate thin
  desktop/mobile variants sharing the same form hook, or a shared component if truly identical —
  finalized in Units Generation.
- No new backend components; all data flows through existing `lib/api/*` → FastAPI.

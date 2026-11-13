# U3 Trainee Desktop — Domain Entities

No new backend-facing types — U3 reuses U2's hook return types and the existing `lib/api/*`
payload shapes unchanged. The only new client-side "entity" is the route-selection composition:

```ts
// app/pages/DashboardRoute.tsx (new, thin)
function DashboardRoute(): JSX.Element {
  const { isMobile } = useDevice();
  return isMobile ? <MobileUserDashboardPage /> : <DesktopUserDashboardPage />;
}

// app/pages/LoginRoute.tsx / SignupRoute.tsx — same pattern
```

## Component prop shapes (desktop tree)
```ts
// app/desktop/pages/UserDashboardPage.tsx — no props (reads auth via useAuth())
// app/desktop/components/DesktopSidebar.tsx
interface DesktopSidebarProps {
  activeTab: 'overview' | 'chat' | 'bookings';
  onTabChange: (tab: 'overview' | 'chat' | 'bookings') => void;
  onNewChat: () => void;
  onLogout: () => void;
}

// app/desktop/components/DesktopHeader.tsx
interface DesktopHeaderProps {
  tab: 'overview' | 'chat' | 'bookings';
  customerId: string;
  onNavigateFromNotification: (tab: string) => void;
}
```

These mirror the current inline sidebar/header JSX in `UserDashboardPage.tsx`, extracted into
named components per DL-4 (use shared primitives for their internals) rather than left as
anonymous inline markup — improves readability without expanding scope.

# Component Methods & Interfaces

High-level interfaces/props/hook signatures. TypeScript-flavored. Detailed business rules are
deferred to Functional Design (per-unit). Backend contracts are unchanged.

## Device layer

### `useDevice()`
```ts
type DeviceClass = 'desktop' | 'mobile';
interface DeviceState {
  device: DeviceClass;        // resolved class (override wins if set)
  isMobile: boolean;
  isDesktop: boolean;
  override: DeviceClass | null;
  setOverride(next: DeviceClass | null): void;  // "view desktop site" escape hatch
}
function useDevice(): DeviceState;
```
- **Purpose**: single source of truth for device class.
- **Detection inputs**: `matchMedia('(max-width: 767px)')` + `matchMedia('(pointer: coarse)')` +
  `('hover: none')` + touch capability; recompute on resize/orientation; SSR/first-paint safe
  (avoid layout flash — resolve synchronously where possible).

### `<DeviceProvider>`
```ts
interface DeviceProviderProps { children: React.ReactNode; forceDevice?: DeviceClass; }
```
- Provides `DeviceState` via context; `forceDevice` supports tests/storybook and the manual override.

### Route entry pattern
```ts
// app/pages/DashboardRoute.tsx
function DashboardRoute() {
  const { isMobile } = useDevice();
  return isMobile ? <MobileUserDashboard/> : <DesktopUserDashboard/>;
}
```

## Shared data hooks (wrap existing lib/api)
```ts
useBookingAvailability(customerId): { data, loading, error, refetch }
useCreateBooking(): (customerId, timeIso) => Promise<BookingResult>
useCancelBooking(): (customerId, bookingId) => Promise<void>
useAdminBookings(): { data, loading, error, refetch }
useUpdateBookingStatus(): (bookingId, status) => Promise<...>
useAssignBooking(): (customerId, timeIso) => Promise<...>
useInbodyHistory(customerId): { records, loading, error }
useProfile(): { user, update(fields): Promise<...> }
useChat(): { messages, send(text), suggestions, loading, sendArtifactAction(...) }
useNotifications(customerId): { items, unread, markRead, markAllRead }
useTrainerNotifications(): { items, unread, markRead, markAllRead }
useAuth(): { user, login, signup, logout }         // customer
useAdminAuth(): { token, login, logout }
```
- **I/O**: same request/response types as current `lib/api/*` (no contract change).
- **Purpose**: both trees consume identical data logic; only presentation differs.

## Shared primitives (interfaces)
```ts
<Button variant="primary|secondary" size loading disabled onClick/>   // pill + glow per DESIGN.md
<Card elevated hoverable/>                                            // glassmorphism
<Input label error icon type .../>                                    // Vietnamese-safe
<Sheet open onClose side="bottom"/>                                   // mobile bottom sheet
<Modal open onClose/>                                                 // desktop dialog
<Toast kind="ok|err" text/>                                           // viewport-clamped
<Tabs value onChange items/>
```

## Mobile shell interfaces
```ts
<BottomTabBar tabs={Tab[]} active onSelect/>            // Tab = { key, label, icon, route }
<StackNavigator/> + useStack(): { push, pop, replace }  // full-screen native-style navigation
<SheetHost/> + useSheet(): { open(content), close }     // replaces centered modals on mobile
```

## Desktop shell interfaces (refined from current)
```ts
<DesktopUserDashboard/>   // sidebar + header + kept-mounted tabs
<DesktopAdminDashboard/>  // master-detail (list + detail)
```
- Props/behavior preserved from current implementation; restyled to `DESIGN.md`.

## Notes
- No method here introduces new backend calls; all map to existing endpoints documented in
  `reverse-engineering/api-documentation.md`.
- Pure utilities surfaced by shared hooks (availability transforms, slot/date formatting, artifact
  mapping) are candidates for property-based tests (PBT-02/PBT-03) — flagged for Functional Design.

# U4 Trainee Mobile — Domain Entities

No new backend-facing types — U4 reuses U2's hooks and existing `lib/api/*` payload shapes. New
client-side types are navigation/UI-only.

## Stack navigator
```ts
export type MobileTabKey = 'overview' | 'booking' | 'coach' | 'profile';

// Generic in-memory stack (app/mobile/shell/useStack.ts)
interface StackState<T> {
  stack: T[];
  current: T;
  push(screen: T): void;
  pop(): void;
  reset(screen: T): void;
  canPop: boolean;   // stack.length > 1
}
function useStack<T>(initial: T): StackState<T>;
```

## Mobile shell
```ts
interface BottomTabBarProps {
  active: MobileTabKey;
  onChange: (tab: MobileTabKey) => void;
}
interface TabItem { key: MobileTabKey; icon: ReactNode; label: string; }

interface StackHeaderProps {
  title: string;
  onBack?: () => void;   // omit on root screen (canPop === false)
  right?: ReactNode;      // e.g. notification bell on the overview root
}
```

## Booking screen
```ts
interface DayScrollerProps {
  days: DayAvailability[];   // from useBookingAvailability()
  selected: string;          // ISO date
  onSelect: (date: string) => void;
}
interface BookingSheetState {
  slot: Slot;
  mode: 'book' | 'cancel';
}
```

## Progress screen (InBody)
```ts
interface InbodyStatCardProps {
  label: string;              // "Cân nặng", "SMM", ...
  value: number;
  unit: string;
  delta: number | null;       // matches ChangeBadge convention (▲ red / ▼ green, zero = neutral)
}
type InbodyMetricKey = 'weight' | 'height' | 'SMM' | 'BFM';
```

## Mobile onboarding
```ts
// Reuses OnboardingTour's existing OnboardingStep type (see app/components/OnboardingTour.tsx);
// no new step-content type needed. Only the data-tour anchor targets differ (mobile-tab-* vs
// sidebar-*), configured via a mobile-specific steps array passed to the same tour engine if it
// accepts steps as a prop, or a parallel MobileOnboardingTour component if it doesn't (confirmed
// at code-generation time by reading OnboardingTour.tsx's actual prop surface).
```

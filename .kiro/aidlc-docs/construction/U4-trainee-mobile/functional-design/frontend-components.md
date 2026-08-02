# U4 Trainee Mobile — Frontend Components

## Onboarding reuse decision (refines Q4=A)
`OnboardingTour.tsx`'s spotlight-positioning engine (~250 lines: measure, scroll-into-view timing,
placement fallback, viewport clamping) is valuable to share rather than duplicate. Its `STEPS`
array and `OnboardingTab` union are currently hardcoded internally, not prop-driven.

**Plan**: generalize `OnboardingTour` to accept `steps: OnboardingStep[]` and a generic
`onTabChange: (tab: string) => void` as props, defaulting to the existing desktop `STEPS`/
`OnboardingTab` when not supplied — so U3's desktop call site (`app/desktop/pages/
UserDashboardPage.tsx`) keeps working unchanged, while U4 supplies its own mobile step array and
tab-key type. This is a backward-compatible modification to an existing shared component (lives in
`app/components/`, used by both trees), not a new mobile-only fork.

## New file structure
```text
frontend/src/app/mobile/
├── shell/
│   ├── useStack.ts               (+ .test.ts)   — in-memory push/pop/reset stack
│   ├── BottomTabBar.tsx          (+ .test.tsx)  — 4 tabs: Overview, Booking, Coach, Profile
│   ├── StackHeader.tsx           (+ .test.tsx)  — back chevron + title + optional right slot
│   └── MobileShell.tsx                          — composes tab bar + per-tab stack + header
├── screens/
│   ├── OverviewScreen.tsx        (+ .test.tsx)  — root of the Overview tab (summary + entry points)
│   ├── ProfileScreen.tsx         (+ .test.tsx)  — profile form (pushed from Profile tab root)
│   ├── ProgressScreen.tsx        (+ .test.tsx)  — InBody stat cards + metric-picker chart
│   ├── BookingScreen.tsx         (+ .test.tsx)  — day-scroller + hour list + confirm/cancel Sheet
│   ├── CoachScreen.tsx           (+ .test.tsx)  — full-screen ChatPanel wrapper
│   └── ProfileTabRoot.tsx        (+ .test.tsx)  — Profile tab root: links to ProfileScreen/ProgressScreen
├── components/
│   ├── DayScroller.tsx           (+ .test.tsx)
│   └── InbodyStatCard.tsx        (+ .test.tsx)
└── pages/
    ├── UserDashboardPage.tsx     (REPLACES the U3 temporary bridge)
    ├── LoginPage.tsx             (REPLACES the U3 temporary bridge)
    └── SignupPage.tsx            (REPLACES the U3 temporary bridge)
```

## Modified (shared component, generalized — see decision above)
- `frontend/src/app/components/OnboardingTour.tsx` — add optional `steps`/generic tab-change
  props, defaulting to current desktop behavior. Desktop call site unchanged.

## Reused as-is (imported into the mobile tree)
- `app/components/chat/ChatPanel.tsx` (+ children) — inside `CoachScreen`.
- `app/shared/primitives/*` (Button, Card, Input, Sheet, Toast, Tabs) — throughout.
- `app/shared/hooks/*` (U2) — `useBookingAvailability`, `useCreateBooking`, `useCancelBooking`,
  `useProfile`, `useInbodyHistory`, `useAuth`.

## Component Specs

### useStack `(mobile/shell)`
- See domain-entities.md `StackState<T>`. One instance per bottom tab, held in `MobileShell`.

### BottomTabBar
- Props: `{ active: MobileTabKey; onChange: (tab) => void }`. Renders 4 `Tabs`-style buttons with
  safe-area bottom padding (reuses the pattern already proven in the U3-era mobile bridge's bottom
  nav, restyled with `app/shared/primitives`).

### StackHeader
- Props: see domain-entities.md. Shows a back chevron only when `canPop` is true for the active
  tab's stack; omits it on each tab's root screen.

### MobileShell
- Composes: `BottomTabBar` (bottom, fixed) + active tab's `StackHeader` + active tab's current
  stack screen (rendered via each tab's own `useStack()`).

### OverviewScreen / ProfileTabRoot / ProfileScreen / ProgressScreen
- `OverviewScreen`: lightweight summary/entry screen (root of Overview tab) — greets the user,
  surfaces quick links (open chat, view next booking) — new content, minimal, not present in the
  old combined page (which had no separate "overview root" concept; this is the natural home for
  it in a stacked mobile nav).
- `ProfileTabRoot`: root of Profile tab — two entry cards ("Hồ sơ cá nhân" → push `ProfileScreen`,
  "Chỉ số InBody" → push `ProgressScreen`), splitting the desktop's single combined Overview tab
  into two native-style screens (NAV-1).
- `ProfileScreen`: the profile form, same fields/validation as desktop's `OverviewTab` form, using
  `useProfile()` (U2). Full-bleed mobile layout (not the desktop's centered `max-w-4xl` card).
- `ProgressScreen`: `InbodyStatCard` × 4 + one chart for the selected metric, using
  `useInbodyHistory()` (U2). Per INBODY-1.

### BookingScreen
- `DayScroller` (horizontal, touch) + hour-slot list for the selected day + `Sheet` for
  confirm/cancel, using `useBookingAvailability`/`useCreateBooking`/`useCancelBooking` (U2). Per
  BOOK-1/BOOK-2/BOOK-3.

### CoachScreen
- Full-screen `<ChatPanel variant="full" showHeader={false}/>` with a `StackHeader` showing "AI
  Coach" + a "new conversation" action in the header's right slot (mirrors desktop's sidebar
  new-chat button, relocated per mobile's lack of a persistent sidebar).

### Mobile auth pages
- `LoginPage`/`SignupPage`: full-bleed (not centered-card) layout, same fields/validation as
  desktop, using `useAuth()` (U2). Per AUTH-1.

## Test Plan
- `useStack.test.ts`: push/pop/reset behavior, pop-on-single-element no-op, fast-check invariants
  (stack length ≥ 1) per business-logic-model.md.
- `BottomTabBar.test.tsx`, `StackHeader.test.tsx`: render + interaction (tab change, back click).
- Screen-level tests mock the relevant U2 hooks (same pattern as U3's `OverviewTab.test.tsx`).
- `OnboardingTour.test.tsx` (new, since the component didn't have one before): verify the default
  desktop steps still render when no `steps` prop is passed (regression guard for the generalization).

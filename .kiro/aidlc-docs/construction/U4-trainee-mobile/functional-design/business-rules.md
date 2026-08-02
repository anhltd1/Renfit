# U4 Trainee Mobile — Business Rules

## NAV (Navigation) Rules
- **NAV-1**: Bottom tab bar has exactly 4 tabs — Overview, Booking, Coach, Profile (mapping to the
  existing `overview`/`bookings`/`chat` dashboard tabs plus a dedicated Profile tab, split out from
  the desktop's combined "Hồ sơ & InBody" since mobile screens are narrower — profile fields and
  InBody progress become two separate mobile screens, both reachable from the Profile tab's stack).
- **NAV-2**: Each tab maintains its own `useStack()` instance; switching tabs preserves each tab's
  stack position (matches desktop's "stays mounted" tab behavior).
- **NAV-3**: In-app back affordance (header chevron) calls `pop()`; there is no browser-back
  integration in this unit (Q1=A — explicitly deferred).
- **NAV-4**: Centered modals are never used on mobile — any "confirm/select" interaction uses
  `Sheet` (U1 primitive), never `Modal`.

## BOOKING (Mobile) Rules
- **BOOK-1**: The booking screen is single-screen (day-scroller + hour list), not a stack push,
  per Q2=A — keeps booking to 2 taps.
- **BOOK-2**: Slot interactions (book/cancel) always confirm via `Sheet` before the mutation fires
  — mirrors the desktop calendar's existing confirm-before-mutate pattern (never optimistic-without-
  confirmation).
- **BOOK-3**: Reuses `useBookingAvailability`/`useCreateBooking`/`useCancelBooking` (U2) — no new
  data-fetching logic; this unit is presentation-only for booking.

## INBODY (Mobile) Rules
- **INBODY-1**: Mobile InBody view is a new compact component (not `StackedInbodyChart` reused) —
  4 stat cards + 1 metric-picker chart, per Q3=A, to fit a phone viewport without horizontal
  scrolling for the primary "how am I doing" glance.
- **INBODY-2**: Uses `useInbodyHistory(customerId, 'customer')` (U2) — no new data-fetching logic.

## ONBOARDING (Mobile) Rules
- **ONB-1**: Mobile onboarding reuses `OnboardingTour`'s step copy/skip/progress mechanics (no new
  content authored) but retargets spotlight anchors to mobile shell elements, per Q4=A.
- **ONB-2**: Rendered only when `isMobile` (mirrors and inverts the desktop-only guard removed from
  the old combined page in U3).

## POLISH Rules
- **POLISH-1**: Visual polish matches the existing app's level — DESIGN.md tokens, lucide icons,
  U1's 300ms transitions and slide-up sheet animation. No new bespoke animation library or
  micro-interaction system is introduced, per Q5=A.

## AUTH (Mobile) Rules
- **AUTH-1**: `app/mobile/pages/LoginPage.tsx`/`SignupPage.tsx` (the temporary bridge from U3) are
  REPLACED in this unit — rewired to `useAuth()` (U2), matching the desktop auth pages' approach,
  but visually adapted to feel native on mobile (full-bleed layout rather than a centered card,
  per the "native app, not a shrunk website" requirement — FR-2).

## PARITY Rule
- **PARITY-1**: All U4 screens must preserve exact functional behavior versus the temporary bridge
  they replace (booking rules, auth validation, profile update fields) — only presentation and
  navigation architecture change (FR-5).

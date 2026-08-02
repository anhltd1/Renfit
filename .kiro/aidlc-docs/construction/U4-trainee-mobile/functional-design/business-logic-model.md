# U4 Trainee Mobile — Business Logic Model

## Stack Navigator (Q1=A)
In-memory, no URL changes — mirrors the existing tab-switch pattern already used successfully in
the dashboard (`Tab` state), just generalized to a push/pop stack:

```
useStack<T>(initial: T):
  state: T[]                      // stack of screen keys, initial = [initial]
  current = state[state.length-1]
  push(screen: T): state.push(screen)
  pop(): if state.length > 1, state.pop()   // never pops the root screen
  reset(screen: T): state = [screen]        // used when switching bottom tabs
```
- Each bottom tab owns its own independent stack instance (switching tabs does not lose the other
  tab's stack position — mirrors how desktop tab content stays mounted).
- Browser back button is NOT wired to this stack (explicitly out of scope per Q1=A) — only the
  in-app back affordance (chevron/arrow in the screen header) calls `pop()`.

## Booking Flow (Q2=A — single screen)
```
MobileBookingScreen:
  selectedDate: string (defaults to today, from the shared availability data)
  day-scroller: horizontal swipe/tap to change selectedDate (touch-friendly, no page navigation)
  hour list: rendered from useBookingAvailability() data, filtered to selectedDate
  tap open slot -> openSheet(slot) -> Sheet shows confirm; onConfirm -> useCreateBooking()
  tap own pending/approved slot -> openSheet(slot, mode='cancel') -> useCancelBooking()
```
No stack push for booking — the day-scroller + sheet keeps it to 2 taps, per Q2=A.

## Mobile InBody Visualization (Q3=A — compact combined view)
```
MobileProgressScreen:
  latest = inbodyRecords[last]
  progress = computed delta between latest and first record (same shape as the existing
             `inbody_progress` chat artifact's progress_since_first_record)
  render:
    - 4 stat cards (weight, height, SMM, BFM): value + ChangeBadge-style delta arrow
    - 1 line chart for the currently selected metric (metric picker: tap a stat card to switch
      which metric's trend renders below) — avoids the desktop chart's 4-stacked-rows layout,
      which doesn't fit a phone viewport without horizontal scroll.
```
This reuses the delta-arrow visual pattern already established in `ChatArtifactCard.tsx`'s
`ChangeBadge` (business consistency — same "▲/▼ value unit" convention, new implementation local
to the mobile component to avoid a cross-tree import from `app/components/chat/*`).

## Mobile Onboarding (Q4=A — build now, retargeted)
```
MobileOnboardingTour:
  reuses OnboardingTour's step content/copy and skip/progress mechanics (same steps, same
  Vietnamese copy — no new content authored)
  retargets spotlight anchors from data-tour="sidebar-*" (desktop) to new
  data-tour="mobile-tab-*" anchors on the bottom tab bar + relevant mobile screen elements
  triggered by the same consumeNewAccountFlag() one-shot check, but only rendered when
  isMobile (mirrors the desktop-only render guard, inverted)
```

## Testable Properties (PBT-01)
- **useStack invariants (PBT-03)**: `pop()` on a single-element stack is a no-op (never empties);
  `push` then `pop` returns to the exact prior state (round-trip-like, PBT-02 adjacent); stack
  length is always ≥ 1. Good fast-check target — pure reducer-style logic.
- **InBody progress delta calc**: if relocated to a shared pure function (rather than duplicated
  inline), becomes a PBT-03 invariant candidate (delta = latest - first, sign matches direction).
  Flagged for whoever implements MobileProgressScreen — not blocking.

# U4 Trainee Mobile — Functional Design Plan

**Unit**: U4 (TS-1 shell/nav, TS-3 booking, TS-5 chat, TS-7 progress/profile, TS-9 notifications/
onboarding, TS-10 auth — all mobile). Replaces the temporary bridge from U3.

This is the most novel unit so far — it introduces real navigation architecture (stack + sheets),
not just a restyle. A few decisions materially affect scope and should be confirmed before I build.

## Decisions needed (please answer)

### Question 1 — Stack navigator implementation
TS-1 asks for "full-screen stacked navigation" with back affordances. How should this work
under the hood, given routes stay the same for both devices (Application Design decision)?

A) **In-memory stack, no URL changes** (recommended) — a lightweight `useStack()` hook holds a
   stack of screen keys within the mobile dashboard tree (similar to the existing tab-switch
   pattern, just with push/pop + a back button). Browser back button is NOT wired to it (out of
   scope) — only the in-app back affordance. Simplest, lowest risk, matches how the current tab
   system already works (state-based, no routing).

B) Nested React Router routes (e.g. `/dashboard/booking/confirm`) so browser back works naturally.
   More "correct" but bigger change — introduces real sub-routes that don't exist today, and this
   app has no other nested-route precedent.

X) Other (please describe after [Answer]: tag below)

[Answer]: A (recommendation)

### Question 2 — Booking flow depth
TS-3 says "tap it and confirm via a mobile sheet." Should picking a date be a separate stacked
screen before the sheet, or a single screen with an inline day-scroller + bottom sheet for time
confirmation?

A) **Single screen** (recommended) — Booking screen shows a horizontal day-scroller (touch-swipe,
   like a native calendar) with hour slots below for the selected day; tapping an open slot opens
   the confirm Sheet. No extra stack push needed — keeps the flow to 2 taps (day, then slot).

B) Two-step stack — a date-picker screen, then push to a slot-list screen, then a sheet.

X) Other (please describe after [Answer]: tag below)

[Answer]: A (recommendation)

### Question 3 — Mobile InBody visualization
TS-7 requires "mobile-appropriate visualization, not a clipped desktop chart." The current
`StackedInbodyChart` (4 stacked line-chart rows + shared x-axis, ~90px/point, horizontal scroll)
is desktop-oriented. For mobile:

A) **New compact mobile chart** (recommended) — a single combined view: latest values as 4 stat
   cards (value + delta arrow, matching the chat artifact's `ChangeBadge` pattern already used
   elsewhere) plus ONE swipeable/scrollable line chart with a metric picker (tap to switch which
   metric's trend line shows), sized to fit the viewport without horizontal scroll for the primary
   stat view.

B) Reuse `StackedInbodyChart` as-is inside a horizontally scrollable container (same visual,
   just confirmed to scroll cleanly on mobile).

X) Other (please describe after [Answer]: tag below)

[Answer]: A (recommendation)

### Question 4 — Mobile onboarding (TS-9)
Prior work explicitly skipped onboarding on mobile ("mobile-specific tour is a UI/UX follow-up,
not part of this responsive-layout pass" — see the old `UserDashboardPage.tsx` comment). TS-9
now requires mobile onboarding. Scope for U4:

A) **Build a mobile onboarding variant now** (recommended — TS-9 explicitly requires it) — reuse
   `OnboardingTour`'s step/copy content and skip/progress mechanics, but retarget its spotlight to
   mobile shell elements (bottom tab bar items, not sidebar `data-tour` anchors).

B) Defer mobile onboarding again to a later pass; U4 covers shell/booking/chat/progress/auth only.

X) Other (please describe after [Answer]: tag below)

[Answer]: A (recommendation)

### Question 5 — Visual decoration budget
Given this is a from-scratch mobile shell (not a restyle of existing markup), how much visual
polish beyond "functionally native-like + DESIGN.md tokens" should I aim for (icon choices,
transition flourishes, empty states)?

A) **Match the existing app's polish level** (recommended) — consistent with desktop (subtle
   300ms transitions, DESIGN.md tokens, lucide icons), no extra bespoke animation beyond the
   approved slide-up sheet / tab-switch transitions already defined in U1.

B) Invest extra polish specifically for mobile (custom page-transition animations, haptic-style
   micro-interactions) beyond what U1's primitives provide.

X) Other (please describe after [Answer]: tag below)

[Answer]: A (recommendation)

---

## Execution Checklist (runs after answers)
- [x] business-logic-model.md — stack navigator logic, booking flow state machine, onboarding logic
- [x] business-rules.md — navigation rules, sheet-vs-stack rules, InBody mobile viz rules
- [x] domain-entities.md — `useStack()` types, mobile component props
- [x] frontend-components.md — full mobile tree file structure + reuse map (incl. OnboardingTour
      generalization decision)

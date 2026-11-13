# U3 Trainee Desktop — Business Rules

## DL (Desktop Layout) Rules
- **DL-1**: `app/desktop/pages/UserDashboardPage.tsx` renders only the desktop shell (sidebar +
  header + tab content) — no `md:`/`hidden` responsive branching inside it; device selection
  already happened at the route entry (per Application Design's approved architecture).
- **DL-2**: Behavior parity is mandatory (FR-5) — booking create/cancel, profile update, InBody
  display, chat, and notifications must work identically to today; only presentation + underlying
  data-hook plumbing change.
- **DL-3**: Where `BookingCalendar.tsx`'s current component already has its own 5s silent-refresh
  `useEffect`, keep that behavior when the desktop dashboard page renders it — don't introduce a
  second competing poll via `useBookingAvailability`. `BookingCalendar.tsx` itself is reused as a
  child component (not rewritten) for the booking tab in U3; deeper rewiring of
  `BookingCalendar.tsx` to consume the U2 hook directly is deferred (component isn't broken,
  rewriting it isn't required for TS-4's "restyle to DESIGN.md + fix defects" goal — it already
  conforms reasonably well per the earlier PWA/responsive pass).
- **DL-4**: Use `app/shared/primitives` (Button, Card, Input, Modal, Tabs) for any newly-written
  markup in the rebuilt page shell (sidebar nav items, header, profile form). Do not force-migrate
  every existing child component's internals in this unit — only the page shell + directly
  rewired pieces per DL-3's scoping.

## AUTH (Desktop Auth) Rules
- **AUTH-1**: `app/desktop/pages/LoginPage.tsx` and `SignupPage.tsx` are rebuilt using
  `useAuth()` (U2) instead of direct `lib/api/auth` + `setAuthUser` calls; visual structure
  (centered card, `max-w-md`/`max-w-lg`) is preserved since it's already `DESIGN.md`-conformant —
  this is a data-wiring + primitive-adoption pass, not a visual redesign of these two screens.
- **AUTH-2**: `AdminLoginPage.tsx` is untouched — trainer-side, out of scope for U3.

## CLEANUP Rules
- **CLEAN-1**: Delete `DashboardPage.tsx`, `ProfilePage.tsx`, `BookingPage.tsx`, `AIChatPage.tsx`
  — confirmed unrouted in reverse engineering (`App.tsx` redirects `/booking`, `/ai-coach`,
  `/profile` to `/dashboard`). Verify no remaining imports before deleting each file.
- **CLEAN-2**: `useNavigation()` legacy shim in `App.tsx` stays (per frontend-architecture.md,
  it's a compatibility layer, not dead code) — not touched by CLEAN-1.

## BRIDGE Rules (temporary mobile continuity)
- **BRIDGE-1**: `app/mobile/pages/UserDashboardPage.tsx` (temporary) is a verbatim extraction of
  today's mobile JSX + its existing inline data logic — explicitly NOT rewired to U2 hooks and NOT
  restyled. It exists only so mobile users aren't broken between U3 and U4.
- **BRIDGE-2**: The temporary mobile file carries a top-of-file comment marking it for wholesale
  replacement in U4 — do not build on it or extend it.
- **BRIDGE-3**: `app/mobile/pages/LoginPage.tsx`/`SignupPage.tsx` — same bridge treatment: verbatim
  copy of current (already-responsive) auth pages, marked temporary, superseded by U4's native
  mobile auth screens.

## INBODY Rules
- **INBODY-1**: `InbodyCharts.tsx` is imported as-is into the desktop tree (no restyle, no logic
  change) per the approved decision — its 4 metric colors are a data-visualization convention
  (distinct per-metric hues), not a `DESIGN.md` violation on their own, and revisiting them is
  out of scope for U3.

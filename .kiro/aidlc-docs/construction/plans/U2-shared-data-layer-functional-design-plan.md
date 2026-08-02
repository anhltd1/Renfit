# U2 Shared Data Layer — Functional Design Plan

**Unit**: U2 (supports FR-5 parity; consumed by U3–U6).

## Judgment call (flagged, not gated)
No new data-fetching library (e.g. React Query/SWR) is introduced — U1's tech-stack decision
(TD-2) was to minimize new dependencies, and the existing codebase already uses manual
`useState`/`useEffect` + `useCallback` for data fetching (see `BookingCalendar.tsx`,
`AdminBookings.tsx`). U2 formalizes that same pattern into reusable hooks rather than switching
paradigms. Flagged in the completion message for the user to override if they'd prefer otherwise.

## Execution Checklist
- [x] business-logic-model.md — hook state machine (idle/loading/success/error), polling pattern
      for admin bookings, optimistic-update pattern for booking actions
- [x] business-rules.md — error normalization, refetch/staleness rules, silent-refresh rule
- [x] domain-entities.md — hook return-value shapes (mirroring existing lib/api types, unchanged)
- [x] frontend-components.md — the hook inventory + which existing components each will replace call sites in

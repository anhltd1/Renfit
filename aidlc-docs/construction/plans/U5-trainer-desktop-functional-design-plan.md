# U5 Trainer Desktop — Functional Design Plan

**Unit**: U5 (TR-1 desktop shell/master-detail, TR-3 desktop booking management, TR-5 InBody
recording desktop, TR-6 desktop notifications, TR-7 desktop admin login).

## Context found
`AdminDashboardPage.tsx` combines desktop (master-detail: sidebar customer list + detail pane) and
mobile (list-then-detail via `mobileShowDetail`) in one component, branching on `useIsMobile()` —
the same pre-rebuild pattern U3 addressed for the trainee dashboard. `AdminBookings.tsx` (booking
calendar) and `TrainerNotificationBell.tsx` are separate, reusable components. `AdminLoginPage.tsx`
is a single centered-card component, already reasonably `DESIGN.md`-conformant.

Given U3 established a proven approach for this exact shape of problem, I'm proposing the same
decisions here for consistency — please confirm or override.

## Decisions needed (please answer)

### Question 1 — Mobile continuity bridge (same approach as U3)
U5 only builds the desktop tree; U6 builds the real trainer mobile tree.

A) **Bridge strategy** (recommended, consistent with U3) — move today's `AdminDashboardPage.tsx`
   mobile JSX + logic verbatim into a temporary `app/mobile/pages/AdminDashboardPage.tsx` (and
   `AdminLoginPage.tsx`), marked for wholesale replacement in U6.

B) Leave `AdminDashboardPage.tsx`/`AdminLoginPage.tsx` untouched (still serving both devices) until
   U6 is ready to cut over both at once.

X) Other (please describe after [Answer]: tag below)

[Answer]: A (recommendation)

### Question 2 — Reuse of AdminBookings.tsx and InbodyCharts.tsx
Both already work correctly and are reasonably conformant (same situation as `BookingCalendar.tsx`
in U3, per DL-3's precedent).

A) **Reuse both as-is**, relocated into the desktop tree without rewriting internals (recommended
   — consistent with U3's DL-3 scoping; AdminBookings already has its own working 5s poll)

B) Rewire `AdminBookings.tsx` to use the U2 `useAdminBookings`/`useUpdateBookingStatus`/
   `useAssignBooking`/`useCustomers` hooks as part of this unit (bigger scope — touches a
   currently-correct component)

X) Other (please describe after [Answer]: tag below)

[Answer]: A (recommendation)

### Question 3 — Admin login desktop scope (TR-7)
Same question as U3's TS-10 auth scope.

A) Rebuild `AdminLoginPage.tsx` now as part of U5 (recommended — TR-7 is explicitly assigned;
   rewire to `useAdminAuth()` from U2, keep the existing visual structure)

B) Defer; U5 covers dashboard/bookings/InBody/notifications only

X) Other (please describe after [Answer]: tag below)

[Answer]: A (recommendation)

### Question 4 — Master-detail component extraction granularity
The current page has `CustomerDetail`, `SidebarRow`, `InbodySection`, `AddInbodyModal`,
`DetailField` as local functions inside the page file.

A) **Extract each into its own named component file** under
   `app/desktop/components/` (recommended — matches U3's `DesktopSidebar`/`DesktopHeader`
   extraction pattern; improves testability)

B) Keep them as local functions within a single rebuilt page file (less restructuring, harder to
   unit test individually)

X) Other (please describe after [Answer]: tag below)

[Answer]: A (recommendation)

### Question 5 — AddInbodyModal → Modal primitive
`AddInbodyModal` currently hand-rolls its own overlay/backdrop markup (functionally identical to
the U1 `Modal` primitive).

A) **Replace with the shared `Modal` primitive** (recommended — desktop uses `Modal`, not `Sheet`,
   per the approved architecture; reduces duplicate overlay logic)

B) Keep its current hand-rolled markup as-is

X) Other (please describe after [Answer]: tag below)

[Answer]: A (recommendation)

---

## Execution Checklist (runs after answers)
- [x] business-logic-model.md
- [x] business-rules.md
- [x] domain-entities.md
- [x] frontend-components.md

# U3 Trainee Desktop — Functional Design Plan

**Unit**: U3 (TS-2 desktop shell, TS-4 desktop booking, TS-6 desktop chat, TS-8 desktop
progress/profile, TS-10 desktop auth).

## Context found
`UserDashboardPage.tsx` currently implements **both** desktop (sidebar) and mobile (bottom-nav +
drawer) UI inline in one component, switching via inline classes (`hidden md:flex` etc.) — not
via `useDevice()`. `LoginPage.tsx`/`SignupPage.tsx` are single components too (already reasonably
responsive per the earlier PWA pass, but not yet split into device trees or migrated to
`app/shared/primitives`). `AdminLoginPage.tsx` is trainer-facing — out of scope for U3.

## Decisions needed (please answer)

### Question 1 — Mobile continuity bridge
U3 only builds the **desktop** tree. U4 (not yet built) will build the **mobile** tree. Until U4
lands, what happens to the current inline mobile UI in `UserDashboardPage.tsx`?

A) **Bridge strategy** (recommended) — move the current file's mobile-only JSX into a temporary
   `app/mobile/pages/UserDashboardPage.tsx` as-is (no restyling), create a new
   `app/desktop/pages/UserDashboardPage.tsx` fully rebuilt for U3, and a thin route entry that
   picks between them via `useDevice()`. U4 later replaces the temporary mobile file with a real
   native-like rebuild — this just prevents mobile users from losing the app in between.

B) Leave `UserDashboardPage.tsx` untouched (still serving both devices inline) and build the new
   desktop tree as an *unused* preview until U4 is ready to cut over both at once.

X) Other (please describe after [Answer]: tag below)

[Answer]: A (recommendation)

### Question 2 — Scope of "desktop auth" (TS-10)
Should U3 also rebuild `LoginPage.tsx`/`SignupPage.tsx` into `app/desktop/pages/`, or defer auth
pages to a later pass since they're already reasonably `DESIGN.md`-conformant?

A) Rebuild now as part of U3 (recommended — TS-10 is explicitly assigned to U3; keeps auth
   consistent with the new primitives or the shared-hooks/useAuth pattern from U2)

B) Defer auth pages to U7/a later cleanup pass; U3 focuses on the dashboard/booking/chat/profile only

X) Other (please describe after [Answer]: tag below)

[Answer]: A (recommendation)

### Question 3 — Dead pages cleanup
`DashboardPage.tsx`, `ProfilePage.tsx`, `BookingPage.tsx`, `AIChatPage.tsx` are unrouted dead code
(confirmed in reverse engineering). Delete them now, or leave them for a dedicated cleanup unit?

A) Delete now as part of U3 (recommended — low risk, reduces confusion while rebuilding the live
   equivalents; nothing routes to them per `App.tsx`)

B) Leave them; don't touch during this unit

X) Other (please describe after [Answer]: tag below)

[Answer]: A (recommendation)

### Question 4 — InBody chart component
`InbodyCharts.tsx` (shared by admin + customer) is functionally solid but not yet using
`app/shared/primitives` tokens directly (custom colors per metric, not the `#0F6B3E` primary).
For U3's desktop rebuild:

A) Leave `InbodyCharts.tsx` as-is (functional, not visually broken, just not using new primitives)
   — move/rewire it into the desktop tree without restyling (recommended, keeps U3 scoped to
   layout/shell work, not a chart redesign)

B) Restyle the chart's 4 metric colors to derive from the emerald palette as part of U3

X) Other (please describe after [Answer]: tag below)

[Answer]: A (recommendation)

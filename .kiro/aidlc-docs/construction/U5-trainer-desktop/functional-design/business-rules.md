# U5 Trainer Desktop — Business Rules

## DL (Desktop Layout) Rules
- **DL-1**: `app/desktop/pages/AdminDashboardPage.tsx` renders master-detail with BOTH panes
  always visible — no `hidden md:flex`/`isMobile` branching (device selection already happened at
  the route entry).
- **DL-2**: Behavior parity is mandatory (FR-5) — customer list, search, detail view, InBody
  add/view, booking-view toggle, notifications, logout must work identically to today.
- **DL-3**: `AdminBookings.tsx` and `InbodyCharts.tsx` (`StackedInbodyChart`) are reused as child
  components, not rewritten, mirroring U3's precedent — deeper rewiring to U2 hooks is deferred.
- **DL-4**: Use `app/shared/primitives` (`Modal`, `Card`, `Button`, `Input`) for any newly-written
  markup in the rebuilt shell and for `AddInbodyModal`'s replacement (per Q5).

## AUTH (Desktop Admin Auth) Rules
- **AUTH-1**: `app/desktop/pages/AdminLoginPage.tsx` is rebuilt using `useAdminAuth()` (U2) instead
  of direct `lib/api/admin::adminLogin` + `setAdminToken` calls; visual structure (centered card,
  grid background) is preserved — data-wiring pass, not a redesign of this screen.

## CLEANUP Rules
- **CLEAN-1**: No dead-page deletions in this unit (unlike U3) — `AdminDashboardPage.tsx`/
  `AdminLoginPage.tsx` at their old paths are superseded by the new desktop/mobile split the same
  way U3 handled the trainee pages; old paths get overwritten by the mobile bridge, new desktop
  files land at new paths under `app/desktop/`.

## BRIDGE Rules (temporary trainer-mobile continuity)
- **BRIDGE-1**: `app/mobile/pages/AdminDashboardPage.tsx` (temporary) is a verbatim extraction of
  today's combined component + its existing inline data logic — NOT rewired, NOT restyled.
- **BRIDGE-2**: Marked for wholesale replacement in U6 — do not build on or extend it.
- **BRIDGE-3**: `app/mobile/pages/AdminLoginPage.tsx` — same bridge treatment, verbatim copy.

## MODAL Rule
- **MODAL-1**: `AddInbodyModal` is rebuilt on the shared `Modal` primitive (open/onClose/title
  props) instead of its current hand-rolled backdrop+overlay markup — same form fields/validation,
  only the chrome changes.

## COMPONENT EXTRACTION Rule
- **EXT-1**: `CustomerDetail`, `SidebarRow`, `InbodySection`, `DetailField` are extracted into
  named files under `app/desktop/components/`, each independently testable — mirrors U3's
  `DesktopSidebar`/`DesktopHeader` extraction (Q4).

## PARITY Rule
- **PARITY-1**: All U5 desktop screens must preserve exact functional behavior versus the current
  combined component (search, InBody add/view, booking-status/assign flows via `AdminBookings`,
  notification click-through, logout) — only presentation/structure changes (FR-5).

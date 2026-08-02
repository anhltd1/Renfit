# U8 Accessibility — Code Generation Summary

**Story implemented**: EN-6 (accessibility baseline — visible focus rings, AAA-oriented contrast,
keyboard navigation).
**Approach**: Cross-cutting audit + fix pass (no new UI/logic), consistent with the adaptive stage
policy that skips a formal functional-design Q&A for pure-styling/audit units. Findings were
gathered via a full-repo accessibility audit (shared/primitives, desktop, mobile, components,
pages) against A11Y-1/A11Y-2/A11Y-3 (business-rules.md, U1 Foundation) and NFR-2/EN-6's acceptance
criteria, then fixed directly.
**Status**: DONE — all fixes applied, tests + build pass.

## Audit findings and fixes

### 1. Missing focus rings (systemic gap)
Only the shared primitives (`Button`, `Tabs`, `Input`, `Modal`) and a handful of pages used the
`focus-visible:ring-2 focus-visible:ring-[#0F6B3E]` pattern; nearly every hand-rolled `<button>`
across `desktop/`, `mobile/`, and `components/` had no explicit focus style at all.
- **Fix**: added a global `:focus-visible { outline: 2px solid #0F6B3E; outline-offset: 2px; }`
  rule to `frontend/src/styles/theme.css` (`@layer base`). This is the single highest-leverage fix
  — it makes every focusable element in the app compliant with A11Y-1 (2px, 2px offset, green)
  without editing dozens of files individually, and layers cleanly with primitives that already
  define their own `focus-visible:ring` (box-shadow-based) utilities.

### 2. div/span used as clickable instead of `<button>`
- `Card` primitive (`shared/primitives/Card.tsx`) is repurposed as an interactive element on the
  mobile Overview/Profile-tab shortcut cards (`OverviewScreen.tsx`, `ProfileTabRoot.tsx`) via its
  `onClick` prop, but rendered a plain non-interactive `<div>`. **Fixed**: `Card` now adds
  `role="button"`, `tabIndex={0}`, Enter/Space activation, and a focus-visible ring automatically
  whenever `onClick` is passed — no call-site changes needed.
- `AdminBookings.tsx`'s calendar cell (opens the assign-booking dialog) was a `<div onClick>` with
  no keyboard access. **Fixed**: added `role="button"`, `tabIndex={0}`, `onKeyDown` (Enter/Space),
  `aria-label`, and a focus-visible ring.
- `TrainerNotificationBell.tsx`'s top-center popup toast was a `<div onClick>`. **Fixed**: same
  treatment (role/tabIndex/onKeyDown/aria-label/focus ring).

### 3. Missing aria-label on icon-only buttons
Added `aria-label` to: `Navigation.tsx`'s mobile hamburger toggle and desktop logout button;
`AdminBookings.tsx`/`BookingCalendar.tsx`'s refresh and prev/next-day chevron buttons and their
hand-rolled dialogs' close buttons; `DesktopAdminHeader.tsx`'s refresh button;
`CustomerListScreen.tsx`'s refresh button; password show/hide toggles in `ProfileScreen.tsx`
(mobile), `OverviewTab.tsx` (desktop), and both `SignupPage.tsx` password/confirm-password
toggles; `ChatArtifactCard.tsx`'s per-booking cancel button. (Several buttons — `NotificationBell`,
`TrainerNotificationBell`'s bell toggle, `Modal`'s close button, `StackHeader`'s back button — were
already correctly labeled; left unchanged.)

### 4. Missing alt text
None found — audit confirmed every `<img>`/`ImageWithFallback` usage already has a real `alt`.

### 5. Low-contrast informational text
Bumped opacity on text that carries information a user needs to read with no higher-contrast
duplicate nearby: `AddInbodyModal.tsx`/`AddInbodySheet.tsx`'s "Lần trước: {height} cm" hint
(`/20` → `/50`); `CustomerDetail.tsx`/`CustomerDetailScreen.tsx`'s "Hội viên chưa cập nhật thông
tin." empty state (`/20` → `/50`); the admin-login disclaimer "Trang quản trị — không dành cho hội
viên" (`/15` → `/40`) in both desktop and mobile `AdminLoginPage.tsx`. Decorative/redundant
low-opacity text (placeholders with visible labels, disabled-state hints, unit suffixes next to a
full-contrast label) was left as-is per the audit's own triage.

### 6. Other keyboard issues — focus trap for Modal/Sheet
`Modal`/`Sheet` had Escape-to-close but no focus trap — Tab could move focus to elements behind the
overlay while open, and focus wasn't returned to the trigger on close. **Fixed**: new shared
`frontend/src/app/shared/primitives/useFocusTrap.ts` hook (moves focus into the dialog on open,
traps Tab/Shift+Tab within its focusable elements, returns focus to the trigger on close) — wired
into both `Modal.tsx` and `Sheet.tsx`. The same gap existed in `AdminBookings.tsx`'s and
`BookingCalendar.tsx`'s hand-rolled dialogs (predate the `Modal` primitive, kept visually as-is per
the reuse-as-is precedent) — both now use the same shared `useFocusTrap` hook plus a local
Escape-to-close helper, so they get correct dialog keyboard semantics without duplicating the logic
ad hoc or being rewritten wholesale.

## Dead code removed
- `frontend/src/app/components/Booking.tsx` — confirmed zero imports anywhere (same category as
  prior units' dead-page deletions); rather than fixing accessibility issues in unreachable code,
  it was deleted.

## Verification
- `npm run test`: 56 test files, 195 tests, all passing (6 new: expanded `Card` tests in
  `primitives.test.tsx`, new `useFocusTrap.test.tsx`).
- `npm run build`: 2487 modules, 27 chunks, no chunk-size warning (unchanged from U7's result —
  this unit made no bundling changes). `dist/` cleaned up.

## Files created
- `frontend/src/app/shared/primitives/useFocusTrap.ts` (+ `.test.tsx`)

## Files modified
- `frontend/src/styles/theme.css` (global `:focus-visible` rule)
- `frontend/src/app/shared/primitives/Card.tsx` (+ its tests) — keyboard-operable when interactive
- `frontend/src/app/shared/primitives/Modal.tsx`, `Sheet.tsx` — focus trap wired in
- `frontend/src/app/components/AdminBookings.tsx`, `BookingCalendar.tsx` — div-as-clickable → real
  keyboard semantics, aria-labels, Escape/focus-trap on hand-rolled dialogs
- `frontend/src/app/components/TrainerNotificationBell.tsx` — popup toast keyboard semantics
- `frontend/src/app/components/Navigation.tsx` — aria-labels on icon-only buttons
- `frontend/src/app/desktop/components/DesktopAdminHeader.tsx`,
  `frontend/src/app/mobile/screens/CustomerListScreen.tsx` — refresh button aria-label
- `frontend/src/app/mobile/screens/ProfileScreen.tsx`, `frontend/src/app/desktop/components/OverviewTab.tsx`,
  `frontend/src/app/mobile/pages/SignupPage.tsx`, `frontend/src/app/desktop/pages/SignupPage.tsx` —
  password-toggle aria-labels
- `frontend/src/app/components/chat/ChatArtifactCard.tsx` — cancel-button aria-label
- `frontend/src/app/desktop/components/AddInbodyModal.tsx`, `frontend/src/app/mobile/components/AddInbodySheet.tsx`,
  `frontend/src/app/desktop/components/CustomerDetail.tsx`, `frontend/src/app/mobile/screens/CustomerDetailScreen.tsx`,
  `frontend/src/app/desktop/pages/AdminLoginPage.tsx`, `frontend/src/app/mobile/pages/AdminLoginPage.tsx` —
  low-contrast informational text bumped

## Files deleted
- `frontend/src/app/components/Booking.tsx` (dead code)

## Deviations from a pre-approved plan
None — this unit skipped the functional-design Q&A stage per the adaptive stage policy (pure
audit/accessibility pass, no new logic or screens), going directly to audit + fix + verify.

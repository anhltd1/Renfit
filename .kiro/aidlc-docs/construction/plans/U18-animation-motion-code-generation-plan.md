# U18 Animation & Motion Polish — Code Generation Plan

**Unit**: U18 Animation & Motion Polish
**FRs**: FR-1 through FR-10 (requirements-v3.md)
**Dependencies**: None (pure frontend CSS + hook)
**Backend changes**: None

---

## Step 1: Motion foundation — tokens, easing, reduced-motion

- [ ] `frontend/src/styles/theme.css`:
  - Add `:root` custom properties: `--motion-fast: 150ms`, `--motion-base: 250ms`, `--motion-slow: 400ms`
  - Add `--ease-in-out: cubic-bezier(0.25, 0.46, 0.45, 0.94)`, `--ease-out: cubic-bezier(0.0, 0.0, 0.2, 1)`
  - Add `@media (prefers-reduced-motion: reduce)` block disabling all animation/transition
  - Migrate existing keyframe durations to use the tokens

**Files**: `theme.css`

---

## Step 2: Tab & panel crossfade

- [ ] `frontend/src/app/desktop/pages/UserDashboardPage.tsx` — replace `display:none` toggling with a CSS class-based fade+translate entrance (opacity 0→1, translateY 4px→0, `--motion-base`)
- [ ] `frontend/src/app/desktop/pages/AdminDashboardPage.tsx` — same pattern for admin tabs
- [ ] Add `.animate-tab-enter` keyframe in `theme.css`

**Files**: 3 files

---

## Step 3: Action result collapse animation

- [ ] Create `frontend/src/app/shared/primitives/AnimatedList.tsx` — wrapper that animates item removal (fade + height collapse over `--motion-base`)
- [ ] `frontend/src/app/desktop/components/AdminTodayScreen.tsx` — wrap pending bookings in AnimatedList so approved/rejected cards collapse
- [ ] `frontend/src/app/components/TrainerNotes.tsx` — wrap notes so deleted notes collapse

**Files**: 3 files (1 new)

---

## Step 4: Number count-up hook

- [ ] Create `frontend/src/app/shared/primitives/useCountUp.ts` — `useCountUp(target: number, duration?: number)` using `requestAnimationFrame`, returns current value
- [ ] `frontend/src/app/desktop/components/MemberHomeDashboard.tsx` — use for weight/BFM delta numbers
- [ ] `frontend/src/app/mobile/screens/OverviewScreen.tsx` — same
- [ ] `frontend/src/app/desktop/components/AdminTodayScreen.tsx` — use for session/pending counts (if displayed)

**Files**: 4 files (1 new)

---

## Step 5: Button press feedback

- [ ] `frontend/src/app/shared/primitives/Button.tsx` — add `active:scale-[0.97] transition-transform` to the base button class
- [ ] Verify it propagates to all buttons using the primitive
- [ ] For hand-rolled buttons (confirm dialogs, modals): add `active:scale-[0.97]` to their class strings directly in key components

**Files**: ~3 files

---

## Step 6: Skeleton-to-content crossfade

- [ ] `frontend/src/styles/theme.css` — add `.animate-content-in` keyframe (opacity 0→1, 150ms)
- [ ] Apply to: `CustomerSidebar` (when loading finishes), `AdminTodayScreen`, `TrainerNotes`, notification dropdowns — wrap the data-loaded content in a div with the class

**Files**: ~5 files

---

## Step 7: Modal entrance animation

- [ ] `frontend/src/app/shared/primitives/Modal.tsx` — add scale(0.96)→1 + opacity entrance animation; backdrop fades slower (`--motion-slow`)
- [ ] Exit: reverse with `--motion-fast` duration

**Files**: 1 file

---

## Step 8: Toast slide animation

- [ ] `frontend/src/styles/theme.css` — add `@keyframes toast-in` (translateY 12px→0 + opacity) and `@keyframes toast-out`
- [ ] `frontend/src/app/components/AdminBookings.tsx` — apply to toast element
- [ ] `frontend/src/app/components/BookingCalendar.tsx` — same
- [ ] `frontend/src/app/components/CalendarKiosk.tsx` — same

**Files**: 4 files

---

## Step 9: Batch-mode slot staging bounce

- [ ] `frontend/src/app/components/AdminBookings.tsx` — when `isStaged` becomes true, apply a brief `animate-stage-bounce` class (scale 0.94→1 over `--motion-fast`)
- [ ] Add the keyframe to `theme.css`

**Files**: 2 files

---

## Step 10: Kiosk "now" line ambient glow

- [ ] `frontend/src/app/components/CalendarKiosk.tsx` — add a `@keyframes glow-pulse` (opacity 0.5→1→0.5 over 3s, infinite) on the line's box-shadow only
- [ ] Add keyframe to `theme.css`

**Files**: 2 files

---

## Step 11: Verify & test

- [ ] `npm run build` — no errors
- [ ] `npm run test` — all pass
- [ ] Clean up `dist/`
- [ ] Spot-check: confirm `prefers-reduced-motion` disables everything

**Files**: Test files as needed

---

## Summary

- **Total steps**: 11
- **New files**: 3 (`AnimatedList.tsx`, `useCountUp.ts`, new keyframes in theme.css)
- **Modified files**: ~20 (theme.css, dashboard pages, components with modals/toasts/lists)
- **Backend changes**: 0
- **New dependencies**: 0
- **Estimated size**: ~2kB CSS, ~1kB JS

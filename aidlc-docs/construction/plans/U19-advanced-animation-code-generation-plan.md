# U19 Advanced Animation & Interaction Polish — Code Generation Plan

**Unit**: U19 Advanced Animation & Interaction
**FRs**: FR-1 through FR-10 (requirements-v4.md)
**Dependencies**: U18 (motion tokens + reduced-motion guard already in place)
**New dependency**: `motion` (tree-shakeable framer-motion)
**Backend changes**: None

---

## Step 1: Install `motion` package

- [ ] `cd frontend && npm install motion`
- [ ] Verify build still works

**Files**: `package.json`, `package-lock.json`

---

## Step 2: AI Coach typing indicator (3-dot bounce)

- [ ] Create `frontend/src/app/components/chat/TypingIndicator.tsx` — 3 dots with staggered bounce
- [ ] Add `@keyframes dot-bounce` to `theme.css`
- [ ] Replace the spinner in `ChatPanel.tsx` loading state with `<TypingIndicator />`

**Files**: 3 files (1 new)

---

## Step 3: Layout reflow with AnimatePresence

- [ ] `frontend/src/app/desktop/components/AdminTodayScreen.tsx` — wrap pending list items in `motion.div` with `layout` + `AnimatePresence` so removed cards flow out and siblings reflow
- [ ] `frontend/src/app/components/TrainerNotes.tsx` — same for notes list (deleted notes animate out)

**Files**: 2 modified

---

## Step 4: Spring physics on overlays

- [ ] `frontend/src/app/shared/primitives/Modal.tsx` — replace CSS animation with `motion.div` spring entrance (scale 0.96→1 with spring damping/stiffness)
- [ ] `frontend/src/app/shared/primitives/Sheet.tsx` — replace CSS slide-up with `motion.div` spring (y: 100%→0 with slight overshoot)
- [ ] `frontend/src/app/components/BatchBookingMode.tsx` — bottom bar entrance uses `motion.div` with spring slide-up

**Files**: 3 modified

---

## Step 5: Card tilt on hover (useTilt hook)

- [ ] Create `frontend/src/app/shared/primitives/useTilt.ts` — returns `{ ref, style }`, calculates perspective rotateX/Y from mouse position, resets on leave, only active on `pointer: fine` devices
- [ ] `frontend/src/app/shared/primitives/Card.tsx` — integrate `useTilt` when `hoverable` prop is true + add inner glow on hover

**Files**: 2 files (1 new)

---

## Step 6: Shared element transition (layoutId)

- [ ] `frontend/src/app/desktop/components/SidebarRow.tsx` — wrap avatar in `motion.div` with `layoutId={`avatar-${customer.id}`}`
- [ ] `frontend/src/app/desktop/components/CustomerDetail.tsx` — wrap hero avatar in matching `motion.div layoutId`
- [ ] Wrap both in a shared `LayoutGroup` (from motion) in `AdminDashboardPage.tsx`

**Files**: 3 modified

---

## Step 7: Chart entrance animation

- [ ] `frontend/src/app/components/InbodyCharts.tsx` — ensure recharts `isAnimationActive={true}` and `animationDuration={800}` on all Line/Area components
- [ ] `frontend/src/app/components/BodyCompositionRing.tsx` — add `stroke-dashoffset` CSS animation on the arc paths (draw clockwise on mount)
- [ ] Add `@keyframes draw-arc` to `theme.css`

**Files**: 3 files

---

## Step 8: View Transitions API

- [ ] `frontend/src/app/App.tsx` (or router config) — wrap route navigation with `document.startViewTransition()` if available
- [ ] Add `::view-transition-old(root)` / `::view-transition-new(root)` CSS with crossfade in `theme.css`
- [ ] Progressive: no-op if `startViewTransition` is undefined

**Files**: 2 files

---

## Step 9: Notification bell ring

- [ ] Add `@keyframes bell-ring` to `theme.css` (15deg swing, 0.4s, once)
- [ ] `frontend/src/app/components/NotificationBell.tsx` — apply `.animate-bell-ring` class when `unreadCount` increases from a previous render
- [ ] `frontend/src/app/components/TrainerNotificationBell.tsx` — same

**Files**: 3 files

---

## Step 10: SVG empty-state illustrations

- [ ] Create `frontend/src/app/components/illustrations/` directory with 4 SVG components:
  - `DumbbellWobble.tsx` — dumbbell with CSS wobble (for "no bookings")
  - `ClipboardCheck.tsx` — clipboard with stroke-draw checkmark (for "all caught up")
  - `PersonStretching.tsx` — person stretching, static (for "no InBody data")
  - `BellSleep.tsx` — bell with zzz, static (for "no notifications")
- [ ] Add `@keyframes wobble` (gentle 2-frame tilt) and `@keyframes stroke-draw` (dashoffset) to `theme.css`
- [ ] Wire into empty states: `AdminTodayScreen`, `NotificationBell`, `TrainerNotificationBell`, `InbodyCharts`/`InbodySection`

**Files**: ~8 files (4 new SVG components, 4 modified to use them)

---

## Step 11: Gesture-driven toast dismiss

- [ ] `frontend/src/app/components/AdminBookings.tsx` — wrap toast in `motion.div` with `drag="y"` + `dragConstraints` + `onDragEnd` (dismiss if dragged >50px)
- [ ] `frontend/src/app/components/BookingCalendar.tsx` — same

**Files**: 2 modified

---

## Step 12: Verify & test

- [ ] `npm run build` — no errors, check bundle size delta
- [ ] `npm run test` — all pass
- [ ] Clean up `dist/`
- [ ] Confirm `prefers-reduced-motion` disables motion library animations too

**Files**: Test files as needed

---

## Summary

- **Total steps**: 12
- **New files**: ~8 (TypingIndicator, useTilt, 4 SVG illustrations, keyframes additions)
- **Modified files**: ~15 (ChatPanel, AdminTodayScreen, TrainerNotes, Modal, Sheet, BatchBookingMode, Card, SidebarRow, CustomerDetail, AdminDashboardPage, InbodyCharts, BodyCompositionRing, App.tsx, NotificationBell, TrainerNotificationBell, AdminBookings, BookingCalendar)
- **New dependency**: `motion` (~18kB gzip)
- **Backend changes**: 0

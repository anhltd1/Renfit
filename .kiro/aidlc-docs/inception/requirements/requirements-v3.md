# Requirements — Animation & Motion Polish (V3)

## Intent Analysis

- **User Request**: Add clean, efficient animations and smooth interactions across the app
- **Request Type**: Enhancement (UX polish, cross-cutting)
- **Scope**: Multiple components — all views, transitions, action feedback, overlays
- **Complexity**: Low-to-Moderate (CSS + one small hook, no new features or data models)
- **Constraints stated by user**:
  1. Clean and efficient — not flashy, never blocks the user
  2. Lightweight — easy to deploy, no heavy libraries
  3. Fits the existing dark-luxury design

---

## Functional Requirements

### FR-1: Motion Foundation (Duration Tokens + Reduced Motion)

- Define 3 CSS custom property duration tokens: `--motion-fast: 150ms`, `--motion-base: 250ms`, `--motion-slow: 400ms`
- All existing and new animations/transitions mapped to one of these three
- One entrance easing (`cubic-bezier(0.25, 0.46, 0.45, 0.94)`) and one exit easing (`ease-out`)
- Global `@media (prefers-reduced-motion: reduce)` block that disables all animation/transition durations

### FR-2: Tab & Panel Crossfade

- Dashboard tab switches (member: home/overview/chat/bookings; admin: today/clients/bookings) get a 200ms fade + 4px Y-offset entrance on the entering panel
- Replaces the current hard `display:none` cut
- No exit animation (exiting panel just hides) — only the entering panel fades in

### FR-3: Action Result Animations

- Booking approval/rejection on Today screen: card collapses (fade + height shrink + brief emerald/red flash)
- Note deletion: same collapse pattern
- Booking cancel from member calendar: same collapse
- Pattern: fade to 0 + `max-height` to 0 over `--motion-base`, triggering after the API succeeds

### FR-4: Number Count-Up

- Progress strip numbers (weight delta, BFM delta) count up from 0 to their value over ~400ms on first render
- Admin stat pills (Chờ/Duyệt/Từ chối) count up when data loads
- Implemented as a `useCountUp(target, duration)` hook using `requestAnimationFrame`
- No library — ~20 lines

### FR-5: Button Press Feedback

- `active:scale-[0.97]` on all primary action buttons (confirm, submit, approve, reject)
- Applied via a shared utility class or directly on the Button primitive
- Combines with existing haptic feedback for a physical feel

### FR-6: Skeleton-to-Content Crossfade

- When skeleton loading states resolve to real content: 150ms opacity crossfade
- Prevents the "instant pop" of content replacing skeletons
- Applied to: customer list, today screen, notes, notification dropdown

### FR-7: Modal Entrance

- `Modal` primitive: scale from 0.96 → 1 + opacity 0 → 1 over `--motion-base`
- Backdrop: opacity 0 → 1 over slightly longer (`--motion-slow`)
- Exit: reverse (faster — `--motion-fast`)
- `Sheet` already has `slide-up`; this only affects centered modals

### FR-8: Toast Slide Animation

- Toast enters: slide up 12px + fade in over `--motion-base`
- Toast exits: slide down 8px + fade out over `--motion-fast`
- Replaces current instant show/hide

### FR-9: Batch-Mode Slot Staging Bounce

- When a slot is staged in batch mode: brief scale 0.94 → 1 over `--motion-fast`
- Makes the painting gesture feel responsive on repeated taps

### FR-10: Kiosk "Now" Line Glow

- The time-indicator line in CalendarKiosk: a slow (3–4s cycle) opacity oscillation on the line's box-shadow only
- Very subtle — the dot itself stays solid
- This is the only intentionally slow/ambient animation in the app

---

## Non-Functional Requirements

### NFR-1: No External Animation Libraries

- All motion is CSS transitions, keyframes, and one `requestAnimationFrame` hook
- No framer-motion, react-spring, GSAP, or Lottie
- Total CSS addition budget: ~2kB; JS addition: ~1kB (count-up hook)

### NFR-2: GPU-Composited Properties Only

- Animated properties limited to `transform` and `opacity` (GPU-composited, no layout thrash)
- One exception: `max-height` for collapse animations on short lists only (≤10 items)

### NFR-3: Stagger Cap

- The existing `--stagger` fade-up animation is capped at 8 items max
- Never applied to the 5×13 calendar grid or any dataset exceeding ~10 rows

### NFR-4: Accessibility

- `@media (prefers-reduced-motion: reduce)` disables all animations globally
- No motion is required for the app to be usable — all animations are progressive enhancement

---

## Out of Scope

- Scroll-triggered reveal animations
- Parallax effects
- Animated illustrations / Lottie
- Celebration/confetti animations
- Route-level View Transitions API (deferred — browser support still partial)
- Any animation exceeding 400ms on a user-blocking path
- Stagger on the booking calendar grid cells

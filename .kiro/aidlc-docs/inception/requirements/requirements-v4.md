# Requirements — Advanced Animation & Interaction Polish (V4)

## Intent Analysis

- **User Request**: Add personality and delight to the app with external animation tools and richer micro-interactions
- **Request Type**: Enhancement (UX polish, visual character)
- **Scope**: Cross-cutting — AI Coach, booking calendar, empty states, cards, notifications, charts, route transitions
- **Complexity**: Moderate (one new dependency, multiple component touches, SVG assets)
- **Constraints**: Clean, lightweight, fits the dark-luxury design. No blocking or flashy behavior.

---

## Functional Requirements

### FR-1: Framer Motion (motion package) — Layout Animations

Add the `motion` package (tree-shakeable framer-motion) for capabilities CSS cannot replicate:
- **List reflow**: When a card is removed (booking approved, note deleted), remaining siblings animate into the gap using `AnimatePresence` + `layout` prop
- **Apply to**: Today screen pending list, TrainerNotes list, admin booking status changes

### FR-2: Shared Element Transition (layoutId)

- When clicking a member in the sidebar, their avatar + name morphs into the detail panel hero
- Uses `motion.div` with matching `layoutId` between sidebar row and detail hero
- Desktop only (mobile uses stack push which already has its own transition)

### FR-3: Spring Physics on Overlays

- `Sheet` bottom sheet: replace linear `slide-up` with a spring animation (slight overshoot + settle)
- `Modal`: replace CSS scale with spring entrance
- Batch booking bottom bar: spring slide-up entrance
- Uses motion's `spring` transition type

### FR-4: Gesture-Driven Interactions

- **Drag-to-dismiss on mobile toasts**: swipe down to dismiss early
- **Swipe-to-archive on mobile member card** (optional, if it feels natural): swipe left reveals "Đã nghỉ" action
- Uses motion's `drag` prop with `dragConstraints` and `onDragEnd`

### FR-5: AI Coach Typing Indicator (3-Dot Bounce)

- Replace the spinner + "AI đang suy nghĩ..." with a 3-dot bounce animation
- Three circles, 150ms stagger, bouncing vertically 4px
- Styled in emerald (`#0F6B3E`) on the glass bubble background
- Pure CSS keyframes — no library needed

### FR-6: Card Tilt on Hover (Desktop Glassmorphism)

- Cards (`Card` primitive) respond to mouse position with a subtle 1-2 degree tilt
- Creates a 3D glass-like depth effect
- Desktop only (disabled on touch devices via pointer media query)
- Implemented as a small `useTilt` hook (~15 lines) using `onMouseMove` + `transform: perspective(600px) rotateX() rotateY()`
- Includes subtle inner glow on hover: `box-shadow: inset 0 1px 0 rgba(255,255,255,0.1)`

### FR-7: Chart Entrance Animation

- **Recharts line charts**: enable `isAnimationActive={true}` (the built-in line-draw effect)
- **BodyCompositionRing**: SVG arcs animate clockwise using `stroke-dashoffset` on mount
- Zero additional kB — uses existing library feature + CSS

### FR-8: View Transitions API (Route Crossfade)

- Add View Transitions API to route navigation for a native crossfade between pages
- Progressive enhancement: browsers without support get instant navigation (current behavior)
- ~5 lines in the router configuration
- Applies to: login→dashboard, admin login→admin dashboard, landing→login

### FR-9: Notification Bell Ring

- When a new notification arrives (unread count increases), the bell icon does a quick 15-degree swing animation
- One-shot, triggered per new-notification event
- Pure CSS keyframes, ~4 lines

### FR-10: SVG Empty-State Illustrations

- Replace generic lucide icons in empty states with small themed SVG illustrations:
  - **No bookings today**: dumbbell with gentle CSS wobble
  - **All caught up (no pending)**: clipboard with checkmark stroke-draw
  - **No InBody data**: person stretching (static)
  - **No notifications**: bell with "zzz" (static)
- Inline SVGs themed to `#0F6B3E`, ~2-5kB each
- CSS animated where noted (wobble = 2-frame loop, checkmark = stroke-dasharray)

---

## Non-Functional Requirements

### NFR-1: Bundle Impact

- `motion` package: ~18kB gzipped (tree-shakes — only imported features are bundled)
- SVG illustrations: ~10-15kB total (4-5 small inline SVGs)
- All other items: CSS-only (0 additional JS kB)
- Total budget: ≤35kB gzipped additional

### NFR-2: Performance

- All animated properties remain GPU-composited (`transform`, `opacity`)
- Layout animations (framer) use FLIP technique internally — no forced reflows
- Card tilt uses `will-change: transform` on hover only (not permanently)
- `prefers-reduced-motion` from U18 continues to disable all of this

### NFR-3: Progressive Enhancement

- View Transitions: no-op in unsupported browsers
- Card tilt: disabled on touch devices (`@media (pointer: fine)`)
- Drag gestures: fallback to tap-to-dismiss if drag not supported
- All features degrade to the current (U18) behavior if motion library fails to load

---

## Out of Scope

- Lottie animations (too heavy for this app size)
- Scroll-triggered parallax
- Full-page animated transitions between every route (only key navigations)
- 3D card flip effects
- Animated mascot/character
- Sound effects

# Technical Design — Landing Page Redesign

## Overview

This document maps the 15 requirements to concrete implementation decisions: new files, modified
files, component APIs, CSS utilities, and implementation order. The landing page stays a single
responsive tree (no `useDevice()`) and introduces no new libraries.

---

## Architecture Diagram

```
frontend/src/
├── app/
│   ├── pages/
│   │   └── LandingPage.tsx          ← MODIFIED (recompose sections, add ClosingCTA, StickyCTA)
│   ├── components/
│   │   ├── landing/                  ← NEW directory (isolate landing-specific components)
│   │   │   ├── SectionAtmosphere.tsx ← NEW (R1)
│   │   │   ├── ClosingCTA.tsx        ← NEW (R2)
│   │   │   ├── StickyCTABar.tsx      ← NEW (R9)
│   │   │   └── useScrollSpy.ts      ← NEW (R8)
│   │   ├── Hero.tsx                  ← MODIFIED (R1, R3, R7, R11)
│   │   ├── About.tsx                 ← MODIFIED (R1, R3, R5, R7, R10, R11)
│   │   ├── Services.tsx              ← MODIFIED (R1, R3, R5, R7, R10, R11)
│   │   ├── AIChat.tsx                ← MODIFIED (R1, R3, R7, R10)
│   │   ├── Trainers.tsx              ← MODIFIED (R1, R3, R5, R6, R7, R10, R11)
│   │   ├── Navigation.tsx            ← MODIFIED (R2, R8)
│   │   ├── Footer.tsx                ← MODIFIED (R2, R12)
│   │   ├── Pricing.tsx               ← DELETED (R15)
│   │   └── Testimonials.tsx          ← DELETED (R15)
│   ├── shared/
│   │   ├── primitives/
│   │   │   ├── Card.tsx              ← MODIFIED (add `tier` prop: R10)
│   │   │   └── Card.test.tsx         ← NEW (R10, R13)
│   │   └── hooks/
│   │       ├── useInView.ts          ← NEW (R6)
│   │       └── useInView.test.ts     ← NEW (R13)
│   └── …
├── styles/
│   └── theme.css                     ← MODIFIED (add Glass_Tier utilities: R1, R14)
└── …
```

---

## Component Designs

### 1. SectionAtmosphere (new — R1)

**File:** `frontend/src/app/components/landing/SectionAtmosphere.tsx`

**Purpose:** Render the emerald radial glows + optional mask behind a section so that glass panes
have content to refract. One instance per section that uses a Glass_Tier surface.

```tsx
interface SectionAtmosphereProps {
  /** Number of emerald radial glows (1–3). Mobile caps at 2. */
  glows?: 1 | 2 | 3;
  /** Position seeds for the radial glows — each an {x%, y%} pair. */
  positions?: Array<{ x: number; y: number }>;
  /** Whether to render the subtle grid mask. Default: false. */
  mask?: boolean;
  className?: string;
}
```

Implementation:
- Renders absolutely positioned divs with `bg-[#0F6B3E]/10 rounded-full blur-[80px]` sized
  320–720px, placed via `top`/`left` percentages from `positions`.
- Optional grid mask: a `bg-[radial-gradient(...)]` at `opacity-[0.02]`.
- All wrapped in a single container: `absolute inset-0 overflow-hidden pointer-events-none`
  with `aria-hidden="true"`.
- On mobile (via responsive class `sm:hidden` for the 3rd glow): renders at most 2 glows.
- Static unless `prefers-reduced-motion` is **not** set, in which case a slow
  `animate-[drift_20s_ease-in-out_infinite]` is applied to the glow container (transform-only).
  This will be a new keyframe in `theme.css`:
  ```css
  @keyframes drift {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(12px, -8px); }
  }
  ```
  Duration 20s, using `--motion-slow` semantics (ambient only). Under `prefers-reduced-motion`,
  globally collapsed to `0.01ms` via the existing media block.

---

### 2. Card primitive — `tier` prop extension (R10)

**File:** `frontend/src/app/shared/primitives/Card.tsx`

New prop:

```tsx
export type GlassTier = 'ambient' | 'card' | 'elevated';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  compact?: boolean;
  /** Glass tier — controls backdrop blur and surface treatment. Default: 'card'. */
  tier?: GlassTier;
}
```

Class mapping:

| Tier | Classes |
|---|---|
| `ambient` | `bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10` (no blur) |
| `card` (default) | `bg-gradient-to-b from-white/[0.07] to-white/[0.02] backdrop-blur-[12px] border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]` |
| `elevated` | `bg-gradient-to-b from-white/[0.07] to-white/[0.02] backdrop-blur-[20px] border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]` |

The existing default (`bg-white/5 backdrop-blur-xl`) is **not changed** for call sites that don't
pass `tier`. Instead:
- When `tier` is omitted, the card renders exactly as today (backwards compatible).
- When `tier` is passed, it overrides the default background/blur.

This is enforced by the `cn()` merge (Tailwind Merge resolves conflicts, so `tier` classes will
win over the base classes when applied last).

---

### 3. useInView hook (new — R6)

**File:** `frontend/src/app/shared/hooks/useInView.ts`

```tsx
interface UseInViewOptions {
  /** IntersectionObserver threshold (0–1). Default: 0.15. */
  threshold?: number;
  /** Whether the hook should observe at all. Default: true. */
  enabled?: boolean;
}

function useInView<T extends HTMLElement = HTMLElement>(
  options?: UseInViewOptions
): { ref: React.RefObject<T | null>; isRevealed: boolean };
```

Behaviour:
1. Creates a `ref` to attach to the observed element.
2. On mount, checks `window.matchMedia('(prefers-reduced-motion: reduce)').matches`. If true,
   immediately sets `isRevealed = true` and never creates an observer.
3. If `IntersectionObserver` is unavailable (`typeof IntersectionObserver === 'undefined'`), or
   `window`/`document` are undefined (SSR/jsdom), immediately sets `isRevealed = true`.
4. Otherwise, creates an observer with `{ threshold }`. On the first intersection entry where
   `entry.isIntersecting`, sets `isRevealed = true` and calls `observer.unobserve(entry.target)`.
5. On unmount, disconnects the observer.
6. Returns `{ ref, isRevealed }`.

The component using the hook applies `animate-fade-up` and `--stagger` only when `isRevealed`
transitions to true:

```tsx
<div
  ref={ref}
  className={cn(
    'opacity-0 translate-y-2',
    isRevealed && 'animate-fade-up'
  )}
  style={{ '--stagger': index } as React.CSSProperties}
>
```

---

### 4. useScrollSpy hook (new — R8)

**File:** `frontend/src/app/components/landing/useScrollSpy.ts`

```tsx
function useScrollSpy(sectionIds: string[]): {
  activeId: string | null;
  isScrolled: boolean;
};
```

Behaviour:
- Uses `IntersectionObserver` with `threshold: [0, 0.3, 0.5, 0.7, 1.0]` to track how much of
  each section is visible.
- Maintains a map of `sectionId → visibleRatio`.
- `activeId` is the section with the largest ratio ≥ 0.3 that has held that position for ≥100ms
  (debounce via `requestAnimationFrame` + timestamp comparison).
- `isScrolled` is `true` when `window.scrollY > 24` (evaluated via a passive scroll listener
  throttled to `rAF`).
- Degrades: if `IntersectionObserver` unavailable, `activeId` stays `null`, `isScrolled` still
  works (scroll listener is standalone).

---

### 5. StickyCTABar (new — R9)

**File:** `frontend/src/app/components/landing/StickyCTABar.tsx`

```tsx
interface StickyCTABarProps {
  /** Whether the hero is still visible (hides the bar). */
  heroVisible: boolean;
}
```

- Renders a `<div>` fixed to the bottom with `elevated` Glass_Tier, safe-area padding, and
  a single `Button` (primary, navigating to `/login` or `/dashboard` depending on auth state).
- Visibility logic: hidden when `heroVisible || viewport ≥ 640px` (both checked via a media
  query class `sm:hidden` and the `heroVisible` prop).
- Entrance: `animate-slide-up` applied conditionally. Under reduced motion, renders in final state.
- Renders `null` (not `display: none`) when hidden — removes from DOM and accessibility tree.

The `heroVisible` boolean comes from `useInView` attached to the Hero section's root element.

---

### 6. ClosingCTA (new — R2)

**File:** `frontend/src/app/components/landing/ClosingCTA.tsx`

A simple section with a headline, a short copy line, and two `Button` primitives:
- Primary: "Bắt Đầu Hành Trình" → `/login`
- Secondary: "Gặp Đội Ngũ HLV" → `#trainers`

Wrapped in `SectionAtmosphere` for refraction depth.

---

### 7. Navigation.tsx modifications (R2, R8)

Changes:
1. Accept `activeId` and `isScrolled` from `useScrollSpy` (called in `LandingPage`, passed as
   props — or the hook is called inside `Navigation` directly since it has access to the DOM).
   Decision: call `useScrollSpy` inside `Navigation` since it already knows the section ids.
2. Background: conditionally apply `bg-transparent` when `!isScrolled` vs. `elevated` Glass_Tier
   classes when `isScrolled`. Transition via `transition-all duration-[var(--motion-base)]`.
3. Active anchor: `text-[#0F6B3E]` + `aria-current="true"` (programmatic indication for AT).
4. Inactive: `text-white/70`.
5. Mobile panel: collapse on anchor click within `--motion-fast`.

---

### 8. LandingPage.tsx rewrite (R2, R4, R9)

```tsx
export function LandingPage() {
  const heroRef = useRef<HTMLElement>(null);
  const { ref: heroInViewRef, isRevealed: heroGone } = useInView({ threshold: 0.01 });
  // heroVisible = !heroGone (invert logic)

  return (
    <div className="bg-[#0B0B0B] scroll-smooth overscroll-y-contain">
      <Navigation />
      <Hero ref={heroRef} />
      <About />
      <Services />
      <AIChat />
      <Trainers />
      <ClosingCTA />
      <Footer />
      <StickyCTABar heroVisible={!heroGone} />
    </div>
  );
}
```

Anchor `id`s move **onto the section component root elements** (e.g. `About` renders
`<section id="about" className="scroll-mt-24 ...">`) rather than wrapper `<section>` elements
in the page.

---

### 9. Mobile-first scale pass (R3) — applied to each section

This is a class-level change across all 7 section components. The pattern:

**Before (current):**
```tsx
<h2 className="text-5xl md:text-6xl font-bold ...">
```

**After:**
```tsx
<h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold leading-relaxed ...">
```

Complete mobile-first scale table:

| Element | Mobile (base) | sm (640) | lg (1024) | xl (1280) |
|---|---|---|---|---|
| Hero h1 | `text-3xl` (1.875rem) | `text-5xl` | `text-7xl` | `text-8xl` |
| Section h2 | `text-xl` (1.25rem) | `text-3xl` | `text-5xl` | — |
| Body/lede | `text-base` (1rem) | `text-lg` | `text-xl` | — |
| Section padding | `py-12 px-4` | `py-16 px-6` | `py-24 px-6` | — |
| Card padding | `p-4` (via `compact`) | — | `p-8` | — |
| Hero height | `min-h-[85svh]` | — | `min-h-screen` | — |
| Stat cards | 3-col strip | — | 3-col strip (larger) | — |
| Trainer photo | `aspect-[4/5]` | — | — | — |

---

### 10. Horizontal snap carousels (R5)

Applied to Services and Trainers on mobile via responsive classes:

```tsx
<div className="
  flex gap-4 overflow-x-auto snap-x snap-mandatory
  scrollbar-none -mx-4 px-4
  sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:snap-none sm:mx-0 sm:px-0
  lg:grid-cols-3
">
  {items.map((item, i) => (
    <div
      key={i}
      className="
        min-w-[75vw] snap-start shrink-0
        sm:min-w-0 sm:snap-align-none sm:shrink
      "
    >
      <Card tier="card" hoverable>...</Card>
    </div>
  ))}
</div>
```

The `scrollbar-none` utility hides the scrollbar (`scrollbar-width: none` +
`::-webkit-scrollbar { display: none }`). Already in `theme.css` via `scrollbar-width: thin` on
`*` — we'll add a `.scrollbar-none` utility or use the Tailwind v4 `scrollbar-none` class.

Keyboard: cards are not interactive by default (no `onClick`), but they are focusable via
`tabIndex={0}` at mobile only — on focus, the browser's native `scrollIntoView` behaviour
brings the card into view within the scroll track.

---

### 11. Hover hierarchy (R7)

| Designation | Elements | Hover treatment |
|---|---|---|
| **Primary** | Primary CTA buttons, Trainer cards | `hover:scale-105 hover:shadow-[0_0_30px_rgba(15,107,62,0.5)]` |
| **Secondary** | Service cards, nav anchors, footer links, secondary CTA | `hover:border-[#0F6B3E]/50 hover:-translate-y-0.5` (no scale, no glow) |

All get `active:scale-[0.97] active:duration-[var(--motion-fast)]` (press feedback).

---

### 12. Image performance (R11)

Each `<ImageWithFallback>` call gains:
- `width` + `height` attributes (intrinsic)
- `loading="lazy"` + `decoding="async"` (all except hero)
- `fetchpriority="high"` (hero only)
- `srcSet` with `w=640` and `w=1080` (or `w=400` + `w=800` for portraits)
- `sizes="(max-width: 640px) 100vw, 50vw"` (or appropriate breakpoint)
- Parent container: `aspect-[16/9]` (hero), `aspect-[4/3]` (about cards), `aspect-[4/5]`
  (trainer photos) — provides the slot before the image loads.

---

### 13. Footer link repair (R2, R15)

All `href="#"` links replaced:
- "Về Chúng Tôi" → `#about`
- "Dịch Vụ" → `#services`
- "Huấn Luyện Viên" → `#trainers`
- "Gói Thành Viên" → **removed** (no Pricing section)
- "Blog" → **removed** (no blog)
- "Chính Sách Bảo Mật" / "Điều Khoản Sử Dụng" → **removed** (no route)
- Social links (Facebook/Instagram/Youtube) → keep as `href="#"` but add `aria-label`
  (actual URLs are unknown; placeholder is acceptable for social links per R2 criterion 7 which
  says links must resolve to an anchor or route — social links are external, not in-page, so they
  get a real external URL or are removed). Decision: keep them with external placeholder URLs
  and `rel="noopener noreferrer"` + `aria-label`.
- "Personal Training" / "AI Fitness Coach" / etc. → `#services`
- "Tư Vấn Dinh Dưỡng" / "Giảm Cân" / "Tăng Cơ" → `#services`

---

### 14. Design system steering + DESIGN.md amendments (R14)

Two files edited:

**`.kiro/steering/design-system.md`** — append a new section:

```markdown
## Marketing-surface motion & glassmorphism tiers

**Public marketing surface** — any route reachable without an established customer/trainer identity
whose purpose is promotional (currently: Landing_Page at `/`).

**Scroll-triggered reveals** (IntersectionObserver-based `useInView` hook + `animate-fade-up`):
- Permitted on public marketing surfaces ONLY.
- One-time per element per page load; never re-fires on re-entry.
- Forbidden on authenticated surfaces.
- `useInView` + `animate-fade-up` is the ONLY permitted mechanism; any other reveal is rejected.

**Still forbidden everywhere** (including marketing): parallax, scroll-linked transforms, marquees,
cursor-following effects, celebration animations, animation library dependencies.

## Glass_Tier levels

| Tier | Backdrop blur | Background | Border | Inner highlight |
|---|---|---|---|---|
| `ambient` | none | `from-white/[0.04] to-white/[0.01]` | `border-white/10` | — |
| `card` | 12px | `from-white/[0.07] to-white/[0.02]` | `border-white/10` | `inset 0 1px 0 rgba(255,255,255,0.08)` |
| `elevated` | 20–24px | `from-white/[0.07] to-white/[0.02]` | `border-white/10` | `inset 0 1px 0 rgba(255,255,255,0.08)` |

Use via the `Card` primitive's `tier` prop.
```

**`frontend/rules/DESIGN.md`** — append the same Glass_Tier table and the motion token names
(`--motion-fast`, `--motion-base`, `--motion-slow`, `--motion-enter`) with their values into the
YAML front-matter and a corresponding prose section.

---

### 15. Test plan (R13)

| Test file | Assertions |
|---|---|
| `useInView.test.ts` | (a) revealed-once: mock `IntersectionObserver`, trigger entry, verify `isRevealed = true`, trigger leave, verify still `true`. (b) reduced-motion: mock `matchMedia` to return `matches: true`, verify `isRevealed = true` on first render. (c) missing IO: delete `IntersectionObserver` from global, verify no error and `isRevealed = true`. |
| `LandingPage.test.tsx` | (a) Every `Navigation` anchor with `href` starting `#` has a matching `id` in the rendered output. (b) Every Footer link resolves to a rendered `id` or a known route. (c) No import/reference to Pricing or Testimonials. |
| `Card.test.tsx` (extended) | fast-check property: for every `tier` in `['ambient', 'card', 'elevated']`, renders without error and produces a distinct class-name set from the other two. |

---

## Implementation Order (tasks)

The tasks are ordered to build foundations first, then layer features on top:

| # | Task | Requirements | Dependencies |
|---|---|---|---|
| 1 | Delete `Pricing.tsx`, `Testimonials.tsx`, clean imports | R15 | — |
| 2 | Amend `design-system.md` steering + `DESIGN.md` (Glass_Tier + motion carve-out) | R14 | — |
| 3 | Add `tier` prop to `Card` primitive + colocated test | R10 | — |
| 4 | Add `drift` keyframe + `.scrollbar-none` utility to `theme.css` | R1 | — |
| 5 | Create `useInView` hook + colocated test | R6, R13 | — |
| 6 | Create `SectionAtmosphere` component | R1 | 4 |
| 7 | Create `useScrollSpy` hook | R8 | — |
| 8 | Rewrite `Navigation.tsx` (scroll state + spy + scroll-mt) | R2, R8, R12 | 7 |
| 9 | Rewrite `Hero.tsx` (mobile-first, atmosphere, perf, reveal) | R1, R3, R6, R7, R11 | 5, 6 |
| 10 | Rewrite `About.tsx` (mobile-first, Card primitive, carousel, reveal) | R1, R3, R5, R6, R7, R10, R11 | 3, 5, 6 |
| 11 | Rewrite `Services.tsx` (mobile-first, Card, carousel, reveal) | R1, R3, R5, R6, R7, R10, R11 | 3, 5, 6 |
| 12 | Rewrite `AIChat.tsx` (mobile-first, Card, reveal) | R1, R3, R6, R7, R10 | 3, 5, 6 |
| 13 | Rewrite `Trainers.tsx` (mobile-first, Card, carousel, reveal, photo aspect) | R1, R3, R5, R6, R7, R10, R11 | 3, 5, 6 |
| 14 | Create `ClosingCTA.tsx` | R2 | 6 |
| 15 | Create `StickyCTABar.tsx` | R9 | 5 |
| 16 | Rewrite `Footer.tsx` (link repair, a11y) | R2, R12, R15 | 1 |
| 17 | Rewrite `LandingPage.tsx` (compose all, anchor ids, hero ref) | R2, R4 | 8–16 |
| 18 | Write `LandingPage.test.tsx` (nav anchors, footer links) | R13 | 17 |
| 19 | Final verification: `npm run build` + `npm run test` + manual CLS/contrast check | R13 | 18 |

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| `backdrop-blur` jank on low-end Android | Cap live blurred elements to 6 per viewport (R1.7), demote surplus to `ambient`. Manual scroll test on a mid-range device. |
| Carousel keyboard a11y | `tabIndex={0}` on cards at mobile only; browser natively scrolls focused element into view. Test with VoiceOver/TalkBack. |
| Hero content overflow at 320px | Explicitly test at 320px viewport after each Hero change; stats strip uses `text-xs` and truncation-free layout (three equal columns with `min-w-0`). |
| useInView IntersectionObserver threshold rounding | Use `0.15` rather than edge values. No dwell requirement per R6.1. |
| Scroll-spy thrashing | 100ms debounce + 30% visible threshold before declaring active (R8.3). |
| Existing test breakage from Card prop addition | `tier` defaults to unchanged behaviour when omitted; fast-check property test covers all three tiers. |

---

## Manual Verification Procedures (R13.8)

| Check | Viewport | Threshold | Procedure |
|---|---|---|---|
| CLS | 390px × 844px | ≤ 0.1 | Chrome DevTools → Lighthouse → Performance, throttled to Slow 4G; record CLS from the trace. |
| Text contrast | 390px + 1440px | 7:1 body, 4.5:1 large | Chrome DevTools → Rendering → CSS Overview → Contrast issues. Spot-check with axe DevTools. |
| Font size | 390px | ≥ 14px body, ≤ 30px h1 | Chrome DevTools → Computed styles on each heading and body text element. |

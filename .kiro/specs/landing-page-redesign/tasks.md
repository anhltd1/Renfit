# Implementation Tasks

## Task 1: Delete Pricing and Testimonials components
- [ ] Delete `frontend/src/app/components/Pricing.tsx`
- [ ] Delete `frontend/src/app/components/Testimonials.tsx`
- [ ] Remove imports from `LandingPage.tsx`
- [ ] Remove "Gói Thành Viên" and "Blog" links from Footer
- [ ] Verify no remaining references via grep
- [ ] Run `npm run build` in `frontend/`

Requirements: R15

---

## Task 2: Amend design system steering and DESIGN.md
- [ ] Add "Marketing-surface motion & glassmorphism tiers" section to `.kiro/steering/design-system.md`
- [ ] Define public marketing surface classification test
- [ ] Document Glass_Tier levels (ambient/card/elevated) with token values
- [ ] Document scroll-reveal carve-out (permitted on marketing, forbidden on authenticated)
- [ ] Add same Glass_Tier table and motion token names to `frontend/rules/DESIGN.md` YAML + prose
- [ ] Verify no contradiction between the two files

Requirements: R14

---

## Task 3: Extend Card primitive with `tier` prop
- [ ] Add `GlassTier` type and `tier` prop to `Card` interface
- [ ] Implement class mapping for `ambient`, `card`, `elevated` tiers
- [ ] Ensure omitted `tier` preserves existing default rendering (backwards compatible)
- [ ] Write/extend `Card.test.tsx` with fast-check property test for all three tiers
- [ ] Run `npm run test` to verify

Requirements: R10, R13

---

## Task 4: Add CSS utilities to theme.css
- [ ] Add `@keyframes drift` (slow ambient glow movement, transform-only)
- [ ] Add `.animate-drift` utility class using `--motion-slow`
- [ ] Add `.scrollbar-none` utility (hide scrollbar on carousel tracks)
- [ ] Verify existing reduced-motion block covers the new keyframe
- [ ] Run `npm run build`

Requirements: R1

---

## Task 5: Create useInView hook
- [ ] Create `frontend/src/app/shared/hooks/useInView.ts`
- [ ] Implement IntersectionObserver with configurable threshold (default 0.15)
- [ ] Handle reduced-motion: skip observation, return revealed immediately
- [ ] Handle missing IntersectionObserver: return revealed immediately
- [ ] Handle SSR/jsdom (window/document undefined): return revealed immediately
- [ ] Clean up observer on unmount
- [ ] Create colocated `useInView.test.ts` with three core assertions
- [ ] Run `npm run test`

Requirements: R6, R13

---

## Task 6: Create SectionAtmosphere component
- [ ] Create `frontend/src/app/components/landing/SectionAtmosphere.tsx`
- [ ] Implement 1–3 emerald radial glows with configurable positions
- [ ] Implement optional grid/dot mask at ≤0.02 opacity
- [ ] Add `aria-hidden="true"`, `pointer-events-none`
- [ ] Apply mobile cap (max 2 glows via responsive classes)
- [ ] Apply `animate-drift` when reduced-motion is not active
- [ ] Test renders without errors

Requirements: R1

---

## Task 7: Create useScrollSpy hook
- [ ] Create `frontend/src/app/components/landing/useScrollSpy.ts`
- [ ] Track section visibility ratios via IntersectionObserver
- [ ] Implement 100ms debounce for active section determination
- [ ] Implement `isScrolled` via passive scroll listener + rAF
- [ ] Degrade gracefully when IntersectionObserver unavailable
- [ ] Test basic operation

Requirements: R8

---

## Task 8: Rewrite Navigation.tsx
- [ ] Integrate `useScrollSpy` for active anchor state + scroll background
- [ ] Transparent bg when not scrolled → elevated Glass_Tier when scrolled
- [ ] Active anchor: `text-[#0F6B3E]` + `aria-current="true"`
- [ ] Add `scroll-mt-24` guidance (via scroll-to behavior with offset)
- [ ] Mobile panel: collapse on anchor click within `--motion-fast`
- [ ] Use `Button` primitive for CTA actions
- [ ] Verify keyboard focus rings preserved

Requirements: R2, R8, R12

---

## Task 9: Rewrite Hero.tsx
- [ ] Add `SectionAtmosphere` behind hero content
- [ ] Mobile-first type scale: `text-3xl sm:text-5xl lg:text-7xl` for h1
- [ ] Mobile height: `min-h-[85svh] lg:min-h-screen`
- [ ] Stats: 3-col horizontal strip at all breakpoints (compact on mobile)
- [ ] Stats cards use `Card` primitive with `tier="card"` and `compact`
- [ ] Hero image: add `fetchpriority="high"`, `width`, `height`, `srcSet`, `sizes`
- [ ] Logo: `h-14 sm:h-20 lg:h-24`
- [ ] Add entrance reveal with `useInView` on content wrapper
- [ ] Forward ref for hero visibility tracking (StickyCTABar)
- [ ] Use `Button` primitive for any CTA
- [ ] Touch feedback: `active:scale-[0.97]`

Requirements: R1, R3, R6, R7, R11

---

## Task 10: Rewrite About.tsx
- [ ] Add `id="about"` and `scroll-mt-24` on root section element
- [ ] Add `SectionAtmosphere`
- [ ] Mobile-first type/spacing scale
- [ ] Replace hand-rolled cards with `Card` primitive (`tier="card"`)
- [ ] Replace buttons with `Button` primitive
- [ ] Add entrance reveal (`useInView` + stagger on feature cards)
- [ ] Image performance: `loading="lazy"`, `decoding="async"`, `srcSet`, aspect ratios
- [ ] Hover hierarchy: secondary treatment (border + translate, no scale/glow)
- [ ] Use `cn()` for all class composition
- [ ] Cap backdrop-blur elements to 6 per viewport height

Requirements: R1, R3, R5, R6, R7, R10, R11

---

## Task 11: Rewrite Services.tsx
- [ ] Add `id="services"` and `scroll-mt-24` on root section element
- [ ] Add `SectionAtmosphere`
- [ ] Mobile-first type/spacing scale
- [ ] Mobile horizontal snap carousel (flex + snap-x + scrollbar-none)
- [ ] Desktop: grid `sm:grid-cols-2 lg:grid-cols-3`
- [ ] Replace hand-rolled cards with `Card` primitive (`tier="card"`)
- [ ] Add entrance reveal with stagger (cap at 6)
- [ ] Hover hierarchy: secondary treatment
- [ ] Touch feedback: `active:scale-[0.97]` on cards (via Card hoverable)
- [ ] Use `cn()` for all class composition

Requirements: R1, R3, R5, R6, R7, R10, R11

---

## Task 12: Rewrite AIChat.tsx
- [ ] Retain existing atmosphere orbs (already has substrate — enhance with SectionAtmosphere)
- [ ] Mobile-first type/spacing scale
- [ ] Replace chat panel container with `Card` primitive (`tier="elevated"`)
- [ ] Replace CTA button with `Button` primitive
- [ ] Add entrance reveal on the chat panel
- [ ] Hover hierarchy: primary on main CTA
- [ ] Use `cn()` for all class composition

Requirements: R1, R3, R6, R7, R10

---

## Task 13: Rewrite Trainers.tsx
- [ ] Add `id="trainers"` and `scroll-mt-24` on root section element
- [ ] Add `SectionAtmosphere`
- [ ] Mobile-first type/spacing scale
- [ ] Trainer photos: `aspect-[4/5]` instead of fixed `h-80`
- [ ] Mobile horizontal snap carousel
- [ ] Desktop: grid `sm:grid-cols-2 lg:grid-cols-4`
- [ ] Replace hand-rolled cards with `Card` primitive (`tier="card"`)
- [ ] Add entrance reveal with stagger (cap at 4)
- [ ] Hover hierarchy: primary treatment on trainer cards
- [ ] CTA button: wire to `/login` using `Button` primitive, or remove if no destination
- [ ] Image performance: `loading="lazy"`, `decoding="async"`, `srcSet`, aspect ratios
- [ ] Use `cn()` for all class composition

Requirements: R1, R3, R5, R6, R7, R10, R11

---

## Task 14: Create ClosingCTA section
- [ ] Create `frontend/src/app/components/landing/ClosingCTA.tsx`
- [ ] Add `SectionAtmosphere`
- [ ] Headline + copy in Vietnamese
- [ ] Primary `Button`: "Bắt Đầu Hành Trình" → `/login`
- [ ] Secondary `Button`: "Gặp Đội Ngũ HLV" → `#trainers`
- [ ] Mobile-first spacing
- [ ] Entrance reveal

Requirements: R2

---

## Task 15: Create StickyCTABar
- [ ] Create `frontend/src/app/components/landing/StickyCTABar.tsx`
- [ ] Fixed bottom, `elevated` Glass_Tier, safe-area padding
- [ ] Hidden when hero visible OR viewport ≥ 640px (renders null)
- [ ] Entrance: `animate-slide-up` (respects reduced motion)
- [ ] Single `Button` primary: "Đặt Lịch Ngay" → `/login` (or "Vào trang chủ" → `/dashboard` if authenticated)
- [ ] Reserve bottom spacing on document when visible
- [ ] Touch target ≥ 44px
- [ ] Not in accessibility tree when hidden

Requirements: R9

---

## Task 16: Rewrite Footer.tsx
- [ ] Replace all `href="#"` with real anchors or routes
- [ ] Remove "Gói Thành Viên" and "Blog" links
- [ ] Social links: add `aria-label` for each (Vietnamese accessible names)
- [ ] Service links → `#services`
- [ ] Quick links → their respective anchors
- [ ] Remove "Chính Sách Bảo Mật" / "Điều Khoản Sử Dụng" (no routes exist)
- [ ] Vietnamese typography: `leading-relaxed` on all text
- [ ] Heading levels: ensure no skipped level from rest of page
- [ ] Use `cn()` for class composition

Requirements: R2, R12, R15

---

## Task 17: Rewrite LandingPage.tsx
- [ ] Remove wrapper `<section id="...">` elements (ids move to component roots)
- [ ] Compose: Navigation → Hero → About → Services → AIChat → Trainers → ClosingCTA → Footer → StickyCTABar
- [ ] Pass hero visibility ref to StickyCTABar
- [ ] Remove Pricing/Testimonials imports (already done in T1)
- [ ] No `useDevice()` import, no desktop/mobile imports
- [ ] Verify single responsive tree
- [ ] Verify lazy-load still works in App.tsx

Requirements: R2, R4

---

## Task 18: Write LandingPage integration tests
- [ ] Create `frontend/src/app/pages/LandingPage.test.tsx`
- [ ] Assert: every nav anchor `href="#..."` has a matching `id` in rendered output
- [ ] Assert: count of asserted anchors > 0
- [ ] Assert: every Footer link resolves to rendered id or known route
- [ ] Assert: no Footer link has `href="#"` (bare fragment)
- [ ] Assert: no reference to Pricing or Testimonials
- [ ] Run `npm run test`

Requirements: R13

---

## Task 19: Final verification
- [ ] Run `npm run build` — zero errors, zero new warnings
- [ ] Run `npm run test` — all pass
- [ ] Manual: check CLS at 390px viewport (Lighthouse) — target ≤ 0.1
- [ ] Manual: check contrast at 390px + 1440px (axe DevTools)
- [ ] Manual: check font sizes at 390px (computed styles)
- [ ] Manual: check no horizontal overflow at 320px, 375px, 640px, 1024px, 1280px
- [ ] Clean up `frontend/dist/` if created

Requirements: R13

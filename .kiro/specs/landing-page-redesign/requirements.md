# Requirements Document

## Introduction

The Renfit marketing landing page (`frontend/src/app/pages/LandingPage.tsx` and its nine section
components) is the last surface in the application that never received the DESIGN.md conformance
pass, the mobile-first rebuild, the shared-primitives migration, or the motion-token adoption. It
was explicitly out of scope for both prior AI-DLC initiatives.

Investigation confirmed four classes of defect:

1. **Structure** — `Testimonials` and `Pricing` are imported but never rendered (dead sections);
   every `Footer` link is `href="#"`; the `Trainers` call-to-action has no handler; anchor targets
   have no `scroll-margin-top` so anchor jumps land beneath the fixed navigation bar; the page ends
   on a dead button with no closing call-to-action.
2. **Flat glassmorphism** — glass surfaces apply `backdrop-blur` over the solid `#0B0B0B` page
   background. With nothing behind the pane, blur renders no visible refraction, so approximately
   fifteen elements pay GPU cost to produce a flat five-percent white tint. `AIChat` is the one
   section with a blurred substrate behind its glass and is measurably the best-looking section.
3. **Mobile oversizing** — desktop values were authored as the base and `md:` only scales upward.
   At a 375 px viewport the hero headline renders at 48 px, every section headline at 48 px, every
   section carries 96 px of vertical padding, cards carry a 32 px inset inside a 327 px card, and
   trainer photographs are fixed at 320 px tall stacked four deep. The page is approximately nine
   viewport heights of scroll on a phone.
4. **Motion and performance** — all motion is `hover:`-only, so the page is entirely static on
   touch devices; uniform `scale-105` plus emerald glow on every card removes visual hierarchy;
   eight remote images load without `loading="lazy"` or intrinsic dimensions, causing layout shift
   and a heavy mobile first paint.

This feature redesigns the landing page to be mobile-first, to make glassmorphism read as genuine
depth, to introduce restrained token-based motion that works on touch, and to repair the broken
information architecture — without touching the backend, without adding libraries, and without
altering the established colour palette.

## Glossary

- **Landing_Page**: The public marketing route at `/`, composed of the navigation bar, the hero,
  the content sections, and the footer.
- **Section_Component**: Any one of `Hero`, `About`, `Services`, `AIChat`, `Trainers`,
  `Closing_CTA`, `Footer`.
- **Navigation_Bar**: The fixed top navigation rendered by `Navigation.tsx`.
- **Section_Atmosphere**: A new presentational substrate component rendered behind a
  Section_Component, providing blurred emerald radial glows, a low-opacity white dot mask, and
  optional grain, so that glass panes above it have content to refract.
- **Glass_Tier**: One of three defined glassmorphism levels — `ambient`, `card`, `elevated` — each
  with a fixed blur radius, background gradient, border, and inner highlight.
- **Motion_System**: The set of motion utilities and tokens already defined in
  `frontend/src/styles/theme.css`, plus the new reveal hook defined by this feature.
- **Reveal_Hook**: A new hook (`useInView`) wrapping `IntersectionObserver`, used to trigger a
  one-time entrance animation when an element scrolls into view.
- **Sticky_CTA_Bar**: A glass bar fixed to the bottom of the mobile viewport containing the primary
  conversion action, shown after the hero has left the viewport.
- **Design_Tokens**: The values defined in `frontend/rules/DESIGN.md` and mirrored as CSS custom
  properties in `frontend/src/styles/theme.css`.
- **Shared_Primitives**: The component library at `frontend/src/app/shared/primitives/`
  (`Button`, `Card`, `Input`, `Modal`, `Sheet`, `Toast`, `Tabs`, `Skeleton`, `useCountUp`).
- **Reduced_Motion_Preference**: The user agent state reported by the
  `prefers-reduced-motion: reduce` media query.
- **Mobile_Viewport**: A viewport narrower than 640 px (below the Tailwind `sm` breakpoint).
- **Desktop_Viewport**: A viewport of 1024 px or wider (the Tailwind `lg` breakpoint and above).

## Resolved Decisions

All four decisions have been resolved by the product owner. They are recorded here because they
constrain the design phase.

**Decision 1 — Scroll-triggered reveal motion: permit, with a steering amendment.**
`.kiro/steering/design-system.md` currently states "No scroll-triggered reveals, parallax, or
celebration animations". That rule was authored for the authenticated application. It will be
amended with a marketing-surface carve-out permitting one-time scroll-triggered entrance reveals
built from the existing `animate-fade-up` utility and a hand-written `IntersectionObserver` hook.
Parallax, scroll-linked transforms, celebration animation, and animation libraries remain forbidden
on every surface including this one. See Requirement 6 and Requirement 14.

**Decision 2 — Pricing and Testimonials: delete both.** `Pricing.tsx` and `Testimonials.tsx` are
removed along with their imports. No `#pricing` navigation anchor is added, and the Footer's
"Gói Thành Viên" link is omitted. See Requirement 2 and Requirement 15.

**Decision 3 — Scope: full restructure.** Section order, a new closing call-to-action section,
and repaired Footer and Trainers links are all in scope. See Requirements 2 and 10.

**Decision 4 — Device split: single responsive tree.** The Landing_Page remains one responsive-CSS
tree and does not consume `useDevice()`, on the grounds that a marketing page benefits more from a
small single bundle than from two divergent trees. See Requirement 4.

---

## Requirements

### Requirement 1: Layered Glassmorphism With A Refraction Substrate

**User Story:** As a prospective member visiting the landing page, I want surfaces to read as
genuine layered glass, so that the page feels like the premium private gym it advertises.

#### Acceptance Criteria

1. WHEN a Section_Component that contains at least one Glass_Tier surface is rendered, THE
   Landing_Page SHALL render exactly one Section_Atmosphere as that section's first painted layer,
   sized to the full width and full height of the section, positioned behind all section content and
   behind every Glass_Tier surface in that section, and contributing zero change to the layout
   position or size of any sibling content.
2. THE Section_Atmosphere SHALL compose its substrate from between one and three emerald radial
   glows, each with a rendered diameter between 320px and 720px, each transitioning from
   `rgba(15, 107, 62, 0.10)` at its centre to fully transparent at its edge, each carrying a blur
   radius of at least 64px, plus at most one white dot or grid mask at an opacity of 0.02 or lower,
   and SHALL use no colour value outside the Design_Tokens palette.
3. THE Section_Atmosphere SHALL render with `aria-hidden="true"`, SHALL accept no pointer events,
   SHALL expose no focusable element, and SHALL contribute no text content to the accessibility
   tree.
4. THE Landing_Page SHALL define exactly three Glass_Tier levels named `ambient`, `card`, and
   `elevated`, where `ambient` applies a backdrop blur radius of 0px (no backdrop blur), `card`
   applies a backdrop blur radius of 12px, and `elevated` applies a backdrop blur radius between
   20px and 24px inclusive.
5. THE `card` Glass_Tier SHALL apply a background gradient from `rgba(255, 255, 255, 0.07)` to
   `rgba(255, 255, 255, 0.02)`, a `1px` border at `rgba(255, 255, 255, 0.10)`, and an inner top
   highlight of `inset 0 1px 0 rgba(255, 255, 255, 0.08)`.
6. THE `elevated` Glass_Tier SHALL apply a backdrop blur radius at least 8px greater than the
   backdrop blur radius of the `card` Glass_Tier.
7. WHERE a Section_Component would render more than six simultaneously visible backdrop-blurred
   elements within one viewport height at either Mobile_Viewport or Desktop_Viewport, THE
   Section_Component SHALL demote surplus surfaces to the `ambient` Glass_Tier in reverse DOM order,
   starting from the last such surface, until six or fewer backdrop-blurred elements remain visible
   within that viewport height.
8. THE Landing_Page SHALL apply `#0B0B0B` as the page background colour and `#0F6B3E` as the sole
   emerald accent value.
9. IF the Reduced_Motion_Preference is enabled, THEN THE Section_Atmosphere SHALL render as a static
   layer with no animated transform, opacity, position, or size change, while retaining its emerald
   radial glows and mask at the opacities defined in criterion 2.
10. IF the browser does not support backdrop blur, THEN each Glass_Tier surface SHALL render its
    background gradient, border, and inner top highlight unchanged over the `#0B0B0B` page
    background, and SHALL retain a contrast ratio of at least 4.5:1 between its body text and its
    rendered background.
11. WHERE the Landing_Page is rendered at Mobile_Viewport, THE Section_Atmosphere SHALL render at
    most two emerald radial glows, and THE Section_Component SHALL render at most three
    simultaneously visible backdrop-blurred elements within one viewport height.

---

### Requirement 2: Repaired Information Architecture

**User Story:** As a prospective member, I want the page to present a complete and coherent story
ending in a clear next step, so that I know how to become a member.

#### Acceptance Criteria

1. THE Landing_Page SHALL render every Section_Component that it imports, such that the count of
   imported Section_Components equals the count of Section_Components present in the rendered
   output, with zero imported-but-unrendered Section_Components.
2. THE Landing_Page SHALL render exactly the following seven Section_Components, once each, in this
   top-to-bottom document order: Hero, About, Services, AIChat, Trainers, Closing_CTA, Footer.
3. THE Closing_CTA SHALL render exactly two actions: one primary action labelled in Vietnamese that
   navigates to the `/login` route, and one secondary action labelled in Vietnamese that navigates
   to the `#trainers` anchor target on the Landing_Page.
4. THE Navigation_Bar SHALL render exactly three in-page anchors, targeting `#about`, `#services`,
   and `#trainers`, each labelled in Vietnamese, and each resolving to a Section_Component rendered
   on the Landing_Page.
5. THE Landing_Page SHALL declare the `id` attribute of each anchor target (`about`, `services`,
   `trainers`) on the root element of the corresponding Section_Component, and SHALL declare no
   anchor-target `id` on a wrapper element that is not that Section_Component's root element.
6. WHEN an in-page anchor is activated, THE Landing_Page SHALL scroll the target Section_Component
   so that the top edge of the target's root element renders at least 96px (`6rem`) below the top of
   the viewport, measured after scrolling settles, at both Mobile_Viewport and Desktop_Viewport
   widths, so that no part of the target heading is obscured by the Navigation_Bar.
7. THE Footer SHALL resolve every rendered link to either an in-page anchor whose target
   Section_Component is rendered on the Landing_Page, or one of the existing application routes
   (`/`, `/login`, `/signup`, `/dashboard`, `/admin/login`), with zero rendered links whose
   destination is a placeholder or empty fragment (`#`).
8. IF a Footer destination has no corresponding rendered Section_Component anchor target and no
   corresponding existing application route, THEN THE Footer SHALL omit that link from the rendered
   output rather than render it as inert or disabled.
9. WHEN the Trainers Section_Component call-to-action is activated by pointer click or by keyboard
   (Enter or Space), THE Landing_Page SHALL navigate to a destination that is either a rendered
   in-page anchor target or an existing application route.
10. IF the Trainers Section_Component call-to-action has no defined destination, THEN THE Trainers
    Section_Component SHALL render no call-to-action element.
11. THE Landing_Page SHALL render no Section_Component whose backing module has been removed,
    including Testimonials and Pricing, and SHALL retain zero imports referencing them.

---

### Requirement 3: Mobile-First Type And Spacing Scale

**User Story:** As a prospective member browsing on a phone, I want text and spacing sized for my
screen, so that I can read the page without excessive scrolling.

#### Acceptance Criteria

1. THE Landing_Page SHALL declare the smallest value of every responsive type and spacing utility
   as the unprefixed base class, and SHALL declare larger values only under the `sm`, `lg`, or `xl`
   breakpoint prefixes, such that no unprefixed type or spacing utility on any Section_Component
   resolves to a larger computed value than the same utility resolves to at a Desktop_Viewport.
2. WHILE rendering at a Mobile_Viewport of width 375 px, THE Hero_Section SHALL render its headline
   at a computed font size of at least `1.5rem` and at most `1.875rem`, at a computed line height of
   at least 1.5 times that font size, and wrapped onto at most 3 rendered lines.
3. WHILE rendering at a Mobile_Viewport of width 375 px, THE Landing_Page SHALL render every section
   heading of every Section_Component at a computed font size of at least `1.25rem` and at most
   `1.5rem`, and at a computed line height of at least 1.5 times that font size.
4. WHILE rendering at a Mobile_Viewport, THE Landing_Page SHALL apply to every Section_Component a
   vertical section padding of at least `2rem` and at most `3.5rem` per edge, and a horizontal
   section padding of at least `0.75rem` and at most `1rem` per edge.
5. WHILE rendering at a Mobile_Viewport, THE Landing_Page SHALL apply to every card inside any
   Section_Component an inset padding of at least `0.75rem` and at most `1.25rem` on all four edges.
6. THE Trainers Section_Component SHALL constrain every trainer photograph by a single fixed aspect
   ratio between 3:4 and 1:1 inclusive, with rendered height derived from rendered width, and SHALL
   declare no fixed pixel height on the photograph element at any breakpoint.
7. WHILE rendering at a Mobile_Viewport, THE Hero_Section SHALL constrain its own height to at most
   `85svh`, and SHALL render all of its own content (logo, headline, lede, statistics, and any call
   to action) within that height without clipping and without an inner scroll region.
8. WHILE rendering at a Mobile_Viewport of width 320 px, THE Hero_Section SHALL render its three
   statistics as a single horizontal strip of three equal-width columns on one row, with each
   statistic value and label fully visible without truncation, ellipsis, or overflow.
9. WHILE rendering at a Mobile_Viewport of 375 px by 667 px, THE Landing_Page SHALL render its full
   content, from the top of the Hero_Section through the end of the Footer Section_Component, within
   a total document scroll height of at most 4002 px (six viewport heights).
10. WHILE rendering at each viewport width of 320 px, 375 px, 640 px, 768 px, 1024 px, 1280 px, and
    1536 px, THE Landing_Page SHALL render all content within the viewport width, such that the
    document scroll width does not exceed the viewport width and no horizontal scrollbar is
    presented.
11. WHILE rendering at a Mobile_Viewport, THE Landing_Page SHALL render every body text element,
    including the Hero_Section lede, at a computed font size of at least `0.875rem` and at most
    `1.125rem`, and at a computed line height of at least 1.5 times that font size.
12. THE Landing_Page SHALL render every Vietnamese text string in its authored letter case, applying
    no uppercase text transformation and authoring no all-capitals text, in every Section_Component
    at every breakpoint.
13. IF a text string in any Section_Component would exceed the width of its container at a viewport
    width of 320 px, THEN THE Landing_Page SHALL wrap that string onto additional lines within the
    container without clipping, truncation, or horizontal overflow.

---

### Requirement 4: Single Responsive Tree

**User Story:** As a developer maintaining the marketing surface, I want one component tree for all
devices, so that the landing bundle stays small and the two device experiences cannot diverge.

#### Acceptance Criteria

1. THE Landing_Page SHALL mount the identical set of Section_Component modules at every viewport
   width from 320 px to 2560 px, SHALL mount and unmount no Section_Component as a function of
   viewport width, and SHALL define exactly one implementation module per Section_Component.
2. THE Landing_Page SHALL adapt to viewport width solely through responsive utility class prefixes,
   container queries, and CSS media queries, and SHALL contain no call to `useDevice()` and no read
   of `DeviceProvider` state in any of its own modules.
3. THE Landing_Page SHALL import no module from `frontend/src/app/desktop/` or
   `frontend/src/app/mobile/`, either directly or transitively through a module it imports.
4. THE modules under `frontend/src/app/desktop/` and `frontend/src/app/mobile/` SHALL import no
   Landing_Page module and no Section_Component module.
5. THE Landing_Page SHALL remain a lazily loaded route so that its modules and its
   Section_Component modules are excluded from the application's initial chunk.
6. IF a Section_Component requires presentation or behaviour that differs by viewport width, input
   modality, or pointer capability, THEN THE Section_Component SHALL express that difference through
   a CSS media query, container query, or responsive utility prefix, and SHALL NOT branch on a
   JavaScript device determination.

---

### Requirement 5: Mobile Horizontal Carousels For Card Collections

**User Story:** As a prospective member browsing on a phone, I want to swipe through service and
trainer cards, so that I can survey the options without scrolling past six full-width blocks.

#### Acceptance Criteria

1. WHILE rendering at a Mobile_Viewport, THE Services Section_Component SHALL present all 6 of its
   cards in a single horizontally scrollable track with mandatory scroll snapping on the horizontal
   axis and each card snapping to the leading edge of the track.
2. WHILE rendering at a Mobile_Viewport, THE Trainers Section_Component SHALL present all 4 of its
   cards in a single horizontally scrollable track with mandatory scroll snapping on the horizontal
   axis and each card snapping to the leading edge of the track, each card retaining its image,
   name, specialty, experience, and certification chips.
3. WHILE rendering a horizontally scrollable track at a Mobile_Viewport, THE Section_Component SHALL
   size each card to between 70% and 85% of the viewport width, with a minimum card width of 240px,
   such that at least 24px of the following card is visible at the trailing edge of the viewport for
   every card except the last.
4. WHILE rendering at a Desktop_Viewport, THE Services and Trainers Section_Components SHALL present
   their cards in a multi-column grid of at least 3 columns, with no horizontal scrolling and no
   scroll snapping.
5. THE horizontally scrollable track SHALL expose every card to keyboard focus in document order, and
   WHEN a card receives keyboard focus, THE Section_Component SHALL scroll that card fully into view
   within the track.
6. THE horizontally scrollable track SHALL render no visible horizontal scrollbar while remaining
   scrollable by touch swipe, trackpad, and keyboard, and SHALL NOT set any overflow value that
   prevents horizontal scrolling.
7. WHILE rendering at a viewport width from 640px up to but excluding 1024px, THE Services and
   Trainers Section_Components SHALL present their cards in a multi-column grid of 2 columns with no
   horizontal scroll track.
8. WHERE a Reduced_Motion_Preference is enabled, THE horizontally scrollable track SHALL perform all
   scroll-position changes without animated transition, and SHALL remain fully scrollable and
   snappable.
9. IF a Section_Component has fewer than 2 cards to render at a Mobile_Viewport, THEN THE
   Section_Component SHALL render the single card at full track width with no trailing peek and with
   no horizontal scrolling.

---

### Requirement 6: Entrance Reveal Motion

**User Story:** As a prospective member scrolling the page, I want content to arrive with a subtle
entrance, so that the page feels crafted rather than static.

#### Acceptance Criteria

1. WHEN at least fifteen percent of an observed element's area has intersected the viewport, THE
   Reveal_Hook SHALL report that element as revealed on the next observer callback, on both
   Mobile_Viewport and Desktop_Viewport, with no minimum dwell time required.
2. WHEN the Reveal_Hook reports an element as revealed, THE Section_Component SHALL apply the
   existing `animate-fade-up` utility to that element, using the existing `--motion-base` duration
   token (250ms) and the existing `--motion-enter` easing token, and SHALL leave the element in its
   final visible state (full opacity, untransformed) after the animation completes.
3. THE Reveal_Hook SHALL report each element as revealed at most once per page load, SHALL stop
   observing that element once it has been reported as revealed, and SHALL NOT return the element to
   a hidden state when the element leaves the viewport again.
4. THE Section_Component SHALL assign `--stagger` index values 0 through 7 to at most the first
   eight elements of a revealed group, and SHALL assign the index value 7 to every element beyond the
   eighth in that group, such that no element's reveal is delayed by more than seven stagger steps.
5. THE Reveal_Hook SHALL animate only the `opacity` and `transform` properties, and SHALL animate no
   layout-affecting property including `height`, `width`, `top`, `left`, `margin`, and `padding`.
6. IF the Reduced_Motion_Preference (`prefers-reduced-motion: reduce`) is set at the time the
   Reveal_Hook initialises, THEN THE Reveal_Hook SHALL report every observed element as revealed
   immediately, SHALL register no viewport observation, and SHALL cause every element to render in
   its final visible state (full opacity, untransformed) with no entrance animation and no stagger
   delay.
7. IF `IntersectionObserver` is unavailable in the host environment, THEN THE Reveal_Hook SHALL
   report every observed element as revealed on first render, SHALL throw no error, and SHALL cause
   every element to render in its final visible state (full opacity, untransformed) with no entrance
   animation.
8. THE Landing_Page SHALL introduce no animation library dependency, and SHALL implement all
   entrance motion using only the existing CSS animation utilities and motion tokens already defined
   in the project stylesheet.
9. THE Landing_Page SHALL implement no parallax effect, no scroll-linked transform, no marquee, no
   cursor-following effect, and no celebration animation.
10. IF the Reveal_Hook executes in an environment where `window` or `document` is undefined, THEN THE
    Reveal_Hook SHALL complete its initial render without throwing an error and SHALL report every
    observed element as revealed.
11. WHEN a component using the Reveal_Hook unmounts, THE Reveal_Hook SHALL release all viewport
    observations it created and SHALL invoke no further reveal state updates for that component.

---

### Requirement 7: Touch And Hover Interaction Feedback

**User Story:** As a prospective member on a touch device, I want visible feedback when I tap, so
that I can tell the page is responding to me.

#### Acceptance Criteria

1. WHEN a user presses any interactive element on the Landing_Page (nav anchor, nav button, primary
   CTA, secondary CTA, service card, trainer card, footer link, or social icon link), THE
   Landing_Page SHALL apply a press-state transform of `scale(0.97)` to that element, and WHEN the
   press is released or cancelled, THE Landing_Page SHALL restore the element to `scale(1)`.
2. WHEN a press-state transform begins or ends, THE Landing_Page SHALL complete that transform in
   exactly the `--motion-fast` duration (150ms), animating only the `transform` property.
3. WHEN a pointer that supports hover enters an element designated as primary (the primary CTA and
   the trainer cards), THE Landing_Page SHALL apply a hover transform of `scale(1.05)` to the
   element container together with the emerald glow shadow, over the `--motion-base` duration
   (250ms), and no more than 3 element types on the Landing_Page SHALL be designated as primary.
4. WHEN a pointer that supports hover enters an element designated as secondary (the six service
   cards, nav anchors, footer links, social icon links, and the secondary CTA), THE Landing_Page
   SHALL apply a hover treatment consisting only of a border-colour change and a vertical
   `translateY` of at most `2px`, with no scale transform and no glow shadow, over the
   `--motion-base` duration (250ms).
5. THE Landing_Page SHALL apply no scale transform to any text element; scale transforms SHALL be
   applied only to container elements (cards, buttons, and link wrappers).
6. THE Landing_Page SHALL select every transition duration exclusively from `--motion-fast` (150ms),
   `--motion-base` (250ms), or `--motion-slow` (400ms), SHALL define no additional duration values,
   and SHALL not exceed `--motion-slow` (400ms) for any feedback on a blocking path.
7. WHEN an entrance transition runs, THE Landing_Page SHALL apply `--motion-enter`
   (`cubic-bezier(0.25, 0.46, 0.45, 0.94)`) as its easing curve, and WHEN an exit transition runs,
   THE Landing_Page SHALL apply `ease-out` as its easing curve.
8. WHEN any interactive element on the Landing_Page receives keyboard focus, THE Landing_Page SHALL
   render a focus ring of `2px solid #0F6B3E` at `2px` offset that remains visible for the whole
   duration the element holds focus, and THE Landing_Page SHALL never remove or suppress this focus
   ring for any interactive element.
9. WHILE the Reduced_Motion_Preference is enabled, THE Landing_Page SHALL suppress all scale,
   translate, and entrance transforms, SHALL retain the focus ring and the border-colour hover
   change unchanged, and SHALL leave every interactive element reachable and operable.
10. IF an interactive element on the Landing_Page is in a disabled or non-actionable state, THEN THE
    Landing_Page SHALL apply neither the press-state transform nor the hover treatment to that
    element, and SHALL leave its rendered position and scale unchanged.

---

### Requirement 8: Navigation Bar Scroll State And Section Tracking

**User Story:** As a prospective member scrolling the page, I want the navigation bar to show where
I am, so that I can orient myself and jump between sections.

#### Acceptance Criteria

1. WHILE the vertical scroll offset of the Landing_Page is less than or equal to `8px`, THE
   Navigation_Bar SHALL render with a fully transparent background, no backdrop blur, and no bottom
   border, while continuing to render all of its anchors and its auth-dependent content.
2. WHEN the vertical scroll offset of the Landing_Page exceeds `24px`, THE Navigation_Bar SHALL
   render with the `elevated` Glass_Tier and a bottom border at `rgba(255, 255, 255, 0.10)`, and
   SHALL transition between the transparent and `elevated` appearances over `--motion-base` (250ms);
   the `elevated` appearance SHALL persist for all scroll offsets greater than `8px` so that scroll
   offsets between `8px` and `24px` never cause the appearance to alternate more than once.
3. WHILE exactly one Section_Component occupies the largest share of the viewport with at least
   `30%` of the viewport height visible, and that section has been the largest-share section
   continuously for at least `100ms`, THE Navigation_Bar SHALL render that section's anchor
   (`#about`, `#services`, or `#trainers`) in the active state and SHALL render every other anchor
   in the inactive state; IF two or more Section_Components share an equal largest visible share,
   THEN THE Navigation_Bar SHALL treat the section closest to the top of the viewport as active; IF
   no Section_Component with a corresponding anchor meets the `30%` threshold, THEN THE
   Navigation_Bar SHALL render every anchor in the inactive state.
4. THE Navigation_Bar SHALL render the active anchor with text colour `#0F6B3E` and with a
   programmatic current-item indication exposed to assistive technology, SHALL render inactive
   anchors as `text-white/70` with a `#0F6B3E` hover colour, and SHALL retain a visible focus ring
   on every anchor when focused via keyboard.
5. WHEN a user activates a Navigation_Bar anchor, THE Landing_Page SHALL scroll the corresponding
   Section_Component so that its heading is positioned between `72px` and `96px` below the top of
   the viewport, and SHALL leave the heading fully visible and not overlapped by the
   Navigation_Bar at rest.
6. IF the Reduced_Motion_Preference is set to reduce, THEN THE Landing_Page SHALL complete anchor
   navigation as a single instantaneous position change within `150ms` of activation, without
   intermediate animated scrolling, while still applying the heading offset defined in criterion 5.
7. IF `IntersectionObserver` is unavailable in the browser, THEN THE Navigation_Bar SHALL render
   every anchor in the inactive state, SHALL keep anchor activation and scrolling behaviour as
   defined in criteria 5 and 6, and SHALL still apply the scroll-state appearance defined in
   criteria 1 and 2.
8. WHILE the user is scrolling the Landing_Page, THE Navigation_Bar SHALL evaluate its scroll state
   and active anchor at most once per animation frame, and SHALL NOT change the Landing_Page
   document height, content offset, or the visibility state of any revealed Section_Component.
9. WHILE the viewport is a Mobile_Viewport and the expanded menu panel is open, THE Navigation_Bar
   SHALL apply the active and inactive anchor styling defined in criterion 4 to the panel anchors,
   and WHEN a user activates an anchor in the panel, THE Navigation_Bar SHALL collapse the panel
   within `--motion-fast` (150ms) before or during the scroll defined in criterion 5.

---

### Requirement 9: Mobile Sticky Conversion Bar

**User Story:** As a prospective member reading the page on a phone, I want the booking action to
stay reachable, so that I can act without scrolling back to the top.

#### Acceptance Criteria

1. WHILE rendering at a Mobile_Viewport AND WHEN zero percent of the Hero_Section area remains
   intersecting the viewport, THE Sticky_CTA_Bar SHALL render fixed to the bottom edge of the
   viewport, stacked above all other Landing_Page content so that no Section_Component overlaps it.
2. WHILE at least one percent of the Hero_Section area is intersecting the viewport, THE
   Landing_Page SHALL hide the Sticky_CTA_Bar such that it is absent from the accessibility tree and
   contains no keyboard-focusable element reachable by sequential tab navigation.
3. THE Sticky_CTA_Bar SHALL render using the `elevated` Glass_Tier.
4. WHEN the Sticky_CTA_Bar becomes visible, THE Sticky_CTA_Bar SHALL enter using the existing
   `animate-slide-up` utility over the `--motion-base` duration of 250ms with the `--motion-enter`
   easing, animating only the `opacity` and `transform` properties.
5. THE Sticky_CTA_Bar SHALL add `env(safe-area-inset-bottom)` to its bottom padding so that its
   interactive content remains fully visible on devices reporting a non-zero bottom inset.
6. THE Sticky_CTA_Bar SHALL render exactly one primary action, with a Vietnamese label, a minimum
   touch target of 44px by 44px, that navigates to `/login` in a single activation.
7. WHILE rendering at a viewport width of 640px or greater, including a Desktop_Viewport, THE
   Landing_Page SHALL hide the Sticky_CTA_Bar such that it is absent from the accessibility tree and
   contains no keyboard-focusable element reachable by sequential tab navigation.
8. IF the Reduced_Motion_Preference is set to reduce, THEN THE Sticky_CTA_Bar SHALL appear directly
   in its final visible state with no entrance animation, including for motion driven from
   JavaScript.
9. WHILE the Sticky_CTA_Bar is visible, THE Landing_Page SHALL reserve bottom spacing at the end of
   the document equal to the rendered height of the Sticky_CTA_Bar plus the bottom safe-area inset,
   so that no Footer content is obscured and every Landing_Page element remains scrollable into
   view above the bar.
10. WHERE the visitor is already authenticated, THE Sticky_CTA_Bar SHALL render its single primary
    action with the label "Vào trang chủ" navigating to `/dashboard` instead of `/login`.

---

### Requirement 10: Shared Primitive Adoption

**User Story:** As a developer maintaining the frontend, I want the landing page to use the shared
component library, so that it cannot drift from the rest of the application again.

#### Acceptance Criteria

1. THE Landing_Page SHALL render every button and every button-role control — Navigation_Bar
   actions, primary and secondary calls-to-action, the Sticky_CTA_Bar action, and the Closing_CTA
   actions — using the `Button` Shared_Primitive, and SHALL declare no locally authored class string
   that reproduces the `Button` primitive's pill shape, variant background, hover scale, glow
   shadow, or `active:scale-[0.97]` press state.
2. THE Landing_Page SHALL render every glass content container — including service cards, trainer
   cards, statistic panels, and the Sticky_CTA_Bar surface — using the `Card` Shared_Primitive with
   an explicitly selected Glass_Tier, and SHALL declare no locally authored `backdrop-blur`,
   glass background gradient, or glass border class string outside the Shared_Primitives.
3. THE Landing_Page SHALL compose every conditional or merged class name using the `cn` helper
   imported from the Shared_Primitives, and SHALL use no string concatenation, template literal, or
   array `join` to assemble class names.
4. WHERE the Landing_Page requires a Glass_Tier or variant that no Shared_Primitive supports, THE
   Shared_Primitives SHALL be extended with that variant as a named prop value rather than the class
   string being reimplemented inside a Section_Component, and every existing call site of the
   extended primitive SHALL retain its rendered output unchanged when that prop is omitted.
5. THE Shared_Primitives SHALL import no module from `frontend/src/app/desktop/`,
   `frontend/src/app/mobile/`, or `frontend/src/app/pages/`.
6. IF a Section_Component requires a link destination rather than a button action, THEN THE
   Section_Component SHALL render an anchor element carrying the same press-state and focus-indicator
   treatment as the `Button` Shared_Primitive rather than a `Button` wrapping an anchor.
7. THE Shared_Primitives SHALL have a colocated test file asserting, for each Glass_Tier value added
   under criterion 4, that the `Card` Shared_Primitive renders that tier's blur, border, and
   background treatment, and that the default rendering is unchanged.

---

### Requirement 11: Image Loading Performance

**User Story:** As a prospective member on a mobile connection, I want the page to paint quickly and
not shift under my finger, so that I can start reading immediately.

#### Acceptance Criteria

1. THE Landing_Page SHALL declare, for each of its remote images, both an explicit intrinsic
   `width` and `height` attribute pair and a CSS aspect ratio on the image's rendered box, such
   that the box occupies its final layout area before the image bytes arrive.
2. WHEN a Section_Component other than the Hero_Section renders an image, THE Landing_Page SHALL
   apply `loading="lazy"` and `decoding="async"` to that image, where "other than the Hero_Section"
   is the complete set of below-the-fold images (the About cards and the trainer portraits) and the
   Hero_Section background image is the only image excluded.
3. THE Landing_Page SHALL apply `fetchpriority="high"` to the Hero_Section background image only,
   and SHALL apply neither `loading="lazy"` nor `fetchpriority="high"` to any other image.
4. THE Landing_Page SHALL declare, for every remote image, a `srcset` containing at least two
   candidates whose smallest candidate is no wider than 640 px, together with a `sizes` attribute
   whose Mobile_Viewport branch resolves to no more than 640 px.
5. THE Landing_Page SHALL produce a cumulative layout shift score of at most 0.1 measured on a
   production build at a 375 px × 812 px viewport with network throttling set to a 1.6 Mbps
   downlink and 150 ms round-trip latency, over the interval from navigation start until 5 seconds
   after the page reaches a fully loaded state, with no user interaction during that interval; this
   measurement is a manual verification step, and the automated test suite SHALL instead assert the
   presence of the attributes required by criteria 1 through 4 on every rendered image as a proxy.
6. IF a remote image fails to load, THEN THE Landing_Page SHALL render the existing
   `ImageWithFallback` placeholder in place of that image, SHALL occupy the same layout box
   dimensions as the successfully loaded image would have occupied so that the failure contributes
   no additional layout shift, SHALL retain a non-empty text alternative for assistive technology,
   and SHALL NOT retry the failed request.
7. WHILE the Landing_Page is rendering at a Mobile_Viewport, THE Landing_Page SHALL request no more
   than 250 KB of total image bytes before the Hero_Section reaches its fully painted state.
8. IF an image referenced by the Landing_Page has not finished loading, THEN THE Landing_Page SHALL
   render a visible non-content placeholder background within that image's reserved box rather than
   collapsing the box to zero height.

---

### Requirement 12: Vietnamese Typography And Accessibility

**User Story:** As a Vietnamese-speaking visitor, and as a visitor using assistive technology, I
want text that renders correctly and controls I can reach by keyboard, so that the page is usable
for me.

#### Acceptance Criteria

1. THE Landing_Page SHALL render every user-facing string in Vietnamese, except for proper nouns and
   brand or product terms, which SHALL be limited to the Renfit brand name and the service and
   feature names "Personal Training", "AI Fitness Coach", "Strength & Conditioning", and
   "AI Coach"; any string outside this exception list SHALL be Vietnamese.
2. THE Landing_Page SHALL apply a computed line height of at least 1.5 times the computed font size
   to every element whose text content is a Vietnamese word, phrase, heading, label, or paragraph,
   including headings, body copy, button labels, form labels, and Footer text.
3. THE Landing_Page SHALL render every Vietnamese string in its authored letter case, and SHALL
   apply no case-transforming text style to any element containing a Vietnamese string.
4. THE Landing_Page SHALL render every text element other than headings at a computed font size of
   at least `0.875rem`.
5. WHEN a focusable element receives keyboard focus, THE Landing_Page SHALL render a `2px` solid
   `#0F6B3E` focus indicator at a `2px` offset around that element, and THE Landing_Page SHALL NOT
   suppress or override that indicator for any focusable element in any Section_Component,
   Navigation_Bar, or Sticky_CTA_Bar.
6. THE Landing_Page SHALL target a measured contrast ratio of at least 7:1 against the rendered
   background for every text element with a computed font size below `1.125rem`, and at least 4.5:1
   for every text element with a computed font size of `1.125rem` or larger, measured against the
   composited background actually behind the text; these ratios are measurable targets and do not
   constitute a claim of WCAG certification.
7. THE Landing_Page SHALL render exactly one `h1` element, located in the Hero Section_Component.
8. THE Landing_Page SHALL declare heading levels in document order such that each heading level is
   at most one level deeper than the nearest preceding heading, with no skipped level, across every
   Section_Component including About, Services, AIChat, Trainers, Closing_CTA, and Footer.
9. THE Landing_Page SHALL provide a non-empty Vietnamese accessible name for every informative image
   and for every icon-only control, including each Footer social link for Facebook, Instagram, and
   Youtube.
10. WHERE an element is decorative and conveys no information not already present in adjacent text,
    including every Section_Atmosphere layer and every decorative image, THE Landing_Page SHALL mark
    that element `aria-hidden` and SHALL exclude it from keyboard focus order.
11. WHERE text is rendered at the `text-white/40` tier, THE Landing_Page SHALL restrict that text to
    supplementary labels whose information is also conveyed by an adjacent text element that meets
    the ratio required by criterion 6, and SHALL NOT use that tier for headings, body prose, control
    labels, or error text.
12. WHEN a visitor traverses the page using only the keyboard, THE Landing_Page SHALL expose every
    interactive control in Navigation_Bar, every Section_Component, and, on Mobile_Viewport, the
    Sticky_CTA_Bar, in an order matching their visual reading order, with no control reachable only
    by pointer input.

---

### Requirement 13: Verification

**User Story:** As a developer, I want the redesign covered by the project's existing verification
gate, so that regressions surface before review.

#### Acceptance Criteria

1. WHEN `npm run build` is executed in `frontend/`, THE Landing_Page SHALL compile and typecheck with
   zero errors and zero new warnings relative to the pre-change baseline, and the command SHALL exit
   with a success status.
2. WHEN `npm run test` is executed in `frontend/`, THE Landing_Page test suite SHALL report zero
   failed and zero skipped tests, and the command SHALL exit with a success status.
3. THE Reveal_Hook SHALL have a test file colocated in the same directory as the hook source and
   named after it with a `.test.ts` or `.test.tsx` suffix, containing at minimum one assertion for
   each of the following three behaviours: (a) after the observed element has intersected once, the
   revealed state remains true across at least one subsequent non-intersecting observer callback;
   (b) WHILE Reduced_Motion_Preference is enabled, the hook reports the revealed state on first
   render without any observer callback; (c) IF `IntersectionObserver` is absent from the test
   environment global scope, THEN the hook reports the revealed state on first render and throws no
   error.
4. THE Landing_Page SHALL have a test file colocated in the same directory as the Landing_Page source
   asserting that, for every rendered Navigation_Bar anchor whose `href` begins with `#`, an element
   with the matching `id` exists in the rendered output, and that the count of asserted anchors is
   greater than zero.
5. THE Landing_Page SHALL have a colocated test file asserting that every rendered Footer link
   resolves either to a rendered Section_Component `id` (for `href` values beginning with `#`) or to
   a path present in the application's declared route set, and that no Footer link resolves to
   neither.
6. THE Landing_Page changes SHALL leave every file under `backend/` byte-identical to its
   pre-change state, and the backend pytest suite SHALL NOT be executed as part of this feature's
   verification gate.
7. THE Landing_Page SHALL have at least one fast-check property test asserting that, for every
   generated Glass_Tier value drawn from the set `ambient`, `card`, `elevated`, the `Card`
   Shared_Primitive renders without error and emits exactly one class-name token distinct from the
   tokens emitted for the other two tiers.
8. THE requirements set SHALL classify each of cumulative layout shift, text contrast ratio, and
   rendered font size as manually verified rather than unit-tested, and SHALL define for each a
   manual procedure stating the viewport widths to check (one Mobile_Viewport width of `390px` and
   one Desktop_Viewport width of `1440px`), the pass threshold, and the observable result recorded
   by the verifier; unit tests for these three concerns SHALL assert only the presence of the
   corresponding markup or class-name proxy and SHALL NOT assert measured layout values.
9. WHEN ad hoc verification of the Landing_Page completes, THE developer SHALL remove the
   `frontend/dist/` directory and any other build or coverage artifact created solely for that
   verification, leaving the working tree free of untracked verification output.

---

### Requirement 14: Design System Steering Amendment

**User Story:** As a developer, I want the motion rules to state where scroll reveals are permitted,
so that this redesign and future reviews agree on what is allowed.

#### Acceptance Criteria

1. THE `.kiro/steering/design-system.md` file SHALL state that one-time scroll-triggered entrance
   reveals are permitted on public marketing surfaces, where "one-time" is defined as firing at most
   once per element per page load and never re-firing when the element re-enters the viewport.
2. THE `.kiro/steering/design-system.md` file SHALL state that scroll-triggered reveals are
   forbidden on authenticated surfaces, defined as any surface reachable only after a customer or
   trainer identity has been established.
3. THE `.kiro/steering/design-system.md` file SHALL state that parallax, scroll-linked transforms,
   marquees, cursor-following effects, celebration animations, and animation library dependencies
   remain forbidden on every surface, including public marketing surfaces.
4. THE `.kiro/steering/design-system.md` file SHALL name the Reveal_Hook combined with the existing
   `animate-fade-up` utility as the only permitted mechanism for scroll-triggered reveals, and SHALL
   state that any other reveal mechanism is rejected in review.
5. THE `.kiro/steering/design-system.md` file SHALL record all three Glass_Tier level names
   (`ambient`, `card`, `elevated`) together with, for each level, its backdrop-blur value
   (`ambient` = none, `card` = 12px, `elevated` = 20–24px) and, for the `card` tier, its background
   gradient, border, and inner top highlight values.
6. THE `frontend/rules/DESIGN.md` file SHALL record the same Glass_Tier level names and values as
   `.kiro/steering/design-system.md`, and SHALL record the four Motion_System token names
   (`--motion-fast`, `--motion-base`, `--motion-slow`, `--motion-enter`) with their values, so that
   the authoritative Design_Tokens source states the vocabulary the steering file distills.
7. THE `.kiro/steering/design-system.md` file SHALL define "public marketing surface" by an
   unambiguous classification test, namely a surface served on a route reachable without an
   established customer or trainer identity and whose purpose is promotional rather than
   task-completion, and SHALL name Landing_Page as an instance that satisfies the test.
8. IF any statement in `.kiro/steering/design-system.md` contradicts `frontend/rules/DESIGN.md` on
   Motion_System rules, Glass_Tier values, or Section_Atmosphere vocabulary after the amendment,
   THEN the amendment SHALL be treated as incomplete and the contradicting steering statement SHALL
   be replaced with the `frontend/rules/DESIGN.md` wording.

---

### Requirement 15: Removal Of Unrendered Sections

**User Story:** As a developer maintaining the frontend, I want the never-rendered marketing sections
gone, so that the landing surface contains no dead code.

#### Acceptance Criteria

1. THE Landing_Page SHALL contain no import statement naming `Pricing` or `Testimonials`, and
   SHALL contain no JSX element rendering either Section_Component.
2. THE repository SHALL contain no `Pricing.tsx` or `Testimonials.tsx` module under
   `frontend/src/app/components/`, and SHALL contain no colocated test file, type-definition file,
   or asset file whose only consumer before the removal was one of those two modules.
3. THE repository SHALL contain zero occurrences of the case-sensitive identifiers `Pricing` and
   `Testimonials`, and zero occurrences of the module paths ending in `components/Pricing` or
   `components/Testimonials`, across all files under `frontend/src/` including test files,
   as confirmed by a repository-wide text search.
4. THE Footer SHALL omit the "Gói Thành Viên" link and every other link whose destination before
   the removal was one of the two removed Section_Components, while retaining all Footer links
   whose destinations still exist.
5. WHEN `npm run build` is executed in `frontend/` after the removal, THE Landing_Page SHALL
   compile with a zero exit status and zero TypeScript errors, and WHEN `npm run test` is executed
   in `frontend/`, THE frontend test suite SHALL report zero failing tests.
6. THE Landing_Page SHALL contain no navigation anchor, link, or scroll target whose fragment
   identifier is `#pricing` or `#testimonials`.
7. THE frontend SHALL preserve every route, page, and rendered Section_Component other than the two
   removed modules unchanged, such that the set of routed paths and the ordered list of
   Section_Components rendered by the Landing_Page after the removal is identical to the set and
   list before the removal minus nothing, since neither removed module was rendered.
8. THE repository SHALL contain no archived, commented-out, or renamed copy of the removed
   Section_Components' content, with recovery of that content available solely through version
   control history.

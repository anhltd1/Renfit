---
inclusion: fileMatch
fileMatchPattern: ["frontend/**/*.tsx", "frontend/src/styles/**/*.css"]
---

# Design System (derived from frontend/rules/DESIGN.md)

`frontend/rules/DESIGN.md` is the **authoritative** source (YAML tokens + prose rationale). This
file distills it into actionable rules for day-to-day component work. If they ever disagree,
`DESIGN.md` wins — update this file to match, don't diverge from it.

## Tokens (use exactly — never invent new shades)
| Token | Value / Tailwind |
|---|---|
| Background | `#0B0B0B` → `bg-[#0B0B0B]` (or `bg-black` for sidebars) |
| Primary (emerald) — **fills only** | `#0F6B3E` → `bg-[#0F6B3E]`, `bg-[#0F6B3E]/20`, `border-[#0F6B3E]/30` (2.99:1 — never text/thin icons) |
| Primary text — green foreground | `#3DBE7A` → `text-[#3DBE7A]`, icons, focus ring (8.29:1) |
| Error text | `#f87171` → `text-[#f87171]` (`#ef4444` for fills/icons only) |
| Glass surface | `bg-white/5 backdrop-blur-sm` (or `backdrop-blur-xl` for elevated panels) |
| Border | `border-white/10` |
| Text primary / secondary / tertiary | `text-white` / `text-white/60`–`/70` / `text-white/40` — `/60` is the minimum for informational text; `/40` is decoration only (placeholder, disabled); `/20`–`/35` are not text colors |
| Hover glow | `hover:shadow-[0_0_30px_rgba(15,107,62,0.5)]` |
| Font | Be Vietnam Pro (via `theme.css`; fallback Inter) |
| Radius | pill (`rounded-full`) for buttons; `rounded-3xl` (~24px) for cards; `rounded-2xl` for inputs |

## Components
**Primary button** (pill + glow, hover scale 1.05):
```tsx
<button className="px-8 py-4 bg-[#0F6B3E] hover:bg-[#0F6B3E]/90 text-white rounded-full font-semibold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(15,107,62,0.5)]">
```
**Secondary button**: `bg-white/10 hover:bg-white/20 text-white rounded-full border border-white/20`

**Card (glassmorphism — required, never a solid background)**:
```tsx
<div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-[#0F6B3E]/50 transition-all duration-300 hover:scale-105">
```
Minimum padding `p-6`–`p-8`. Anti-pattern: `bg-gray-900`/`bg-zinc-900` solid cards.

**Input**:
```tsx
className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#0F6B3E] transition-colors leading-relaxed"
```

**Navigation** — active item: `text-[#0F6B3E] bg-[#0F6B3E]/20 rounded-xl px-4 py-3`; inactive:
`text-white/70 hover:text-[#0F6B3E] hover:bg-white/5`.

**Prefer the shared primitives** (`frontend/src/app/shared/primitives/`) — `Button`, `Card`,
`Input`, `Modal`, `Sheet`, `Toast`, `Tabs` — over re-deriving these class strings by hand. Use
`Modal` on desktop and `Sheet` on mobile for the same "overlay action" concern (per the approved
mobile navigation pattern — bottom sheets replace centered modals on mobile).

## AI Coach chat UI
- User bubble: `bg-[#0F6B3E] text-white rounded-2xl rounded-br-sm`, right-aligned.
- Assistant bubble: `bg-white/10 border border-white/10 rounded-2xl rounded-bl-sm`, left-aligned,
  labeled "AI Coach" with a `Bot` icon in `#0F6B3E`.
- **Artifacts** render below the assistant's text, one per turn, from `ChatResponse.artifact` —
  never fabricated client-side, never an inline editable form (see backend-architecture.md).
- Tone: professional Vietnamese, "bạn", ≤3 paragraphs, minimal emoji, safety disclaimers for health topics.

## Layout & spacing
- **8px grid** — use Tailwind's spacing scale (`p-4`, `gap-6`, `py-24`); avoid arbitrary px values.
- Section: `py-24 px-6` wrapping `max-w-7xl mx-auto`. Reading width: `max-w-3xl mx-auto`.
- Mobile-first grids: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.
- Breakpoints: `sm` 640 / `md` 768 / `lg` 1024 / `xl` 1280 / `2xl` 1536.

## Vietnamese typography (non-negotiable)
- Be Vietnam Pro (falls back to Inter) — never swap fonts without Vietnamese diacritic support.
- `leading-relaxed` (line-height ≥ 1.5) on all Vietnamese text — prevents accent clipping.
- **Never `uppercase`** on Vietnamese text — breaks diacritics.
- Body text minimum `text-sm` (14px). Absolute minimum anywhere `text-xs` (12px) — no
  `text-[10px]` / `text-[11px]`.
- `tabular-nums` on times, counts and measurements.

## Booking status visual language
Colour + icon + label, always (DESIGN.md `booking_status`). Never a colour-only pill or a
`title`-only status.

| Status | Label | Colour | Icon (lucide) | Notes |
|---|---|---|---|---|
| `pending` | Chờ duyệt | warning `#f59e0b` | `Clock` | stands out |
| `approved` | Đã duyệt | `#3DBE7A` | `CalendarCheck` | solid border; must not rely on the today-column green |
| `completed` | Đã tập | `white/60` | `CheckCheck` | recedes |
| `no_show` | Vắng | `#f87171` | `UserX` | stands out |
| `rejected` | Từ chối | `white/60` | `X` | dashed border + line-through, recedes |

Keep one shared status-meta map; don't redefine per component.

## Operations surfaces (PT dashboard)
DESIGN.md "Operations Surfaces" overrides the generic component rules on trainer screens:
- Flat `ambient` tier (no blur) for rows, panels and calendar cells; blur only for overlays.
- 44px min targets on `pointer: coarse` (phones **and** tablets); 32px on fine pointers.
- No hover `scale` on rows, cells or pills; view switches ≤ `--motion-fast`; no looping animation
  except spinners and the kiosk now-line; background polling never spins or re-staggers.
- One-tap common actions with a 5 s undo toast; confirm dialog only for archive-type actions; no
  silent failures; ask before discarding a dirty form.
- Live screens show "Cập nhật HH:MM" and an offline state.

## Accessibility
- Visible focus ring: `focus:outline-none focus:border-[#3DBE7A]` or
  `focus-visible:ring-2 focus-visible:ring-[#3DBE7A]` — never remove focus indicators.
- Never convey information by colour alone. Toasts use `role="status"` / `aria-live="polite"`.
- WCAG AAA-oriented contrast target (7:1 body text, 4.5:1 large text). Full WCAG certification
  requires manual assistive-tech testing — don't claim compliance, just target the ratios.
- Respect `prefers-reduced-motion` when adding new animation.

## Motion
Tokens live in `theme.css` (`:root`). Pick one of the three durations — don't introduce new
ad hoc values:

| Token | Value | Use for |
|---|---|---|
| `--motion-fast` | 150ms | press feedback (`active:scale-[0.97]`), hover, small state flips, row leave |
| `--motion-base` | 250ms | panel/tab entrances, modals, sheets, list rows, number count-up |
| `--motion-slow` | 400ms | ambient/looping accents only |
| `--motion-enter` | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | all entrances; exits use `ease-out` |

Ready-made utilities (all in `theme.css`): `animate-fade-up` (list rows, honours `--stagger`),
`animate-panel-in` (view swap that remounts), `animate-row-leave` (row resolved/deleted),
`animate-slide-up` (mobile sheet), `animate-popup-in` (toast), `animate-slide-in-left/right`
(calendar week paging).

Rules:
- `transition-all duration-300` stays the default for hover; hover `scale-105` on **containers**,
  never on text. Add `active:scale-[0.97]` to anything tappable (the `Button` primitive already
  has it) — touch has no hover to confirm a tap.
- Tabs that stay mounted (`display: none` toggling) must use the shared `TabPanel` primitive,
  not a raw `display` style — it fades the incoming panel in. Exits are instant (fade-through);
  never leave two sibling flex panels visible at once.
- Animate only `opacity` and `transform`. No `height`/`top`/`width` animation, no animation
  library (framer-motion et al. are deliberately not a dependency).
- Cap `--stagger` at ~8 items. Never stagger the booking calendar grid (65 cells).
- Nothing on a blocking path may exceed `--motion-slow`.
- `prefers-reduced-motion: reduce` is handled globally in `theme.css` (durations collapse; loading
  spinners stay animated). JS-driven motion must check it itself — see `useCountUp`.
- Keep all animation "subtle premium" — noticeable, not flashy.
- **Scroll-triggered reveals**: permitted on *public marketing surfaces* only (see below).
  Forbidden on authenticated surfaces.

## Marketing-surface motion & glassmorphism tiers

**Public marketing surface** — any route reachable without an established customer or trainer
identity whose purpose is promotional rather than task-completion. Currently the only instance
is `Landing_Page` at `/`.

### Scroll-triggered reveals
- Permitted on public marketing surfaces ONLY.
- "One-time" = fires at most once per element per page load; never re-fires when the element
  re-enters the viewport.
- Forbidden on authenticated surfaces (any surface behind `AuthGuard` / `AdminGuard`).
- `useInView` hook + existing `animate-fade-up` utility is the ONLY permitted mechanism. Any
  other reveal implementation is rejected in review.

### Still forbidden everywhere (including marketing)
Parallax, scroll-linked transforms, marquees, cursor-following effects, celebration animations,
and animation library dependencies (framer-motion et al.).

## Glass_Tier levels

| Tier | Backdrop blur | Background | Border | Inner highlight |
|---|---|---|---|---|
| `ambient` | none | `from-white/[0.04] to-white/[0.01]` | `border-white/10` | — |
| `card` | 12px | `from-white/[0.07] to-white/[0.02]` | `border-white/10` | `inset 0 1px 0 rgba(255,255,255,0.08)` |
| `elevated` | 20–24px | `from-white/[0.07] to-white/[0.02]` | `border-white/10` | `inset 0 1px 0 rgba(255,255,255,0.08)` |

Use via the `Card` primitive's `tier` prop (`frontend/src/app/shared/primitives/Card.tsx`).

## Common anti-patterns (reject these in review)
- Light backgrounds / `bg-white text-black` anywhere in the app.
- Generic Tailwind green (`bg-green-500`, `text-emerald-*`, `#6ee7b7`) instead of `#0F6B3E` (fill)
  / `#3DBE7A` (text).
- `text-[#0F6B3E]` on text or thin icons (fails contrast — use `#3DBE7A`).
- Informational text below `white/60`, or text below 12px.
- Solid card backgrounds instead of glassmorphism.
- Uppercased Vietnamese text.
- Removing focus outlines.
- New `.dark` theme block / light-mode toggle (this app has exactly one theme).

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
| Primary (emerald) | `#0F6B3E` → `bg-[#0F6B3E]`, `text-[#0F6B3E]`, `border-[#0F6B3E]/30` |
| Glass surface | `bg-white/5 backdrop-blur-sm` (or `backdrop-blur-xl` for elevated panels) |
| Border | `border-white/10` |
| Text primary / secondary / tertiary | `text-white` / `text-white/60`–`/70` / `text-white/40` |
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
- Body text minimum `text-sm` (14px).

## Accessibility
- Visible focus ring: `focus:outline-none focus:border-[#0F6B3E]` or
  `focus-visible:ring-2 focus-visible:ring-[#0F6B3E]` — never remove focus indicators.
- WCAG AAA-oriented contrast target (7:1 body text, 4.5:1 large text). Full WCAG certification
  requires manual assistive-tech testing — don't claim compliance, just target the ratios.
- Respect `prefers-reduced-motion` when adding new animation.

## Motion
- `transition-all duration-300` as the default; hover `scale-105` on **containers**, never on text.
- Keep all animation "subtle premium" — noticeable, not flashy.

## Common anti-patterns (reject these in review)
- Light backgrounds / `bg-white text-black` anywhere in the app.
- Generic Tailwind green (`bg-green-500`) instead of `#0F6B3E`.
- Solid card backgrounds instead of glassmorphism.
- Uppercased Vietnamese text.
- Removing focus outlines.
- New `.dark` theme block / light-mode toggle (this app has exactly one theme).

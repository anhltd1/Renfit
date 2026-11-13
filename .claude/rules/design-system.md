---
paths:
  - "frontend/**/*.tsx"
  - "frontend/src/styles/**/*.css"
---

# Design System v2 (derived from frontend/rules/DESIGN.md)

`frontend/rules/DESIGN.md` (v2.0.0) is the **authoritative** source. This file distills it into
actionable rules for component work. If they ever disagree, `DESIGN.md` wins — update this file.

v2 in one line: **flat, exact, and about the gym's own things** — no glass, no glow, no hover
growth; colour on data, not chrome; Renfit's 4-places-per-hour rule is the signature element.

## Tokens (Tailwind classes, defined in `frontend/src/styles/theme.css`)
| Role | Class |
|---|---|
| Ground (page, sidebar, top bar) | `bg-[#0B0B0B]` |
| Panel / card | `bg-surface` (#131313) |
| Input, hover, nested, segmented control | `bg-surface-2` (#1A1A1A) |
| Pressed / selected row / tooltip | `bg-surface-3` (#222) |
| Overlay (modal, sheet, popover, toast) | `bg-overlay` (#161616) |
| Borders / row rules | `border-line` (white/8), controls `border-line-strong` (white/14) |
| Green **fill** (one primary action, booked marks, bars, today fill) | `bg-primary`, hover `bg-primary-hover`, tint `bg-primary-tint` |
| Green **foreground** (data lines, green labels, focus ring) | `text-primary-text` (#3DBE7A) |
| Warning / error text | `text-warning-text` / `text-error-text` |
| Text | `text-white` / `text-white/64` (minimum for information) / `text-white/40` (placeholder, disabled only) |
| Radius | `rounded-panel` (14px) cards & panels · `rounded-control` (10px) buttons, inputs · `rounded-chip` (6px) pills · `rounded-full` only for the one primary action, avatars, dots |

`cn()` (`app/shared/primitives/cn.ts`) knows the custom radius tokens, so overrides merge correctly.

## Rules
- **Surfaces**: a border *or* a tone step; no shadow at rest. `backdrop-blur` only on overlay scrims.
- **Hover** changes colour/background only. No `hover:scale-*`, no glow (`shadow-[0_0_…]`), no
  green hover borders. Press feedback `active:scale-[0.97]` stays.
- **Green is spent, not sprinkled**: data, the today/selected marker, and at most **one filled
  button per screen**. Nav active = neutral `bg-surface-2` pill + white text (mobile tab bar: white
  + a 2px `bg-primary-text` indicator). Never `text-[#0F6B3E]` (fails contrast).
- **No icon chips** (icons in tinted circles/squares), no icon on top of every card. Icons are 16px
  outline, grey, beside a label.
- **Type**: one noun title per app screen at `text-2xl font-semibold` (never a greeting/emoji);
  panel headers 16/600; labels 13px `text-white/64` sentence case; 12px absolute minimum.
  **Never `uppercase` or `tracking-wider/widest`** (Vietnamese diacritics + template look).
- **Numbers**: `tabular-nums`, right-aligned in columns, unit as a smaller grey suffix, Vietnamese
  decimals (`formatVi`, `formatSigned` in `shared/member/memberHomeModel.ts`: `72,4`, `−2,4`).
- **Deltas** carry sign + unit + baseline ("so với lần đo đầu 12/08"); colour by whether that
  direction is *good for the metric* (less fat good, less muscle bad, weight neutral), grey at zero.
- **Charts**: one hue on the data (2px straight `#3dbe7a` line or `bg-primary` bars), 3–5 faint
  gridlines, no gradient fill, no legend for one series, no rainbow per-metric colours.
- **Status pills**: the shared `StatusBadge` / `bookingStatusMeta` (pale tint + same-hue text + icon
  + label). Never hand-roll status colours; never colour-only.
- **Capacity marks** (`shared/booking/CapacityMarks.tsx`): wherever a slot appears (member calendar,
  PT timeline, kiosk, landing), draw its 4 places — filled = taken, outlined = free, viewer's own in
  `primary-text` — always with text (`2/4`, `Còn 2 chỗ`, `Hết chỗ`).
- **Empty / loading / error**: keep the frame; one Vietnamese sentence + the action; skeletons in
  `bg-surface-2`; errors say what failed and offer "Thử lại".

## Shared building blocks (use before hand-rolling)
- Primitives `app/shared/primitives/`: `Button` (primary = pill emerald; secondary/ghost/danger =
  10px neutral), `Card` (flat panel; `tier="elevated"` for floating), `Input`, `Modal` (desktop) /
  `Sheet` (mobile), `Toast`, `Tabs` (neutral segmented), `Skeleton`, `TabPanel`.
- `shared/components/BrandMark` — logo + "Renfit" + scope ("Hội viên", "Huấn luyện viên") at the top
  of every shell.
- `shared/member/` — member home model, `useMemberHome`, `NextSessionPanel`, `OpenSlotsList`,
  `InbodyFigures`, `WeightTrend`.
- `shared/booking/DayTimeline` — the PT's 08:00–20:00 day with capacity marks and members.

## Operations surfaces (PT dashboard)
- Lead with time: finding line under the title → Đang tập / Tiếp theo → pending (approve / reject
  on the row) + day timeline → today's sessions.
- 44px targets on `pointer: coarse` (phones **and** tablets); 32px on fine pointers.
- One-tap actions + 5 s undo toast; confirm dialog only for archive-type actions; no silent failures.
- View switches ≤150ms; no looping animation except spinners and the kiosk now-line; polling silent.
- "Cập nhật HH:MM" + offline state on live screens.

## AI Coach chat
- User: `bg-primary text-white rounded-panel rounded-br-md`, right-aligned.
- Coach: no bubble — text on the ground, small grey "AI Coach" label with a 14px `Bot` icon, ≤68ch.
- Artifacts: `bg-surface` panels following the card/table/chart rules; never an editable form.

## Marketing surface (landing `/` only)
- Split-stage hero: claim + facts + one action + the live `TodayBoard` (real open places from the
  public availability endpoint) beside one gym photograph.
- Section headings `text-[clamp(1.75rem,3.5vw,2.75rem)]`, left-aligned, ≤2 lines; no icon-card
  grids, no glass, no gradient text, **no invented statistics**.
- Scroll reveals: `useInView` + `animate-fade-up` only, once per element. Still forbidden: parallax,
  scroll-linked transforms, marquees, cursor effects, animation libraries.

## Motion
`--motion-fast` 150ms (press, hover, row leave) · `--motion-base` 250ms (panels, overlays,
count-up) · `--motion-slow` 400ms (ambient only). Animate `opacity`/`transform` only. Respect
`prefers-reduced-motion` (global in `theme.css`; JS motion checks it itself).

## Anti-patterns (reject in review)
Glass/blur on resting surfaces · glows · hover scale · gradients on buttons/cards/text/grounds ·
icon chips · `uppercase` / tracked labels / text < 12px · greetings with emoji · green nav or
labels · more than one filled button per screen · invented stats or baseline-less deltas ·
saturated status chips · light backgrounds or a light theme · other greens (`emerald-*`, `green-*`).

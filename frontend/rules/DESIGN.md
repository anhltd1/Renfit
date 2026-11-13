---
# Renfit Design System Tokens — v2.0.0
# Machine-readable design tokens for AI-assisted development.
# The prose below the front matter explains every rule. If code and this file disagree, this file wins.

brand:
  brand_name: "Renfit"
  theme_style: "dark_flat_private_gym"
  language: "vietnamese"
  tagline: "Phòng tập riêng. Mỗi khung giờ tối đa 4 người."

colors:
  # Ground and surfaces — opaque, true-neutral steps. No translucent "glass" on resting surfaces.
  background: "#0B0B0B"         # the ground: page, sidebar, top bar
  surface: "#131313"            # raised: cards, panels, list containers
  surface_2: "#1A1A1A"          # nested / hover / inputs / segmented controls
  surface_3: "#222222"          # pressed, selected rows, tooltips
  overlay: "#161616"            # modals, sheets, popovers, toasts (may carry blur)
  line: "rgba(255, 255, 255, 0.08)"         # default 1px border and row rules
  line_strong: "rgba(255, 255, 255, 0.14)"  # controls (inputs, secondary buttons)

  # The two greens. Nothing else is green.
  primary: "#0F6B3E"            # FILLS only: the one primary button, booked bars, today marker fill — 2.99:1, never text
  primary_hover: "#12804A"
  primary_tint: "rgba(15, 107, 62, 0.16)"   # pale tint under green text (pills, selected data)
  primary_text: "#3DBE7A"       # green FOREGROUND: data lines, green labels, icons, focus ring — 8.29:1

  text_primary: "#FFFFFF"
  text_secondary: "rgba(255, 255, 255, 0.64)"  # labels, meta — minimum for information
  text_tertiary: "rgba(255, 255, 255, 0.40)"   # placeholders, disabled, decoration only

  warning: "#f59e0b"
  warning_text: "#fbbf24"
  error: "#ef4444"              # fills/icons only
  error_text: "#f87171"         # red text — 7.12:1

# Booking status visual language. Every status = mark + icon + label; colour is never the only signal.
# Pills are a pale tint of the status hue with text in that hue — never saturated fill + white text.
booking_status:
  pending:   { label: "Chờ duyệt", color: "warning_text",   icon: "Clock",         border: "solid",  emphasis: "active" }
  approved:  { label: "Đã duyệt",  color: "primary_text",   icon: "CalendarCheck", border: "solid",  emphasis: "active" }
  completed: { label: "Đã tập",    color: "text_secondary", icon: "CheckCheck",    border: "solid",  emphasis: "recede" }
  no_show:   { label: "Vắng",      color: "error_text",     icon: "UserX",         border: "solid",  emphasis: "active" }
  rejected:  { label: "Từ chối",   color: "text_secondary", icon: "X",             border: "dashed", emphasis: "recede", text_decoration: "line-through" }

# The Renfit signature element: a slot's capacity drawn as its 4 places.
capacity_marks:
  places_per_slot: 4
  mark: "4 small bars or dots, 6×6px (dots) or 3×12px (bars), 2px gap"
  taken: "primary (#0F6B3E) fill; the viewer's own place in primary_text"
  free: "line_strong outline, no fill"
  full: "all 4 filled + label 'Hết chỗ' in text_secondary"
  label: "always pair with text: '2/4' or 'Còn 2 chỗ' (tabular-nums)"

typography:
  font: "'Be Vietnam Pro', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  code_font: "'SF Mono', 'Monaco', 'Consolas', monospace"
  weights: { regular: 400, medium: 500, semibold: 600, bold: 700 }
  app_scale:                 # authenticated member + PT screens
    title: "1.5rem / 600"    # 24px — one noun title per screen, never a greeting
    section: "1rem / 600"    # 16px — panel headers
    body: "0.875rem / 400"   # 14px
    label: "0.8125rem / 500" # 13px — sentence case, text_secondary
    meta: "0.75rem / 400"    # 12px — absolute minimum anywhere
    figure_lg: "2rem / 600"  # 32px — the one headline figure on a screen
    figure: "1.25rem / 600"  # 20px — other figures
  marketing_scale:           # public landing page only
    display: "clamp(2.5rem, 6vw, 4.75rem) / 700"
    h2: "clamp(1.75rem, 3.5vw, 2.75rem) / 700"
    body_lg: "1.125rem / 400"
  numeric: "tabular-nums, right-aligned in columns, unit as a smaller text_secondary suffix"
  case: "sentence case everywhere — never uppercase, never tracked labels (Vietnamese diacritics)"

layout:
  max_width: "1280px"
  reading_width: "768px"
  grid_gap: "1rem"            # app; marketing uses 1.5rem
  spacing: "8px grid (4px allowed inside dense rows)"
  radius:
    panel: "14px"             # cards, panels, modals, sheets (top corners)
    control: "10px"           # buttons, inputs, segmented controls, menus
    chip: "6px"               # status pills, tags, small chips
    full: "9999px"            # ONLY the single primary action per screen, avatars, dots

components:
  button:
    primary:   { background: "primary", hover: "primary_hover", color: "#FFFFFF", radius: "full", count_per_screen: 1 }
    secondary: { background: "surface_2", border: "line_strong", color: "text_primary", radius: "control" }
    ghost:     { background: "transparent", hover: "surface_2", color: "text_secondary → text_primary", radius: "control" }
    danger:    { background: "transparent", border: "rgba(248,113,113,0.35)", color: "error_text", radius: "control" }
    press: "scale 0.97 for motion-fast"
    hover: "background step only — no scale, no glow"
  card:
    background: "surface"
    border: "1px line"
    radius: "panel"
    padding: "20px (16px dense, 24px roomy)"
    shadow: "none"
    hover: "interactive cards only: background surface_2 — no scale, no glow, no green border"
  input:
    background: "surface_2"
    border: "1px line_strong"
    radius: "control"
    padding: "12px 16px"
    focus: "border primary_text + 2px ring primary_text/30"
  overlay:   # modal, sheet, popover, toast
    background: "overlay"
    border: "1px line"
    radius: "panel"
    scrim: "rgba(0, 0, 0, 0.7)"
    shadow: "0 16px 48px rgba(0,0,0,0.5)"
    blur: "allowed (backdrop-blur-md) — the only place blur is used"
  sidebar:
    width: "240px"
    background: "background"
    border: "1px line on the right"
    item: "36px tall, 16px outline icon, 14px label, radius control"
    active: "neutral pill surface_2 + text_primary — never a green fill or a left bar"
  table_and_list:
    header: "12px text_secondary, sentence case, no band"
    rows: "1px line rules, no zebra, numbers right-aligned tabular"

charts:
  hue: "one per chart: primary_text for lines, primary for bars; everything else neutral"
  line: "2px straight, no markers except the latest point"
  area: "none, or a flat 10% primary tint — never a gradient"
  grid: "3–5 horizontal lines in rgba(255,255,255,0.06), no axis lines"
  legend: "none for a single series"
  labels: "12px text_secondary, tabular-nums"

motion:
  fast: "150ms"     # press, hover, small state flips, row leave
  base: "250ms"     # panel/tab entrances, overlays, count-up
  slow: "400ms"     # ambient accents only
  enter: "cubic-bezier(0.25, 0.46, 0.45, 0.94)"
  hover: "colour/background change only — no scale, no glow"
  reveals: "scroll reveals on the public landing page only (useInView + animate-fade-up)"

ops_surface:
  type_scale: { body: "0.875rem", min: "0.75rem", emphasis: "1rem semibold", kiosk_min: "1.25rem" }
  surfaces: "flat (no blur on anything but overlays)"
  touch_target_coarse: "44px"
  touch_target_fine: "32px"
  motion:
    view_switch: "150ms fade"
    looping: "none except spinners and the kiosk now-line"
    result_feedback: "row-leave + undo toast"
    polling_refresh: "silent"
  destructive_actions:
    frequent_reversible: "undo_toast_5s"
    rare_or_hard_to_reverse: "confirm_dialog"
  data_freshness: "'Cập nhật HH:MM' next to refresh; offline state on fetch failure"

accessibility:
  min_contrast_ratio: 7          # body text target; 4.5 large; 3 non-text UI
  focus_visible: "2px solid #3DBE7A, offset 2px"
  color_only_information: false
  live_regions: "toasts use role=status / aria-live=polite"
  line_height: 1.5
  responsive_breakpoints: { sm: "640px", md: "768px", lg: "1024px", xl: "1280px", "2xl": "1536px" }

ai_ux:
  chatbot_tone: "professional_supportive_vietnamese"
  max_length: "3_paragraphs"
  emoji_usage: "none in UI chrome; minimal in coach replies"
  artifacts: "read-only data panels under the reply — same card, table and chart rules as the app"
  ai_safety_rules:
    - "Luôn khuyến nghị tư vấn bác sĩ cho vấn đề sức khỏe nghiêm trọng"
    - "Không đưa ra chẩn đoán y khoa"
    - "Cảnh báo về chấn thương và quá tải"
    - "Đề xuất bắt đầu từ mức độ nhẹ nhàng"
---

# Renfit Design System — v2.0

## Philosophy

Renfit is a **private gym**: a handful of trainers, a few dozen members, and every hour capped at
four people. The interface should feel like that place — calm, exact, personal — not like a
generic "premium fitness app" template.

v1 reached for luxury through decoration: frosted glass, green glows, cards that grow on hover,
gradient overlays, icons in tinted circles. Those are the defaults every generated interface
uses, and together they made Renfit look machine-made. v2 removes the decoration and puts the
gym's own things in its place:

1. **The gym's own things are the design.** Four places per hour, a member's real InBody numbers,
   the trainer's day from 08:00 to 20:00. When a screen needs something to look at, show one of
   these — never an ornament.
2. **Colour goes on data, not chrome.** Emerald marks booked places, today, progress, and the one
   action a screen exists for. Navigation, labels and containers stay neutral.
3. **Flat and exact.** Opaque surfaces one tone step apart, 1px lines, tabular figures that line
   up, deltas that say what they are compared with.
4. **Every screen answers one question first** — "Khi nào tôi tập buổi tới?", "Hôm nay ai đang
   tập?", "Còn chỗ lúc 18:00 không?" — and its biggest element is that answer.

## Colour

### Ground and surfaces

| Token | Value | Use |
|---|---|---|
| `background` | `#0B0B0B` | The ground: page, sidebar, top bar |
| `surface` | `#131313` | Cards, panels, list containers |
| `surface_2` | `#1A1A1A` | Inputs, hover on rows/cards, segmented controls, nested blocks |
| `surface_3` | `#222222` | Pressed, selected row, tooltip |
| `overlay` | `#161616` | Modals, sheets, popovers, toasts |
| `line` | `white/8` | Card borders, row rules, dividers |
| `line_strong` | `white/14` | Control borders |

Separation is **a border or a tone step, never both plus a shadow**. Resting cards have no shadow.
Only things that float (overlays) get a shadow, and only overlays may use `backdrop-blur`.

Tailwind: `bg-surface`, `bg-surface-2`, `bg-surface-3`, `bg-overlay`, `border-line`,
`border-line-strong` (defined in `theme.css`).

### The two greens

`#0F6B3E` (`primary`) is a deep emerald that only reaches 2.99:1 on the ground — **fills only**:
the single primary button, booked capacity marks, chart bars, the today marker.

`#3DBE7A` (`primary_text`) is the same hue lifted to 8.29:1 — **foreground**: green labels,
chart lines, meaningful icons, the focus ring, positive deltas.

Rule: green background → `#0F6B3E`; green foreground → `#3DBE7A`. There are no other greens —
no `emerald-*`, `green-*` or `#22c55e`.

Green is spent, not sprinkled. On any screen it should appear on: data (capacity, charts,
progress), the selected/today state, and at most one filled button. Nav items, section labels,
icon decorations and card borders are not green.

### Text tiers

| Token | Ratio on ground | Use |
|---|---|---|
| white | 19:1 | Names, times, values, titles |
| `white/64` | ~7.8:1 | Labels, meta, secondary copy — **minimum for information** |
| `white/40` | 3.8:1 | Placeholder, disabled, decoration only |

`white/20`–`/35` are not text colours.

### Deltas and polarity

A change carries its sign, its unit and its baseline in the same phrase:
"−2,4 kg so với lần đo 12/08". Colour says *good or bad for this metric*, not up or down —
less body fat is `primary_text`, more is `error_text`; a zero or missing change is grey, or a
dash. Never colour a value that has no baseline.

## Typography

**Be Vietnam Pro** throughout (fallback Inter). One typeface; weight and size do the work.

### App screens (member + PT)

| Role | Size / weight | Notes |
|---|---|---|
| Screen title | 24 / 600 | A noun ("Tổng quan", "Hôm nay"), with the date or scope beside it in 14px grey. Never a greeting, never an emoji. |
| Panel header | 16 / 600 | Sentence case |
| Body | 14 / 400 | |
| Label | 13 / 500, `white/64` | Above a value, sentence case |
| Meta | 12 / 400 | The absolute minimum — no `text-[10px]`/`text-[11px]` anywhere |
| Headline figure | 32 / 600 | One per screen: the figure that answers the screen's question |
| Figure | 20 / 600 | Other values |

### Marketing (landing page only)

Display headline `clamp(2.5rem, 6vw, 4.75rem)` / 700, set left-aligned with tight leading (1.1)
— never three stacked centred lines. Section headings `clamp(1.75rem, 3.5vw, 2.75rem)`.

### Vietnamese rules (non-negotiable)

- `leading-relaxed` (≥1.5) on body text; headings may go to 1.1–1.2 only at ≥28px.
- **Never `uppercase`, never `tracking-wider`/`widest`** — both damage diacritics and read as
  template chrome.
- `tabular-nums` on every time, count, weight and percentage.
- Numbers use Vietnamese formatting where shown to members: `72,4 kg`, `18:00`, `T2 09/11`.

## Shape

| Radius | Value | Use |
|---|---|---|
| `rounded-panel` | 14px | Cards, panels, modals, sheet tops |
| `rounded-control` | 10px | Buttons, inputs, segmented controls, menus, row hit areas |
| `rounded-chip` | 6px | Status pills, tags |
| `rounded-full` | — | The single primary action, avatars, capacity dots |

Choosing these once is what makes the screens feel designed. Don't mix in `rounded-3xl`,
`rounded-2xl` or arbitrary radii.

## Components

### Buttons

- **Primary** — emerald fill, white text, `rounded-full`. **One per screen**: the action the
  screen exists for (Đặt lịch, Duyệt tất cả, Lưu). Hover darkens/lightens the fill; press scales
  to 0.97. No glow, no hover scale.
- **Secondary** — `surface_2` + `line_strong` border, `rounded-control`.
- **Ghost** — text only, `surface_2` on hover.
- **Danger** — red text and a faint red border; filled red is reserved for confirm dialogs.

### Cards and panels

`bg-surface border border-line rounded-panel p-5`. No gradient, no blur, no inner highlight, no
shadow. An interactive card changes its background to `surface_2` on hover — it doesn't move.

Prefer **one divided panel** (`divide-y divide-line`) over a grid of identical small cards. A row
of peer cards is fine for 2–4 peer metrics; never put an icon on top of each.

### Inputs

`bg-surface-2 border border-line-strong rounded-control px-4 py-3`; focus: `border-primary-text`
plus a 2px `primary_text/30` ring. Labels above, 13px, sentence case.

### Status pills

`rounded-chip px-2 py-0.5 text-xs font-medium` on a ~14% tint of the status hue with text in that
hue, plus the status icon. Use the shared `statusMeta` map — never hand-roll status colours.

### Lists and tables

Rows separated by 1px `line` rules. Headers 12px grey sentence case, no background band, no
zebra. Identity on the left, numbers right-aligned with tabular figures. One action per row where
it is needed; hover is `surface_2`.

### Icons

`lucide-react`, outline, 16px (14–20), grey (`white/64`) by default. An icon sits beside a label
or alone as an affordance. **No icons in tinted circles or squares**, no icon on top of every
card, no coloured icon per category.

### Navigation

Sidebar on the page ground with a 1px right rule: product mark at the top, nav items 36px tall
with 16px icons, the account row at the bottom. Active item = neutral `surface_2` pill with white
text. Mobile: bottom tab bar with the active tab in white + a 2px `primary_text` indicator dot.

## The signature: capacity marks

Every hour at Renfit has **4 places**. Wherever a slot appears — the member's booking calendar,
the PT's day timeline, the kiosk, the landing page — draw its places as 4 marks: filled emerald
for taken, outlined for free, the viewer's own place in `primary_text`. Always pair the marks
with text (`2/4`, `Còn 2 chỗ`, `Hết chỗ`) so colour is never the only signal. Component:
`shared/booking/CapacityMarks.tsx`.

## Charts

One hue per chart, on the data: a 2px straight `primary_text` line (dot on the latest point only),
or `primary` bars. 3–5 faint gridlines, no axis lines, no legend for one series, 12px grey tabular
tick labels. No gradient fills, no rainbow palettes, no fat donuts with labels on slices.

## Empty, loading and error states

- **Empty**: keep the frame; one sentence in `white/64` saying what will appear and the action
  that fills it ("Chưa có buổi tập nào. Đặt lịch"). Member screens may use the existing small SVG
  illustrations; PT screens use text only.
- **Loading**: skeleton blocks in `surface_2` shaped like the content.
- **Error**: say what failed in Vietnamese, keep the last good data, offer "Thử lại".
- **Zero** prints as `0`, missing as `—`.

## Operations surfaces (Trainer / PT)

The PT dashboard is a work tool opened dozens of times a day on a phone, a tablet at the front
desk, or a laptop. It is tuned for **glanceable, one-handed, interruption-safe** use.

### Layout around time
A PT's question is "what's now, and what's next?". Hôm nay opens with the **day timeline**
(08:00–20:00, each hour with its capacity marks and the members in it, the current hour marked
by a 1px `primary_text` line), then **Đang tập / Tiếp theo**, then what needs a decision
(pending requests grouped by day) with its action beside it. The line under the title states the
one thing that needs attention ("3 yêu cầu chờ duyệt cho ngày mai").

### Density without shrinking text
14px body, 12px minimum, member name + session time as the bold pair on every row,
`tabular-nums`, no uppercase.

### Touch targets
44×44px minimum on any `pointer: coarse` device (phones **and** tablets); 32px on fine pointers.

### Actions and feedback
- Common actions (duyệt, từ chối, Đã tập, Vắng) are one tap and update immediately.
- Frequent, reversible actions → 5-second undo toast. Rare/hard-to-reverse (archive) → confirm
  dialog.
- No silent failures; ask before discarding a dirty form.
- The same booking actions, labels and icons appear everywhere a booking appears.

### Motion
View switches ≤150ms fade; no looping animation except spinners and the kiosk now-line; no hover
scale anywhere; row-leave on resolve; background polling is silent.

### Data freshness
"Cập nhật HH:MM" next to refresh and an offline state when a refresh fails.

## AI Coach

The coach should read like a professional trainer's message, not a chatbot widget.

- User bubble: `bg-primary text-white rounded-panel rounded-br-md`, right-aligned.
- Coach message: no bubble chrome — text on the ground with a small "AI Coach" label in
  `white/64`, max width ~68ch. Artifacts render below as `surface` panels following the card,
  table and chart rules above. Never an inline editable form.
- Tone: professional Vietnamese, "bạn", ≤3 short paragraphs, no hype, minimal emoji.
- Safety: never diagnose; flag pain/injury; suggest a doctor for serious issues; start light.

## Marketing surface (landing page)

The public landing page is the one place allowed atmosphere: real photography of training,
large type, and one-time scroll reveals (`useInView` + `animate-fade-up` only). It still follows
v2: no glass cards, no glows, no gradient text, no icon-card grids, no invented statistics. Show
what is true and specific — the 4-person cap, the trainers by name, the real schedule, the
address — and give the visitor one live thing (today's open places) when data allows.

Still forbidden everywhere: parallax, scroll-linked transforms, marquees, cursor effects,
celebration animations, animation libraries.

## Motion

| Token | Value | Use |
|---|---|---|
| `--motion-fast` | 150ms | Press (`active:scale-[0.97]`), hover colour, small flips, row leave |
| `--motion-base` | 250ms | Panel/tab entrances, overlays, count-up |
| `--motion-slow` | 400ms | Ambient accents only |
| `--motion-enter` | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | All entrances; exits use `ease-out` |

Animate only `opacity` and `transform`. Hover changes colour, never size. Respect
`prefers-reduced-motion` (handled globally in `theme.css`; JS-driven motion checks it itself).
Mounted tabs use the `TabPanel` primitive.

## Accessibility

- Focus: `focus-visible:ring-2 ring-primary-text ring-offset-2 ring-offset-[#0B0B0B]` — never
  removed.
- Never convey information by colour alone (status = mark + icon + label; capacity = marks +
  text; deltas = sign + words).
- Target 7:1 for body text, 4.5:1 for large text, 3:1 for non-text UI. Don't claim WCAG
  certification without assistive-tech testing.
- Toasts use `role="status"` / `aria-live="polite"`.

## Anti-patterns (reject in review)

- Glass on resting surfaces: `backdrop-blur`, translucent gradient cards, inner highlights.
- Glows (`shadow-[0_0_…]`), hover `scale-*` on anything, green hover borders on cards.
- Gradients on buttons, cards, text or grounds (a hero photo's legibility scrim is the exception).
- Icons in tinted circles/squares; an icon on top of every card.
- `uppercase`, `tracking-wider`/`widest`, text below 12px.
- Greetings with emoji ("Xin chào 👋"), emoji in UI chrome.
- Green on navigation or labels; more than one filled button per screen.
- Invented statistics ("100+ hội viên", "95% hài lòng") or deltas with no baseline.
- Saturated status chips with white text; colour-only status.
- Light backgrounds, a light theme, other greens, `#0F6B3E` as text.

## Implementation checklist

- [ ] Surfaces from the `surface` steps, 1px `line` borders, no blur outside overlays
- [ ] Radii: `rounded-panel` / `rounded-control` / `rounded-chip`, `rounded-full` only for the one primary
- [ ] One noun title per screen at 24px; the screen's question answered by its biggest element
- [ ] Green only on data, today/selected, and one primary action
- [ ] Labels sentence case ≥12px; figures tabular and right-aligned in columns
- [ ] Deltas carry sign, unit and baseline
- [ ] Capacity shown with `CapacityMarks` + text wherever a slot appears
- [ ] Empty / loading / error states built for every block
- [ ] 44px targets on coarse pointers; visible focus rings
- [ ] All user-facing text in Vietnamese

## Changelog

| Version | Date | Changes |
|---|---|---|
| 2.0.0 | 2026-11-08 | Redesign away from the generated look: glassmorphism, glows and hover scale removed; opaque `surface` steps and 1px lines; colour on data only, one primary action per screen; new radius scale (panel 14 / control 10 / chip 6, pill only for the primary); app vs marketing type scales; sentence-case labels only; deltas with baselines; pale-tint status pills; one-hue charts; capacity marks as the signature element; flat AI Coach messages; landing page without invented stats. |
| 1.1.0 | 2026-10-30 | Added `primary_text` and `error_text`; contrast tiers; booking status visual language; 12px minimum; Operations Surfaces rules. Source: `aidlc-docs/inception/requirements/pt-ux-review-v5.md`. |
| 1.0.0 | 2026-05-28 | Initial design system. |

**Last Updated**: 2026-11-08
**Version**: 2.0.0

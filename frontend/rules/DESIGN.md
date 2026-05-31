---
# Renfit Design System Tokens
# Machine-readable design tokens for AI-assisted development

brand:
  brand_name: "Renfit"
  theme_style: "dark_luxury_fitness"
  language: "vietnamese"
  tagline: "Nâng Tầm Thể Chất. Kiến Tạo Phiên Bản Tốt Nhất Của Bạn."

colors:
  primary: "#0F6B3E"
  primary_hover: "#0d5a33"
  primary_light: "rgba(15, 107, 62, 0.2)"
  secondary: "rgba(255, 255, 255, 0.1)"
  background: "#0B0B0B"
  surface: "rgba(15, 15, 15, 0.8)"
  surface_elevated: "rgba(255, 255, 255, 0.05)"
  accent: "#0F6B3E"
  accent_glow: "rgba(15, 107, 62, 0.5)"
  text_primary: "#FFFFFF"
  text_secondary: "rgba(255, 255, 255, 0.6)"
  text_tertiary: "rgba(255, 255, 255, 0.4)"
  border: "rgba(255, 255, 255, 0.1)"
  border_accent: "rgba(15, 107, 62, 0.3)"
  success: "#22c55e"
  warning: "#f59e0b"
  error: "#ef4444"

typography:
  heading_font: "'Be Vietnam Pro', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  body_font: "'Be Vietnam Pro', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  code_font: "'SF Mono', 'Monaco', 'Consolas', monospace"
  font_weights:
    light: 300
    regular: 400
    medium: 500
    semibold: 600
    bold: 700
    extrabold: 800
    black: 900
  heading_scale:
    h1: "3.5rem"     # 56px - Hero headlines
    h2: "3rem"       # 48px - Section headers
    h3: "2rem"       # 32px - Card titles
    h4: "1.5rem"     # 24px - Subsections
    h5: "1.25rem"    # 20px - Small headers
    body_lg: "1.25rem"   # 20px - Large body
    body: "1rem"         # 16px - Default
    body_sm: "0.875rem"  # 14px - Small text
    caption: "0.75rem"   # 12px - Captions

layout:
  max_width: "1280px"   # 7xl container
  content_width: "1024px"
  grid_system:
    columns: 12
    gap: "1.5rem"
  spacing_scale:
    xs: "0.25rem"    # 4px
    sm: "0.5rem"     # 8px
    md: "1rem"       # 16px
    lg: "1.5rem"     # 24px
    xl: "2rem"       # 32px
    "2xl": "3rem"    # 48px
    "3xl": "4rem"    # 64px
    "4xl": "6rem"    # 96px
  border_radius:
    sm: "0.75rem"    # 12px
    md: "1rem"       # 16px
    lg: "1.5rem"     # 24px
    xl: "2rem"       # 32px
    full: "9999px"
  section_padding:
    y: "6rem"        # 96px vertical
    x: "1.5rem"      # 24px horizontal

components:
  button:
    primary:
      background: "#0F6B3E"
      color: "#FFFFFF"
      hover_background: "rgba(15, 107, 62, 0.9)"
      padding: "1rem 2rem"
      border_radius: "9999px"
      transition: "all 0.3s ease"
      hover_scale: 1.05
      glow: "0 0 30px rgba(15, 107, 62, 0.5)"
    secondary:
      background: "rgba(255, 255, 255, 0.1)"
      color: "#FFFFFF"
      hover_background: "rgba(255, 255, 255, 0.2)"
      border: "1px solid rgba(255, 255, 255, 0.2)"
  
  card:
    style: "glassmorphism"
    background: "rgba(255, 255, 255, 0.05)"
    backdrop_blur: "12px"
    border: "1px solid rgba(255, 255, 255, 0.1)"
    border_radius: "1.5rem"
    padding: "2rem"
    hover_border: "rgba(15, 107, 62, 0.5)"
    hover_scale: 1.05
    hover_glow: "0 0 40px rgba(15, 107, 62, 0.3)"
  
  input:
    background: "rgba(255, 255, 255, 0.05)"
    border: "1px solid rgba(255, 255, 255, 0.1)"
    border_radius: "1rem"
    padding: "1rem 1.5rem"
    color: "#FFFFFF"
    placeholder_color: "rgba(255, 255, 255, 0.4)"
    focus_border: "#0F6B3E"
    transition: "border-color 0.3s ease"
  
  modal:
    overlay: "rgba(0, 0, 0, 0.8)"
    background: "rgba(15, 15, 15, 0.95)"
    backdrop_blur: "16px"
    border: "1px solid rgba(255, 255, 255, 0.1)"
    border_radius: "1.5rem"
    padding: "2rem"
    max_width: "42rem"
  
  sidebar:
    width: "20rem"
    background: "#000000"
    border: "1px solid rgba(255, 255, 255, 0.1)"
    padding: "1rem"
    item_hover_background: "rgba(255, 255, 255, 0.05)"
    item_active_background: "rgba(15, 107, 62, 0.2)"

motion:
  transition_speed:
    instant: "100ms"
    fast: "200ms"
    normal: "300ms"
    slow: "500ms"
  easing:
    default: "cubic-bezier(0.4, 0.0, 0.2, 1)"
    ease_out: "cubic-bezier(0.0, 0.0, 0.2, 1)"
    ease_in: "cubic-bezier(0.4, 0.0, 1, 1)"
  hover_behavior:
    scale: 1.05
    glow_opacity: 1
    border_opacity: 0.5
  animation_style: "subtle_premium"
  scroll_behavior: "smooth"

accessibility:
  contrast_strategy: "WCAG_AAA"
  min_contrast_ratio: 7
  focus_visible: "2px solid #0F6B3E"
  focus_offset: "2px"
  vietnamese_typography_support:
    enabled: true
    fonts:
      - "Be Vietnam Pro"
      - "Inter"
    diacritic_rendering: "optimized"
    line_height_multiplier: 1.5
  responsive_breakpoints:
    sm: "640px"
    md: "768px"
    lg: "1024px"
    xl: "1280px"
    "2xl": "1536px"

ai_ux:
  chatbot_tone: "professional_supportive_vietnamese"
  ai_coach_personality:
    - "Chuyên nghiệp và thân thiện"
    - "Tập trung vào sức khỏe và an toàn"
    - "Động viên nhưng không quá nhiệt tình"
    - "Dựa trên khoa học và y học"
  ai_response_style:
    format: "structured_with_recommendations"
    max_length: "3_paragraphs"
    include_action_cards: true
    emoji_usage: "minimal_professional"
  ai_safety_rules:
    - "Luôn khuyến nghị tư vấn bác sĩ cho vấn đề sức khỏe nghiêm trọng"
    - "Không đưa ra chẩn đoán y khoa"
    - "Cảnh báo về chấn thương và quá tải"
    - "Đề xuất bắt đầu từ mức độ nhẹ nhàng"
  booking_flow_behavior:
    steps: 5
    validation: "progressive"
    save_progress: true
    confirmation_style: "detailed_with_qr"

ui_patterns:
  navigation:
    style: "sidebar_desktop_overlay_mobile"
    sticky_header: true
    logo_placement: "top_left"
  
  data_visualization:
    chart_style: "gradient_bars"
    primary_color: "#0F6B3E"
    grid_color: "rgba(255, 255, 255, 0.1)"
    animation: "fade_in_up"
  
  content_hierarchy:
    hero_height: "100vh"
    section_spacing: "6rem"
    card_grid_gap: "1.5rem"
  
  images:
    overlay: "gradient_dark"
    aspect_ratios:
      hero: "16:9"
      card: "4:3"
      avatar: "1:1"
    filter: "brightness(0.9) contrast(1.1)"

---

# Renfit Design System

## Philosophy

The Renfit design system embodies a **dark luxury fitness aesthetic** that combines the premium feel of high-end athletic brands with the intelligence of modern AI-powered applications. Every design decision serves three core principles:

1. **Elite & Exclusive** — The experience should feel like a private, premium service
2. **Powerful & Effective** — Users should feel empowered and capable
3. **Intelligent & Modern** — The AI integration should feel seamless and trustworthy

## Color Strategy

### Dark Luxury Foundation

The deep black background (`#0B0B0B`) creates a **cinematic canvas** that:
- Reduces eye strain during extended sessions
- Makes emerald green accents pop dramatically
- Conveys sophistication and premium quality
- Differentiates from typical bright fitness apps

### Emerald Green as Power

The primary color (`#0F6B3E`) represents:
- **Growth and transformation** — The core promise of fitness
- **Energy without aggression** — Motivating but not overwhelming
- **Premium athletic brands** — Associations with high-end sportswear
- **Vietnamese cultural resonance** — Natural, powerful, balanced

Use green strategically:
- **Primary actions** — CTAs, confirmations, success states
- **Hover states** — Glowing borders and shadows
- **Data visualization** — Progress bars, charts, achievements
- **AI indicators** — Showing when AI is active or responding

### Glassmorphism & Depth

The layered transparency system creates **visual depth**:
- `rgba(255, 255, 255, 0.05)` — Surface cards
- `rgba(255, 255, 255, 0.1)` — Elevated elements
- `rgba(255, 255, 255, 0.2)` — Interactive states

Combined with `backdrop-blur`, this creates the signature **"frosted glass"** effect that:
- Maintains hierarchy without harsh borders
- Feels modern and spatial
- Allows background images to subtly show through
- Works beautifully with dark themes

## Typography for Vietnamese

### Font Selection

**Be Vietnam Pro** is the primary typeface because:
- **Designed specifically for Vietnamese diacritics** — Accents render beautifully
- **Modern geometric structure** — Professional and contemporary
- **Excellent weight range** — From Light (300) to Black (900)
- **Optimized for screens** — High readability at all sizes

**Inter** serves as a fallback with similar characteristics.

### Diacritic Rendering

Vietnamese typography requires special attention:

```yaml
# Correct diacritic spacing
line-height: 1.5        # Prevents clipping of accents
letter-spacing: normal  # Don't compress Vietnamese text
```

**Critical rule**: Never use font sizes below `14px` (0.875rem) for Vietnamese body text — diacritics become difficult to read.

### Heading Scale

The type scale follows a **major third ratio** (1.25×) adapted for Vietnamese:

- **Display (56px+)** — Hero headlines, short impact phrases
- **Headline (32-48px)** — Section headers, page titles
- **Subheading (20-24px)** — Card titles, subsections
- **Body (16px)** — All paragraph text, descriptions
- **Caption (12-14px)** — Meta information, timestamps

## Component Design Patterns

### Buttons — Premium Interaction

Primary buttons use the **pill shape** (infinite radius) because:
- Creates a friendly, approachable feel
- Stands out clearly against angular cards
- Common in premium fitness apps (Peloton, Apple Fitness+)

**Hover behavior**:
```css
transform: scale(1.05);
box-shadow: 0 0 30px rgba(15, 107, 62, 0.5);
```

This creates a **"glow and grow"** effect that:
- Provides clear interactive feedback
- Feels premium and responsive
- Matches the AI-powered theme

### Cards — Glassmorphism Done Right

Cards are the primary content container. **Critical rules**:

1. **Always use backdrop-blur** — Creates the frosted glass effect
2. **Subtle borders** — `rgba(255, 255, 255, 0.1)` prevents floating appearance
3. **Generous padding** — Minimum `2rem` (32px) for breathing room
4. **Rounded corners** — `1.5rem` (24px) for modern, soft aesthetic
5. **Hover transitions** — Border becomes green, slight scale increase

**Anti-pattern**: Don't use solid backgrounds — this breaks the glassmorphism system.

### Input Fields — Dark Theme Challenges

Input fields on dark backgrounds require:

```css
background: rgba(255, 255, 255, 0.05);  /* Slight lift from background */
border: 1px solid rgba(255, 255, 255, 0.1);  /* Visible boundary */
color: #FFFFFF;  /* High contrast text */
placeholder: rgba(255, 255, 255, 0.4);  /* Subtle hint */
```

**Focus state** uses green border to indicate active input.

Vietnamese text in inputs needs:
- **Proper line-height** (1.5) — Space for diacritics
- **Adequate padding** (1rem vertical) — Prevents clipping
- **No text-transform** — Never uppercase Vietnamese

## AI Coach Experience Design

### Conversational UI Principles

The AI Coach should feel like a **professional personal trainer**, not a chatbot:

1. **Use structured responses** with clear sections
2. **Include actionable recommendation cards** after text responses
3. **Show "typing" indicators** for natural pacing
4. **Keep responses under 3 paragraphs** — Break complex info into multiple messages
5. **Use bullet points and emojis sparingly** — Professional but friendly

### Vietnamese Tone Guidelines

The AI should communicate with:
- **"Bạn" form** — Friendly but respectful
- **Professional vocabulary** — Fitness and medical terms
- **Encouraging but realistic** — "Bạn có thể làm được!" not "Dễ lắm!"
- **Clear safety warnings** — When users mention pain or injury

### Response Structure Template

```
[Greeting or acknowledgment]

[Main information - 2-3 paragraphs max]

[Recommendation cards]
✓ Card 1 - Primary action
✓ Card 2 - Secondary option
✓ Card 3 - Related suggestion

[Question or next step]
```

### AI Safety Rules

**Critical**: The AI must:
- ❌ Never diagnose medical conditions
- ❌ Never ignore pain or injury mentions
- ✅ Always suggest consulting healthcare professionals for serious issues
- ✅ Recommend starting with light intensity
- ✅ Ask about existing health conditions

## Layout & Spacing System

### 8px Grid Foundation

All spacing follows an **8px base unit**:

```
4px  (0.25rem) — Tiny gaps, icon spacing
8px  (0.5rem)  — Compact spacing
16px (1rem)    — Default spacing
24px (1.5rem)  — Comfortable spacing
32px (2rem)    — Generous spacing
48px (3rem)    — Section spacing
96px (6rem)    — Major section dividers
```

**Why 8px?** Works perfectly with:
- Common screen resolutions
- Icon sizes (16px, 24px, 32px)
- Typography line-heights
- Responsive scaling

### Container Widths

```
Max content width: 1280px  — Prevents ultra-wide layouts
Reading width: 768px       — Optimal for Vietnamese text
Form width: 640px          — Comfortable input length
```

### Responsive Breakpoints

Mobile-first approach with:
- **sm (640px)** — Large phones
- **md (768px)** — Tablets
- **lg (1024px)** — Laptops
- **xl (1280px)** — Desktops
- **2xl (1536px)** — Large screens

## Motion & Animation

### Subtle Premium Philosophy

Animations should be **barely noticeable** — enhancing polish without drawing attention.

**Default transition**: `300ms cubic-bezier(0.4, 0.0, 0.2, 1)`

Use for:
- Color changes
- Border transitions
- Opacity fades

**Faster (200ms)** for:
- Hover states
- Button interactions

**Slower (500ms)** for:
- Modal appearances
- Page transitions

### Scale Transforms

Hover scale of **1.05** (5% increase) is the sweet spot:
- Noticeable but not jarring
- Works across all component sizes
- Feels responsive and premium

**Anti-pattern**: Don't scale text — it looks amateurish. Scale containers only.

### Glow Effects

Green glow on hover creates **premium feedback**:

```css
box-shadow: 0 0 30px rgba(15, 107, 62, 0.5);
```

Use for:
- Primary buttons
- Feature cards
- Interactive elements

**Don't overuse** — Reserve for primary interactive elements.

## Image Treatment

### Dark Overlays

All hero images require gradients to ensure text legibility:

```css
background: linear-gradient(
  to bottom,
  rgba(0, 0, 0, 0.8),
  rgba(0, 0, 0, 0.7),
  #0B0B0B
);
```

This creates a **cinematic fade** while maintaining brand consistency.

### Photo Selection Guidelines

Images should convey:
- **Dramatic lighting** — Moody, high-contrast gym photography
- **Athletic focus** — People in motion, equipment close-ups
- **Premium aesthetic** — High-end gym environments, not commercial fitness
- **Diversity** — Represent various fitness levels and goals

**Anti-pattern**: Avoid overly posed "stock photo" imagery.

## Accessibility & Inclusion

### Contrast Requirements

All text must meet **WCAG AAA** standards:
- Large text (18px+): 4.5:1 contrast ratio
- Body text (16px): 7:1 contrast ratio

White text on dark background provides excellent contrast naturally.

### Focus Indicators

Keyboard navigation shows **green focus rings**:

```css
outline: 2px solid #0F6B3E;
outline-offset: 2px;
```

Never remove focus indicators — they're critical for accessibility.

### Vietnamese Language Support

Proper Vietnamese rendering requires:
- **UTF-8 encoding** — All files
- **Vietnamese-compatible fonts** — Be Vietnam Pro, Inter
- **Generous line-height** — 1.5 minimum for diacritics
- **No text-transform** — Uppercase breaks Vietnamese

## Extending the System

### Adding New Components

When creating new UI elements:

1. **Check existing patterns first** — Use established components
2. **Follow the glassmorphism style** — Transparent backgrounds, subtle borders
3. **Use the color system** — Green for primary, white/10% for secondary
4. **Maintain spacing rhythm** — 8px grid system
5. **Test with Vietnamese text** — Ensure diacritics render properly

### Creating New Pages

New pages must include:
- **Consistent navigation** — Sidebar or header
- **Dark background** — #0B0B0B
- **Section padding** — 6rem vertical
- **Vietnamese content** — All user-facing text
- **Responsive layout** — Mobile-first approach

### AI Feature Guidelines

When adding AI-powered features:

1. **Show AI status clearly** — "AI-Powered" badges, loading states
2. **Use professional Vietnamese** — Maintain coach-like tone
3. **Provide action cards** — Make AI suggestions actionable
4. **Include safety disclaimers** — Health-related content needs warnings
5. **Allow user control** — Users should be able to dismiss or modify AI suggestions

## Design System Maintenance

### Version Control

When updating design tokens:

1. Update YAML front matter first
2. Update markdown explanations
3. Test changes across all pages
4. Verify Vietnamese text rendering
5. Check accessibility contrast ratios

### Consistency Checks

Regular audits should verify:
- [ ] All buttons use the same hover effect
- [ ] All cards follow glassmorphism pattern
- [ ] All Vietnamese text uses Be Vietnam Pro
- [ ] All spacing follows 8px grid
- [ ] All interactions have 300ms transitions
- [ ] All green accents use #0F6B3E
- [ ] All focus states show green outline

### Common Anti-Patterns to Avoid

❌ **Don't**:
- Use bright backgrounds — Breaks dark luxury theme
- Use sans-serif fonts without Vietnamese support
- Create new shades of green — Use the defined palette
- Use harsh animations — Keep motion subtle
- Uppercase Vietnamese text — Diacritics break
- Remove focus indicators — Accessibility requirement
- Use solid backgrounds on cards — Breaks glassmorphism

✅ **Do**:
- Maintain deep black background (#0B0B0B)
- Use Be Vietnam Pro for all Vietnamese text
- Use the defined emerald green (#0F6B3E)
- Keep animations under 500ms
- Respect Vietnamese diacritics with proper line-height
- Always show keyboard focus states
- Use transparent backgrounds with backdrop-blur

---

## Implementation Checklist

When building new features, ensure:

- [ ] Background is #0B0B0B
- [ ] Primary actions use #0F6B3E green
- [ ] Cards use glassmorphism (transparent + backdrop-blur)
- [ ] Vietnamese text uses Be Vietnam Pro
- [ ] Line-height is 1.5 for Vietnamese text
- [ ] Spacing follows 8px grid
- [ ] Border radius is 1.5rem for cards
- [ ] Hover states scale to 1.05
- [ ] Transitions are 300ms
- [ ] Green glow appears on primary interactive elements
- [ ] All user-facing text is in Vietnamese
- [ ] Focus indicators are visible and green
- [ ] AI responses follow professional Vietnamese tone
- [ ] Safety warnings included for health-related features
- [ ] Responsive design works on mobile (640px+)

---

**Last Updated**: 2026-05-28  
**Version**: 1.0.0  
**Maintained by**: Renfit Design Team

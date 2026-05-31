# Renfit Design System Rules

This folder contains the **design system logic** and **UI/UX guidelines** for the Renfit platform. These files serve as the single source of truth for both human developers and AI coding agents.

---

## Purpose

The `/rules` folder exists to:

1. **Maintain visual consistency** across all pages and features
2. **Enable AI-assisted development** with machine-readable design tokens
3. **Document design decisions** so future developers understand the "why"
4. **Ensure Vietnamese language support** remains a first-class concern
5. **Preserve the premium dark luxury aesthetic** as the platform grows

---

## File Structure

```
/rules
  ├── DESIGN.md      — Design tokens (YAML) + design rationale (Markdown)
  └── README.md      — This file
```

---

## DESIGN.md — The Core Design System

### Two-Layer Architecture

`DESIGN.md` uses a **dual-layer structure** inspired by Google Labs design-rule systems:

#### Layer 1: YAML Front Matter (Machine-Readable)

The top of the file contains **structured design tokens** in YAML format:

```yaml
---
colors:
  primary: "#0F6B3E"
  background: "#0B0B0B"
  text_primary: "#FFFFFF"

typography:
  heading_font: "'Be Vietnam Pro', 'Inter', sans-serif"
  body_font: "'Be Vietnam Pro', 'Inter', sans-serif"
---
```

**Purpose**:
- AI agents can parse these tokens directly
- Future tools can auto-generate CSS variables
- Ensures exact color/spacing values are consistent
- Provides a single source of truth for design decisions

#### Layer 2: Markdown Prose (Human-Readable)

Below the YAML, markdown sections explain:
- **Why** design decisions were made
- **How** to implement patterns correctly
- **When** to use specific components
- **What** to avoid (anti-patterns)

**Purpose**:
- Helps developers understand the design philosophy
- Provides context that machines can't infer
- Documents edge cases and special considerations
- Teaches the "Renfit way" of building UI

---

## How to Use These Rules

### For Human Developers

When building new features:

1. **Read DESIGN.md first** — Understand the design philosophy
2. **Reference the YAML tokens** — Use exact color/spacing values
3. **Follow the component patterns** — Don't reinvent existing UI
4. **Check the anti-patterns section** — Avoid common mistakes
5. **Verify Vietnamese text rendering** — Test with real content
6. **Run the implementation checklist** — Ensure consistency

### For AI Coding Agents

When generating or modifying code:

1. **Parse the YAML front matter** — Extract exact design token values
2. **Read the markdown context** — Understand intent behind patterns
3. **Apply tokens consistently** — Use `colors.primary` not hardcoded values
4. **Respect Vietnamese language rules** — Proper fonts, line-height, diacritics
5. **Follow accessibility guidelines** — Contrast ratios, focus states
6. **Maintain the dark luxury aesthetic** — Don't introduce conflicting styles

### For Future Extensions

When adding new pages or features:

1. **Review existing patterns** in DESIGN.md
2. **Reuse components** before creating new ones
3. **Extract new patterns** if something is used 3+ times
4. **Update DESIGN.md** if new tokens are needed
5. **Document your decisions** in the markdown sections

---

## Design System Philosophy

### Dark Luxury Fitness

Renfit's aesthetic combines:
- **Premium athleticwear** (Nike, Lululemon, Peloton)
- **Modern SaaS dashboards** (Linear, Stripe, Vercel)
- **AI-native products** (ChatGPT, Notion AI)

The result: A **sophisticated, powerful, intelligent** fitness platform that feels exclusive and cutting-edge.

### Vietnamese-First Design

**Critical requirement**: All user-facing UI must be in Vietnamese.

This means:
- **Be Vietnam Pro** as the primary font (optimized for diacritics)
- **Line-height 1.5+** to prevent accent clipping
- **No text-transform: uppercase** (breaks Vietnamese rendering)
- **Generous padding** in input fields for tall characters
- **Professional Vietnamese tone** in all AI responses

### Glassmorphism & Depth

The "frosted glass" effect creates visual hierarchy:
- **Background layer** — Deep black (#0B0B0B)
- **Image layer** — Cinematic gym photography with dark overlays
- **Card layer** — Transparent white (5%) with backdrop-blur
- **Content layer** — High-contrast white text

This creates **spatial depth** without harsh borders.

### Emerald Green as Power

The primary color (`#0F6B3E`) represents:
- Growth, transformation, energy
- Premium athletic brands
- Vietnamese cultural resonance (natural, balanced)

**Usage rules**:
- Primary CTAs only
- Hover states and glowing effects
- Active navigation items
- Progress visualization
- AI status indicators

**Don't use for**:
- Large background areas (too intense)
- Body text (readability issues)
- Decorative elements (loses impact)

---

## Component Guidelines

### Buttons

**Primary Button** (Green):
```tsx
className="px-8 py-4 bg-[#0F6B3E] hover:bg-[#0F6B3E]/90 text-white rounded-full 
           transition-all duration-300 hover:scale-105 
           hover:shadow-[0_0_30px_rgba(15,107,62,0.5)]"
```

**Secondary Button** (Transparent):
```tsx
className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-full 
           border border-white/20 transition-all duration-300"
```

**Rules**:
- Always use pill shape (`rounded-full`)
- Always include hover scale (1.05)
- Primary buttons get green glow on hover
- Use `transition-all duration-300` for smooth interactions

### Cards

**Standard Card**:
```tsx
className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10
           hover:border-[#0F6B3E]/50 transition-all duration-300 hover:scale-105"
```

**Rules**:
- Always use `backdrop-blur-sm` for glassmorphism
- Minimum padding: 2rem (32px)
- Border radius: 1.5rem (24px)
- Hover effect: green border + slight scale
- Never use solid backgrounds

### Input Fields

**Text Input**:
```tsx
className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 
           text-white placeholder:text-white/40 
           focus:outline-none focus:border-[#0F6B3E] transition-colors"
```

**Rules**:
- Transparent background (white/5%)
- Visible border (white/10%)
- Green focus state
- Placeholder at 40% opacity
- Padding: 1rem vertical (for Vietnamese diacritics)

### Navigation

**Sidebar Link** (Inactive):
```tsx
className="flex items-center gap-3 text-white/70 hover:text-[#0F6B3E] 
           hover:bg-white/5 px-4 py-3 rounded-xl transition-all"
```

**Sidebar Link** (Active):
```tsx
className="flex items-center gap-3 text-[#0F6B3E] bg-[#0F6B3E]/20 
           px-4 py-3 rounded-xl"
```

**Rules**:
- Active state uses green text + green background (20%)
- Hover state shows green text
- Icons use same color as text
- Always include transition

---

## AI UX Guidelines

### Chatbot Personality

The AI Coach should communicate like a **professional personal trainer**:

**Tone Characteristics**:
- Chuyên nghiệp (Professional)
- Thân thiện (Friendly)
- Động viên (Encouraging)
- Dựa trên khoa học (Science-based)
- An toàn (Safety-focused)

**Example Good Response**:
```
Xin chào! Tôi có thể giúp bạn với mục tiêu đó.

Để tư vấn chính xác nhất, tôi cần biết thêm:
• Cân nặng và chiều cao hiện tại?
• Mức độ tập luyện hiện tại?
• Có vấn đề sức khỏe nào cần lưu ý?

[Recommendation Cards]
```

**Example Bad Response**:
```
Ồ tuyệt vời! Giảm cân rất dễ! Chỉ cần tập nhiều và ăn ít thôi! 
💪💪💪 Bạn làm được ngay!!! 🔥🔥🔥
```

### Response Structure

Every AI response should follow this pattern:

1. **Acknowledgment** (1 sentence)
2. **Main information** (2-3 paragraphs max)
3. **Recommendation cards** (3-4 actionable options)
4. **Next step** (question or CTA)

### Safety Rules

**The AI must NEVER**:
- ❌ Diagnose medical conditions
- ❌ Recommend extreme diets or training
- ❌ Ignore mentions of pain or injury
- ❌ Give advice for serious health conditions

**The AI must ALWAYS**:
- ✅ Recommend consulting healthcare professionals for serious issues
- ✅ Ask about existing health conditions
- ✅ Start with light/moderate intensity recommendations
- ✅ Warn about injury risks

### Action Cards

After text responses, show **actionable recommendation cards**:

```tsx
<div className="grid grid-cols-3 gap-3">
  <button className="bg-white/5 hover:bg-[#0F6B3E]/20 border border-white/10 
                     hover:border-[#0F6B3E] rounded-xl p-4 transition-all">
    <Dumbbell className="w-6 h-6 text-[#0F6B3E] mb-2" />
    <div className="text-white text-sm font-medium">Tạo lịch tập</div>
    <div className="text-white/60 text-xs">Kế hoạch 12 tuần</div>
  </button>
</div>
```

**Rules**:
- Maximum 3-4 cards per response
- Each card has: icon + title + description
- Hover effect: green border
- Icons use green color (#0F6B3E)

---

## Spacing & Layout Rules

### The 8px Grid System

All spacing must follow multiples of 8:

```
 4px — Tiny gaps (icon spacing)
 8px — Compact spacing
16px — Default spacing (text to text)
24px — Comfortable spacing (between elements)
32px — Generous spacing (card padding)
48px — Section spacing (within page)
96px — Major dividers (between sections)
```

**Enforcement**:
- Use Tailwind's spacing scale: `p-4`, `gap-6`, `mb-8`, etc.
- Never use arbitrary values like `p-[13px]`

### Container Widths

```tsx
// Full-width section
<section className="py-24 px-6">
  <div className="max-w-7xl mx-auto">
    {/* Content */}
  </div>
</section>

// Reading-width content
<div className="max-w-3xl mx-auto">
  {/* Long-form Vietnamese text */}
</div>

// Form width
<div className="max-w-2xl mx-auto">
  {/* Input fields */}
</div>
```

### Responsive Patterns

**Mobile-First Approach**:
```tsx
// Start with mobile layout
<div className="grid grid-cols-1 gap-6
                md:grid-cols-2        // Tablets
                lg:grid-cols-3        // Laptops
                xl:grid-cols-4">      // Desktops
  {/* Items */}
</div>
```

**Breakpoint Usage**:
- `sm:` (640px) — Large phones
- `md:` (768px) — Tablets, small laptops
- `lg:` (1024px) — Desktops
- `xl:` (1280px) — Large desktops
- `2xl:` (1536px) — Ultra-wide screens

---

## Naming Conventions

### Component Files

```
PascalCase for components:
- Hero.tsx
- AIChatPage.tsx
- BookingFlow.tsx
```

### CSS Classes

```
Tailwind utility classes (preferred):
className="bg-[#0F6B3E] text-white rounded-full"

Custom classes (rare cases):
className="renfit-gradient-overlay"
```

### State Variables

```tsx
// Descriptive camelCase
const [selectedTrainer, setSelectedTrainer] = useState(null);
const [isBookingComplete, setIsBookingComplete] = useState(false);
const [aiResponse, setAiResponse] = useState('');
```

---

## Accessibility Checklist

When building features, ensure:

- [ ] **Keyboard navigation works** — All interactive elements accessible via Tab
- [ ] **Focus indicators visible** — Green outline on focused elements
- [ ] **Color contrast meets WCAG AAA** — 7:1 for body text, 4.5:1 for large text
- [ ] **Vietnamese diacritics render properly** — Test with real Vietnamese content
- [ ] **Alt text for images** — Descriptive, in Vietnamese
- [ ] **Form labels present** — Even if visually hidden
- [ ] **Error messages clear** — Explain what went wrong and how to fix it
- [ ] **Loading states shown** — Users know when AI is processing
- [ ] **Motion respects prefers-reduced-motion** — Disable animations if requested

---

## Common Mistakes to Avoid

### ❌ Breaking the Dark Theme

**Wrong**:
```tsx
<div className="bg-white text-black">  {/* Harsh white background */}
```

**Right**:
```tsx
<div className="bg-[#0B0B0B] text-white">  {/* Deep black background */}
```

### ❌ Ignoring Vietnamese Typography

**Wrong**:
```tsx
<p className="font-sans leading-tight">  {/* Generic font, tight line-height */}
  Nâng tầm thể chất
</p>
```

**Right**:
```tsx
<p className="leading-relaxed">  {/* Be Vietnam Pro from theme, proper spacing */}
  Nâng tầm thể chất
</p>
```

### ❌ Using Wrong Green Shades

**Wrong**:
```tsx
<button className="bg-green-500">  {/* Generic Tailwind green */}
```

**Right**:
```tsx
<button className="bg-[#0F6B3E]">  {/* Renfit emerald green */}
```

### ❌ Solid Card Backgrounds

**Wrong**:
```tsx
<div className="bg-gray-900 rounded-xl p-6">  {/* Solid background */}
```

**Right**:
```tsx
<div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
  {/* Glassmorphism */}
</div>
```

### ❌ Uppercase Vietnamese Text

**Wrong**:
```tsx
<h1 className="uppercase">NÂNG TẦM THỂ CHẤT</h1>  {/* Breaks diacritics */}
```

**Right**:
```tsx
<h1>Nâng Tầm Thể Chất</h1>  {/* Proper casing */}
```

---

## Updating the Design System

### When to Update DESIGN.md

Add new tokens when:
- A new color is used 3+ times across the app
- A new component pattern emerges
- Typography or spacing patterns change
- New AI UX guidelines are established

### How to Update

1. **Update YAML tokens first** — Add machine-readable values
2. **Document in markdown** — Explain the reasoning
3. **Update existing components** — Ensure consistency
4. **Test with Vietnamese content** — Verify rendering
5. **Update this README** — If navigation or structure changes

### Version Control

When making significant updates:

```yaml
---
# At bottom of DESIGN.md
version: "1.1.0"
last_updated: "2026-06-15"
changelog:
  - "Added new AI safety guidelines"
  - "Updated button hover states"
  - "Clarified Vietnamese typography rules"
---
```

---

## Getting Help

### For Developers

If you're unsure about:
- **Component patterns** → Check DESIGN.md component section
- **Color usage** → Reference YAML `colors:` tokens
- **Vietnamese text** → See typography section
- **Spacing** → Use 8px grid system

### For AI Agents

When generating code:
1. Parse `/rules/DESIGN.md` YAML for exact values
2. Read markdown sections for context
3. Apply patterns consistently
4. Verify Vietnamese language support
5. Follow accessibility guidelines

### For Designers

When proposing new features:
1. Ensure it fits the dark luxury aesthetic
2. Use the defined color palette
3. Consider Vietnamese text rendering
4. Maintain glassmorphism style
5. Document new patterns in DESIGN.md

---

## Quick Reference

### Essential Colors
```
Primary Green:  #0F6B3E
Background:     #0B0B0B
Text Primary:   #FFFFFF
Text Secondary: rgba(255, 255, 255, 0.6)
Border:         rgba(255, 255, 255, 0.1)
```

### Essential Spacing
```
Card Padding:    2rem (32px)
Section Padding: 6rem (96px) vertical
Border Radius:   1.5rem (24px) for cards
Button Radius:   9999px (pill shape)
```

### Essential Fonts
```
Primary:  'Be Vietnam Pro'
Fallback: 'Inter'
Size:     16px (1rem) for body
Line Height: 1.5 for Vietnamese
```

### Essential Components
```
Button:  bg-[#0F6B3E] rounded-full px-8 py-4 hover:scale-105
Card:    bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10
Input:   bg-white/5 border border-white/10 rounded-2xl px-6 py-4
```

---

**Remember**: This design system exists to maintain **consistency** and **quality**. When in doubt, follow the established patterns. When innovating, document your decisions.

**Last Updated**: 2026-05-28  
**Maintained by**: Renfit Development Team

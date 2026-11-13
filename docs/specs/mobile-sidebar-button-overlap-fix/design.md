# Mobile Sidebar Button Overlap Fix — Bugfix Design

## Overview

The mobile navigation sidebar for unauthenticated users has a visual overlap bug: the "Đặt Lịch Ngay" (Book Now) pill button and the "Đăng nhập" (Login) link visually overlap instead of stacking vertically. The root cause is that `react-router`'s `<Link>` renders an `<a>` element (inline by default), so Tailwind's `space-y-4` on the parent `<div>` doesn't apply vertical spacing between them. The fix is purely CSS — add `block` display classes to both mobile-menu links so they participate in block-level flow.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug — mobile viewport, menu open, user unauthenticated, causing the two links to render inline and overlap.
- **Property (P)**: The desired behavior — both links render as block-level elements stacking vertically with `space-y-4` spacing.
- **Preservation**: Desktop navigation layout (horizontal flex), authenticated user mobile menu, and section anchor links must remain unchanged.
- **Navigation component**: `frontend/src/app/components/Navigation.tsx` — the top-level nav bar with responsive desktop/mobile rendering.
- **Link component**: `frontend/src/app/components/Link.tsx` — thin wrapper around `react-router`'s `<RouterLink>`, renders an `<a>` element that defaults to `display: inline`.

## Bug Details

### Bug Condition

The bug manifests when an unauthenticated user opens the mobile hamburger menu. The two `<Link>` elements ("Đặt Lịch Ngay" and "Đăng nhập") render as inline `<a>` tags. The parent container applies `space-y-4` which only adds vertical margin between block-level siblings. Since both links are inline, they don't form separate block boxes — they share the same line box and visually collide.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type NavigationRenderContext
  OUTPUT: boolean

  RETURN input.viewport = "mobile"
         AND input.menuOpen = true
         AND input.user = null
END FUNCTION
```

### Examples

- **Mobile, unauthenticated, menu open**: "Đặt Lịch Ngay" pill overlaps "Đăng nhập" text link — the two render on the same line or with zero vertical gap despite `space-y-4` on the parent. **Expected**: stacked vertically with 1rem (16px) gap.
- **Mobile, unauthenticated, menu closed**: No overlap visible — menu is hidden. **Expected**: No change (menu stays hidden).
- **Desktop, unauthenticated**: "Đặt Lịch Ngay" and "Đăng nhập" sit side-by-side in a horizontal flex container. **Expected**: No change — horizontal layout is correct.
- **Mobile, authenticated, menu open**: "Vào trang chủ" link already has `flex items-center justify-center` making it block-level. **Expected**: No overlap exists, no change needed.

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Desktop navigation for unauthenticated users: "Đặt Lịch Ngay" and "Đăng nhập" remain side-by-side as inline-flex items within `flex items-center gap-3`.
- Desktop navigation for authenticated users: dashboard button, avatar, and logout button layout unchanged.
- Mobile menu for authenticated users: "Vào trang chủ" button, avatar row, and logout button stack correctly (already block/flex).
- Section anchor links ("Về Chúng Tôi", "Dịch Vụ", "Huấn Luyện Viên") in mobile menu: already have `block` class and display correctly.

**Scope:**
All contexts where `isBugCondition` is false should be completely unaffected by this fix. The change only adds `block` to two specific `<Link>` elements inside the `{!user && isOpen}` mobile branch — it cannot affect desktop layout or authenticated user flows because those are separate JSX branches.

## Hypothesized Root Cause

Based on code analysis, the root cause is confirmed:

1. **Missing `block` class on "Đặt Lịch Ngay" Link (line ~149)**: The link has `w-full text-center rounded-full` classes but no explicit display class. Since `<a>` is inline by default, `w-full` has no effect (inline elements don't accept width), and the element doesn't form its own block box. The `space-y-4` parent spacing is skipped because spacing applies between block-level children only.

2. **Missing `block` class on "Đăng nhập" Link (line ~152)**: Same issue — renders inline, doesn't participate in vertical flow.

3. **Contrast with working elements**: The section links above ("Về Chúng Tôi" etc.) explicitly have `className="block ..."` and display correctly. The authenticated mobile menu's "Vào trang chủ" link has `flex items-center justify-center` which makes it block-level. Only the unauthenticated branch is missing display classes.

## Correctness Properties

Property 1: Bug Condition - Mobile Unauthenticated Menu Items Stack Without Overlap

_For any_ render where the viewport is mobile, the menu is open, and the user is unauthenticated (isBugCondition returns true), the "Đặt Lịch Ngay" link SHALL render as a block-level element (computed display is `block`) occupying full width, and its bottom edge SHALL be at least `1rem` above the top edge of the "Đăng nhập" link, producing a clean vertical stack.

**Validates: Requirements 2.1, 2.2**

Property 2: Preservation - Desktop and Authenticated Layouts Unchanged

_For any_ render where isBugCondition is false (desktop viewport, or authenticated user, or menu closed), the Navigation component SHALL produce the same visual output as the original code — desktop horizontal flex layout is preserved, authenticated mobile menu stacking is preserved, and section anchor link stacking is preserved.

**Validates: Requirements 3.1, 3.2, 3.3**

## Fix Implementation

### Changes Required

**File**: `frontend/src/app/components/Navigation.tsx`

**Specific Changes**:

1. **Add `block` to "Đặt Lịch Ngay" Link (mobile, unauthenticated)** — line ~149:
   - Current: `className="w-full bg-[#0F6B3E] hover:bg-[#0F6B3E]/90 text-white px-6 py-2 rounded-full transition-all duration-300 text-center"`
   - Fixed: `className="block w-full bg-[#0F6B3E] hover:bg-[#0F6B3E]/90 text-white px-6 py-2 rounded-full transition-all duration-300 text-center"`

2. **Add `block` to "Đăng nhập" Link (mobile, unauthenticated)** — line ~152:
   - Current: `className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"`
   - Fixed: `className="block text-white/70 hover:text-white transition-colors"`
   - Note: The `flex items-center gap-2` is unnecessary here — "Đăng nhập" is plain text with no icon. Changing to `block` is sufficient and cleaner. However, since the existing desktop version also uses `flex items-center gap-1.5`, and this mobile link has no icon child, simplifying to `block` is appropriate.

3. **No changes to desktop nav**: The desktop `<Link to="/login">` elements live in a separate JSX branch (`hidden md:flex`) and use flex container alignment — they are not affected.

4. **No changes to authenticated mobile branch**: The "Vào trang chủ" link already has `flex items-center justify-center` making it block-level. The avatar/logout row uses a wrapping `<div className="flex items-center gap-3">`.

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, confirm the bug exists on unfixed code via rendered DOM inspection, then verify the fix resolves the overlap and preserves all other layouts.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm that the `<a>` elements render without block display.

**Test Plan**: Render the `Navigation` component in a mobile-width container with no authenticated user and menu open. Query the "Đặt Lịch Ngay" and "Đăng nhập" links and assert their computed/applied classes.

**Test Cases**:
1. **Inline Display Test**: Render Navigation (unauthenticated, mobile, open) — assert "Đặt Lịch Ngay" link does NOT have `block` or `flex` class (will pass on unfixed code, confirming the bug)
2. **Width Ineffective Test**: Assert that "Đặt Lịch Ngay" link has `w-full` but since it's inline, its rendered width is less than container width (will demonstrate the bug)
3. **Overlap Detection Test**: Measure bounding rects of both links — assert they overlap vertically (will confirm the visual bug)

**Expected Counterexamples**:
- The "Đặt Lịch Ngay" `<a>` element has no `block`/`flex` in its className
- The element doesn't take full width despite `w-full` class
- Both links share the same vertical space

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed component produces properly stacked block-level elements.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  rendered := renderNavigation_fixed(input)
  bookLink := rendered.getByText("Đặt Lịch Ngay")
  loginLink := rendered.getByText("Đăng nhập")
  ASSERT bookLink.className CONTAINS "block"
  ASSERT loginLink.className CONTAINS "block"
  ASSERT bookLink AND loginLink are separate block boxes
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed component produces the same rendered output.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT renderNavigation_original(input) = renderNavigation_fixed(input)
END FOR
```

**Testing Approach**: Since the fix only touches two className strings inside a specific JSX branch (`!user` + mobile menu open), preservation is structurally guaranteed for all other branches. Testing focuses on verifying the desktop and authenticated branches are byte-identical in their rendered HTML.

**Test Plan**: Render the Navigation component in desktop viewport and authenticated mobile scenarios. Assert the className strings of the desktop "Đặt Lịch Ngay" and "Đăng nhập" links remain unchanged.

**Test Cases**:
1. **Desktop Layout Preservation**: Render at desktop width — verify "Đặt Lịch Ngay" and "Đăng nhập" are inside a `flex items-center gap-3` container with no `block` class added
2. **Authenticated Mobile Preservation**: Render authenticated + mobile + open — verify "Vào trang chủ" still has `flex items-center justify-center` and stacks properly
3. **Section Links Preservation**: Render mobile + open — verify "Về Chúng Tôi", "Dịch Vụ", "Huấn Luyện Viên" retain `block` class unchanged

### Unit Tests

- Test that mobile unauthenticated menu renders "Đặt Lịch Ngay" with `block` class
- Test that mobile unauthenticated menu renders "Đăng nhập" with `block` class
- Test that desktop nav links do NOT have `block` class added
- Test that authenticated mobile menu is unaffected

### Property-Based Tests

- Generate random viewport/auth/menuState combinations and verify: if `isBugCondition` holds, both links have block display; otherwise the component renders identically to the original
- Generate various user objects (null, with avatar, without avatar) and verify mobile menu layout consistency

### Integration Tests

- Open mobile menu as unauthenticated user — visually confirm no overlap (manual/Playwright)
- Open mobile menu as authenticated user — confirm layout unchanged
- Resize from mobile to desktop — confirm desktop layout unaffected

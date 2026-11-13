# BF-1: Mobile Sidebar Button Overlap Fix

**Date**: 2026-08-04
**Component**: `frontend/src/app/components/Navigation.tsx`
**Spec**: `docs/specs/mobile-sidebar-button-overlap-fix/`

## Problem
On mobile, when the hamburger menu is opened for unauthenticated users, the "Đặt Lịch Ngay" (Book Now) green pill button visually overlaps the "Đăng nhập" (Login) link below it instead of stacking vertically.

## Root Cause
React Router's `<Link>` renders an `<a>` element (inline by default). The parent container uses `space-y-4` which only creates vertical spacing between block-level children. Since both links lacked an explicit `block` (or `flex`/`inline-block`) display class, they didn't form separate block boxes and the spacing was ineffective.

Contrast with working elements in the same menu:
- Section links ("Về Chúng Tôi" etc.) explicitly have `className="block ..."` — they work correctly.
- Authenticated "Vào trang chủ" link has `flex items-center justify-center` — effectively block-level.

## Fix (2 lines changed)

**"Đặt Lịch Ngay" Link** (mobile, unauthenticated):
- Before: `className="w-full bg-[#0F6B3E] hover:bg-[#0F6B3E]/90 text-white px-6 py-2 rounded-full transition-all duration-300 text-center"`
- After: `className="block w-full bg-[#0F6B3E] hover:bg-[#0F6B3E]/90 text-white px-6 py-2 rounded-full transition-all duration-300 text-center"`

**"Đăng nhập" Link** (mobile, unauthenticated):
- Before: `className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"`
- After: `className="block text-white/70 hover:text-white transition-colors"`
- Note: `flex items-center gap-2` was unnecessary — this link has no icon child, only text.

## Preservation
- Desktop navigation layout (horizontal `flex items-center gap-3` container) — unchanged.
- Authenticated mobile menu ("Vào trang chủ" + avatar row) — unchanged.
- Section anchor links ("Về Chúng Tôi", "Dịch Vụ", "Huấn Luyện Viên") — unchanged (already `block`).

## Tests Added
`frontend/src/app/components/Navigation.test.tsx` (3 property-based tests):
1. **Bug condition**: Asserts both mobile unauthenticated links have `block` class (using fast-check).
2. **Desktop preservation**: Desktop links do NOT get `block` (horizontal flex layout preserved).
3. **Section links preservation**: Mobile section links retain `block` class.

## Verification
- `npm run build`: 2502 modules, no errors.
- `npm run test`: 57 test files, 199 tests — all pass.

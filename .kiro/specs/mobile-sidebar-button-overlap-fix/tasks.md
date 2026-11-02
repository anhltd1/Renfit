# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Mobile Unauthenticated Menu Items Missing Block Display
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to the concrete failing case: unauthenticated user, mobile viewport, menu open — the "Đặt Lịch Ngay" and "Đăng nhập" links lack `block` class
  - Create `frontend/src/app/components/Navigation.test.tsx` (colocated)
  - Mock `../../lib/auth` with `getAuthUser: () => null` to simulate unauthenticated user
  - Render `<Navigation />` inside `<MemoryRouter>`, simulate mobile by ensuring the `md:hidden` menu is visible (menu open state)
  - Use `fireEvent.click` on the hamburger button (aria-label "Mở menu") to open the mobile menu
  - Query the "Đặt Lịch Ngay" link and assert its className contains `block`
  - Query the "Đăng nhập" link and assert its className contains `block`
  - Property: `fc.assert(fc.property(fc.constant(null), () => { /* render and assert block class presence */ }))` — for the deterministic bug condition (user=null, mobile, open)
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (both links lack `block` class, confirming the bug exists)
  - Document counterexamples: "Đặt Lịch Ngay" has className `w-full bg-[#0F6B3E] ... text-center` but no `block`; "Đăng nhập" has `flex items-center gap-2` but no `block`
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Desktop and Authenticated Mobile Layouts Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: Desktop unauthenticated nav — "Đặt Lịch Ngay" link does NOT have `block` class (it's inside `flex items-center gap-3` container, rendered side-by-side)
  - Observe: Desktop unauthenticated nav — "Đăng nhập" link has `flex items-center gap-1.5` for horizontal layout
  - Observe: Mobile authenticated menu — "Vào trang chủ" link has `flex items-center justify-center` (already block-level)
  - Observe: Mobile section links ("Về Chúng Tôi", "Dịch Vụ", "Huấn Luyện Viên") have `block` class
  - Write property-based test with `fc.oneof(fc.constant('desktop-unauth'), fc.constant('mobile-auth'), fc.constant('section-links'))` to generate non-buggy contexts
  - For `desktop-unauth`: render at desktop (menu not open) — verify "Đặt Lịch Ngay" is inside `hidden md:flex` container and does NOT have `block` class; verify "Đăng nhập" link retains `flex items-center gap-1.5`
  - For `mobile-auth`: mock `getAuthUser` returning a user object, open menu — verify "Vào trang chủ" has `flex items-center justify-center` class
  - For `section-links`: open mobile menu — verify "Về Chúng Tôi", "Dịch Vụ", "Huấn Luyện Viên" each have `block` class
  - Verify all preservation tests PASS on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 3. Fix mobile sidebar button overlap

  - [x] 3.1 Implement the CSS fix in Navigation.tsx
    - Add `block` class to "Đặt Lịch Ngay" `<Link>` in mobile unauthenticated menu (line ~149): change className from `"w-full bg-[#0F6B3E] hover:bg-[#0F6B3E]/90 text-white px-6 py-2 rounded-full transition-all duration-300 text-center"` to `"block w-full bg-[#0F6B3E] hover:bg-[#0F6B3E]/90 text-white px-6 py-2 rounded-full transition-all duration-300 text-center"`
    - Change "Đăng nhập" `<Link>` in mobile unauthenticated menu (line ~152): change className from `"flex items-center gap-2 text-white/70 hover:text-white transition-colors"` to `"block text-white/70 hover:text-white transition-colors"` (no icon child, `flex` unnecessary)
    - _Bug_Condition: isBugCondition(input) where input.viewport = "mobile" AND input.menuOpen = true AND input.user = null_
    - _Expected_Behavior: Both links render as block-level elements, stacking vertically with space-y-4 spacing_
    - _Preservation: Desktop nav layout (horizontal flex), authenticated mobile menu, and section anchor links remain unchanged_
    - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.3_

  - [x] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Mobile Unauthenticated Menu Items Stack Without Overlap
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior (both links have `block` class)
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed — both links now have `block` display)
    - _Requirements: 2.1, 2.2_

  - [x] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Desktop and Authenticated Layouts Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions — desktop layout, authenticated mobile menu, and section links are all unchanged)
    - Confirm all tests still pass after fix (no regressions)

- [x] 4. Checkpoint - Ensure all tests pass
  - Run `npm run build` in `frontend/` to verify no type/build errors
  - Run `npm run test` in `frontend/` to verify all unit and property tests pass
  - Ensure all tests pass, ask the user if questions arise.

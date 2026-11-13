# Bugfix Requirements Document

## Introduction

The mobile navigation sidebar on the landing page has a visual overlap bug affecting unauthenticated users. When the hamburger menu is opened, the "Đặt Lịch Ngay" (Book Now) pill button visually overlaps the "Đăng nhập" (Login) link below it, instead of stacking vertically with the `space-y-4` gap defined by the parent container. The root cause is that the `Link` component renders an `<a>` element (inline by default), and the "Đặt Lịch Ngay" link lacks an explicit `block` display class — making `w-full` ineffective and breaking the vertical flow.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the mobile hamburger menu is opened by an unauthenticated user THEN the "Đặt Lịch Ngay" link renders as an inline element despite having `w-full text-center` classes, causing it to not participate correctly in the parent's `space-y-4` block-level flow

1.2 WHEN the mobile hamburger menu is opened by an unauthenticated user THEN the "Đặt Lịch Ngay" button visually overlaps or collides with the "Đăng nhập" link below it instead of stacking with proper spacing

### Expected Behavior (Correct)

2.1 WHEN the mobile hamburger menu is opened by an unauthenticated user THEN the "Đặt Lịch Ngay" link SHALL render as a block-level element so that `w-full` applies correctly and it occupies its own row in the vertical menu layout

2.2 WHEN the mobile hamburger menu is opened by an unauthenticated user THEN the "Đặt Lịch Ngay" button and the "Đăng nhập" link SHALL stack vertically with consistent spacing (governed by `space-y-4` on the parent container) with no visual overlap

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the mobile hamburger menu is opened by an authenticated user THEN the "Vào trang chủ" button, avatar, and logout control SHALL CONTINUE TO stack and display correctly with proper spacing

3.2 WHEN the desktop navigation is displayed for an unauthenticated user THEN the "Đặt Lịch Ngay" button and "Đăng nhập" link SHALL CONTINUE TO render side-by-side as inline-flex items in the horizontal nav bar

3.3 WHEN the mobile hamburger menu is opened THEN the section links ("Về Chúng Tôi", "Dịch Vụ", "Huấn Luyện Viên") SHALL CONTINUE TO stack vertically with `block` display and proper spacing

---

## Bug Condition (Formal)

```pascal
FUNCTION isBugCondition(X)
  INPUT: X of type NavigationRenderContext
  OUTPUT: boolean

  // The bug triggers when: mobile viewport, menu is open, user is not authenticated
  RETURN X.viewport = "mobile" AND X.menuOpen = true AND X.user = null
END FUNCTION
```

```pascal
// Property: Fix Checking — Mobile unauthenticated menu items stack without overlap
FOR ALL X WHERE isBugCondition(X) DO
  rendered ← renderNavigation'(X)
  bookButton ← rendered.querySelector("[Đặt Lịch Ngay]")
  loginLink ← rendered.querySelector("[Đăng nhập]")
  ASSERT computedDisplay(bookButton) IN {"block", "flex", "inline-block"}
  ASSERT boundingRect(bookButton).bottom <= boundingRect(loginLink).top
END FOR
```

```pascal
// Property: Preservation Checking — Non-buggy contexts unchanged
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT renderNavigation(X) = renderNavigation'(X)
END FOR
```

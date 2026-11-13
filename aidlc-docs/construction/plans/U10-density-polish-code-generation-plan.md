# U10 Density & Polish — Code Generation Plan

**Unit**: U10 Density & Polish
**FRs**: FR-1 (Admin density + member lighter density), FR-11 (remove "Đang hoạt động"), NFR-1 (micro-interactions)
**Backend changes**: None
**Dependencies**: None (first unit)

---

## Step 1: Add utility CSS for stagger animation + pull-to-refresh

- [x] `frontend/src/styles/theme.css` — Add `@keyframes fade-up` + `.animate-fade-up` with stagger delay CSS custom property; add `.animate-stagger-N` classes (N=1..12, each 40ms); add pull-to-refresh indicator styles

**Files**: `theme.css`

---

## Step 2: Remove "Đang hoạt động" status indicators

- [x] `frontend/src/app/components/chat/ChatPanel.tsx` — Remove the green dot + "Đang hoạt động" / "Đang trả lời..." text block from the header. Keep the header title "Renfit AI Coach" only.
- [x] `frontend/src/app/desktop/components/DesktopHeader.tsx` — Remove the green dot + "Đang hoạt động" line below the title
- [x] `frontend/src/app/components/AIChat.tsx` — Remove the green dot + "Đang hoạt động" text from the chat preview card

**Files**: 3 files

---

## Step 3: Admin density pass — Admin header & tabs

- [x] `frontend/src/app/desktop/components/DesktopAdminHeader.tsx` — Reduce padding (`py-3.5` → `py-2.5`, `px-5` → `px-4`), tab pills smaller (`px-3 py-1.5` → `px-2.5 py-1`), text `text-sm` → `text-xs` for secondary info
- [ ] `frontend/src/app/mobile/shell/AdminBottomTabBar.tsx` — Tighten padding if applicable

**Files**: 2 files

---

## Step 4: Admin density pass — Customer sidebar & list

- [x] `frontend/src/app/desktop/components/CustomerSidebar.tsx` — Reduce row padding, compact search input, smaller avatar in rows
- [x] `frontend/src/app/desktop/components/SidebarRow.tsx` — Tighter padding (`py-3 px-4` → `py-2 px-3`), smaller text
- [x] `frontend/src/app/mobile/screens/CustomerListScreen.tsx` — Same density treatment for mobile list rows

**Files**: 3 files

---

## Step 5: Admin density pass — Customer detail & notes

- [x] `frontend/src/app/desktop/components/CustomerDetail.tsx` — Reduce hero padding, info field spacing
- [ ] `frontend/src/app/mobile/screens/CustomerDetailScreen.tsx` — Same for mobile
- [x] `frontend/src/app/components/TrainerNotes.tsx` — Tighter note cards, compact input area

**Files**: 3 files

---

## Step 6: Admin density pass — Booking calendar

- [x] `frontend/src/app/components/AdminBookings.tsx` — Reduce sub-header padding (`px-6 py-4` → `px-4 py-3`), nav bar padding, cell min-height (`min-h-[88px]` → `min-h-[72px]`), booking pill padding

**Files**: 1 file

---

## Step 7: Member-side lighter density pass

- [x] `frontend/src/app/desktop/components/OverviewTab.tsx` — Reduce form section padding where excessive
- [x] `frontend/src/app/mobile/screens/OverviewScreen.tsx` — Reduce card spacing (`space-y-3` → `space-y-2`)
- [ ] `frontend/src/app/mobile/screens/ProfileScreen.tsx` — Tighten form spacing if needed
- [ ] `frontend/src/app/components/BookingCalendar.tsx` — Slight padding reduction on slot cells

**Files**: 4 files

---

## Step 8: Skeleton loading patterns

- [x] Create `frontend/src/app/shared/primitives/Skeleton.tsx` — reusable skeleton component (`<Skeleton className="h-4 w-32" />` renders a rounded shimmer block)
- [ ] `frontend/src/app/components/TrainerNotes.tsx` — Replace `<Loader2>` spinner with skeleton rows matching note layout
- [x] `frontend/src/app/desktop/components/CustomerSidebar.tsx` — Replace loading spinner with skeleton rows matching list row shape
- [x] `frontend/src/app/mobile/screens/CustomerListScreen.tsx` — Same skeleton treatment
- [ ] `frontend/src/app/components/AdminBookings.tsx` — Replace centered spinner with skeleton grid matching calendar shape
- [ ] `frontend/src/app/components/NotificationBell.tsx` — Skeleton for notification dropdown loading state
- [ ] `frontend/src/app/components/TrainerNotificationBell.tsx` — Same

**Files**: 7 files (1 new + 6 modified)

---

## Step 9: List entrance stagger animation

- [x] `frontend/src/app/desktop/components/CustomerSidebar.tsx` — Add stagger classes to list rows on data load
- [ ] `frontend/src/app/mobile/screens/CustomerListScreen.tsx` — Same
- [ ] `frontend/src/app/components/AdminBookings.tsx` — Stagger on booking pills within cells (on data refresh)
- [ ] `frontend/src/app/components/TrainerNotes.tsx` — Stagger on note cards

**Files**: 4 files

---

## Step 10: Retire decorative animate-pulse

- [x] `frontend/src/app/components/LiveClock.tsx` — Remove `animate-pulse` from the colon separator (use solid `text-[#0F6B3E]` instead)
- [x] `frontend/src/app/components/CalendarKiosk.tsx` — Same for kiosk clock colon
- [x] `frontend/src/app/components/AIChat.tsx` — Remove pulsing background blobs (keep static gradient or remove entirely)
- [x] Keep `animate-pulse` only on genuinely live indicators: pending booking dots in kiosk, skeleton shimmer

**Files**: 3 files

---

## Step 11: Empty states with voice

- [x] `frontend/src/app/desktop/components/CustomerSidebar.tsx` — Replace "Chưa có hội viên." with icon + encouraging text + action hint
- [x] `frontend/src/app/mobile/screens/CustomerListScreen.tsx` — Same
- [x] `frontend/src/app/components/NotificationBell.tsx` — Replace "Chưa có thông báo nào." with icon + friendly text
- [x] `frontend/src/app/components/TrainerNotificationBell.tsx` — Same
- [x] `frontend/src/app/components/TrainerNotes.tsx` — Replace "Chưa có ghi chú nào." with icon + hint to write the first note
- [ ] `frontend/src/app/components/InbodyCharts.tsx` — Already has decent empty labels; verify they include an action hint

**Files**: 6 files

---

## Step 12: Haptics

- [x] Create `frontend/src/app/shared/primitives/haptics.ts` — `export function haptic(ms = 10) { navigator.vibrate?.(ms); }` utility
- [x] `frontend/src/app/components/AdminBookings.tsx` — Call `haptic()` on status change confirm, assign confirm
- [x] `frontend/src/app/components/BookingCalendar.tsx` — Call `haptic()` on booking create/cancel confirm
- [x] `frontend/src/app/mobile/shell/BottomTabBar.tsx` — Call `haptic()` on tab switch
- [x] `frontend/src/app/mobile/shell/AdminBottomTabBar.tsx` — Same

**Files**: 5 files (1 new + 4 modified)

---

## Step 13: Pull-to-refresh on mobile

- [x] Create `frontend/src/app/shared/primitives/PullToRefresh.tsx` — wrapper component that detects overscroll pull gesture and calls `onRefresh`
- [ ] `frontend/src/app/mobile/screens/OverviewScreen.tsx` — Wrap content in PullToRefresh
- [x] `frontend/src/app/mobile/screens/CustomerListScreen.tsx` — Same
- [ ] `frontend/src/app/mobile/screens/ProgressScreen.tsx` — Same

**Files**: 4 files (1 new + 3 modified)

---

## Step 14: Verify & test

- [x] Run `npm run build` — confirm no errors
- [x] Run `npm run test` — confirm all tests pass (update test assertions for removed "Đang hoạt động" text and changed empty-state text if tests assert on those strings)
- [x] Clean up `dist/`

**Files**: Test files as needed

---

## Summary

- **Total steps**: 14
- **New files**: 4 (`Skeleton.tsx`, `haptics.ts`, `PullToRefresh.tsx`, theme.css additions)
- **Modified files**: ~30 (density + polish across admin and member views)
- **Deleted files**: 0
- **Backend changes**: 0

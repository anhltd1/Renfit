# U11 Admin Today Screen — Code Generation Plan

**Unit**: U11 Admin Today Screen
**FRs**: FR-2 (Admin "Today" landing screen)
**Dependencies**: U10 (density patterns established)

---

## Step 1: Backend — New `/api/v1/admin/today` endpoint

- [x] Add `TodayResponse` Pydantic models to `backend/src/api/admin.py`
- [x] Add `GET /api/v1/admin/today` endpoint

## Step 2: Backend — Verify endpoint works

- [x] Confirm `import src.main` succeeds
- [x] Test endpoint manually if Docker is running

## Step 3: Frontend API client — `fetchToday()`

- [x] Add `TodaySession`, `PendingBooking`, `TodayData` interfaces to `frontend/src/lib/api/admin.ts`
- [x] Add `fetchToday(): Promise<TodayData>` function

## Step 4: Frontend hook — `useAdminToday`

- [x] Create `frontend/src/app/shared/hooks/useAdminToday.ts`

## Step 5: Frontend — `AdminTodayScreen` component (desktop)

- [x] Create `frontend/src/app/desktop/components/AdminTodayScreen.tsx`

## Step 6: Frontend — Admin tab restructure (desktop)

- [x] Modify `frontend/src/app/desktop/pages/AdminDashboardPage.tsx`
- [x] Modify `frontend/src/app/desktop/components/DesktopAdminHeader.tsx`

## Step 7: Frontend — Admin tab restructure (mobile)

- [x] Modify `frontend/src/app/mobile/shell/AdminBottomTabBar.tsx`
- [x] Modify `frontend/src/app/mobile/pages/AdminDashboardPage.tsx`
- [x] Reused desktop `AdminTodayScreen` for mobile (same component, responsive layout)

## Step 8: Update notification navigation targets

- [x] `DesktopAdminHeader.tsx` — updated onNavigate to handle 'today'
- [x] Mobile `AdminDashboardPage.tsx` — handleNotificationNavigate handles 'today'

## Step 9: Verify & test

- [x] Run `npm run build` — no errors
- [x] Run `npm run test` — 56 files / 197 tests pass (updated AdminDashboardPage.test.tsx for new default tab)
- [x] Clean up `dist/`

---

## Summary

- **Total steps**: 9
- **New files**: 4 (endpoint additions in admin.py, `useAdminToday.ts`, `AdminTodayScreen.tsx` desktop, `AdminTodayScreen.tsx` mobile)
- **Modified files**: ~6 (admin.ts API client, AdminDashboardPage desktop + mobile, DesktopAdminHeader, AdminBottomTabBar, TrainerNotificationBell)
- **Backend changes**: 1 new endpoint

# U13 Batch Pre-Booking — Code Generation Plan

**Unit**: U13 Batch Pre-Booking
**FRs**: FR-3 (Batch pre-booking)
**Dependencies**: U12 (blocked slots rendered in calendar — batch mode must skip them)

---

## Step 1: Backend — Batch-assign endpoint

- [ ] Add `BatchAssignRequest` model: `{ customer_id: str, times: list[str] }`
- [ ] Add `BatchAssignResult` model: `{ time: str, success: bool, message: str }`
- [ ] Add `POST /api/v1/admin/bookings/batch-assign` endpoint:
  - Loop `admin_assign_booking` per time slot
  - Collect per-slot results (success/fail + message)
  - Send ONE summary notification to the member (not N individual ones)
  - Suppress trainer self-notification for batch assignments
  - Return `{ results: list[BatchAssignResult], notification_sent: bool }`

**Files**: `backend/src/api/admin.py`

---

## Step 2: Backend — Summary notification helper

- [ ] Add `notify_batch_booking` function to `notification_service.py`:
  - Creates a single `Notification` for the member: type `booking_approved`, related_id = composite key (e.g. first booking id), message "HLV đã đặt N buổi tập cho bạn"
  - Uses existing `create_notification` pattern

**Files**: `backend/src/services/notification_service.py`

---

## Step 3: Backend — Verify

- [ ] Confirm `import src.main` succeeds
- [ ] Rebuild backend container

**Files**: None

---

## Step 4: Frontend API client

- [ ] Add `batchAssign(customerId, times)` function to `lib/api/admin.ts`
- [ ] Add `BatchAssignResult` interface

**Files**: `frontend/src/lib/api/admin.ts`

---

## Step 5: Frontend — useBatchBooking hook

- [ ] Create `frontend/src/app/shared/hooks/useBatchBooking.ts`
- [ ] Manages: `active` (mode on/off), `member` (selected customer), `stagedSlots` (Set of time keys), `toggleSlot`, `submit`, `reset`, `submitting`
- [ ] On submit: call `batchAssign`, return results, reset state

**Files**: 1 new file

---

## Step 6: Frontend — BatchBookingMode component

- [ ] Create `frontend/src/app/components/BatchBookingMode.tsx`
- [ ] UI elements:
  - Member picker (search + select from customer list, compact)
  - Visual overlay on the calendar: staged slots shown with dashed emerald border
  - Bottom bar: `"{Name} · {N} buổi đã chọn"` with Huỷ / Xác nhận buttons
  - Full-slot warning: count full slots and show confirmation prompt before submit
  - Already-booked-by-same-member slots: unselectable (greyed out)
  - Blocked slots: unselectable (already handled by U12)

**Files**: 1 new file

---

## Step 7: Frontend — Integrate into AdminBookings

- [ ] `AdminBookings.tsx`:
  - Add "Đặt lịch loạt" toggle button in the sub-header (next to "Chặn giờ")
  - When batch mode active: overlay cells become toggleable (tap = stage/unstage)
  - Render staged slots with dashed emerald outline
  - Show the BatchBookingMode bottom bar
  - Disable other interactions (status change, assign) while batch mode is active
  - On submit success: refetch data, exit batch mode, show toast

**Files**: `AdminBookings.tsx`

---

## Step 8: Verify & test

- [ ] `npm run build` — no errors
- [ ] `npm run test` — all pass
- [ ] Clean up `dist/`

**Files**: Test files as needed

---

## Summary

- **Total steps**: 8
- **New files**: 3 (`useBatchBooking.ts`, `BatchBookingMode.tsx`, notification helper)
- **Modified files**: ~3 (`admin.py`, `admin.ts`, `AdminBookings.tsx`, `notification_service.py`)
- **Backend changes**: 1 new endpoint, 1 new notification helper

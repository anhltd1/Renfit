# U22 Attendance Tracking — Backend Summary

## Changes
| File | Change |
|---|---|
| `backend/src/schema/booking.py` | `BookingStatus.COMPLETED = "completed"`, `NO_SHOW = "no_show"` |
| `backend/src/schema/mongo.py` | `Bookings.status` validator enum + `completed`, `no_show` |
| `backend/src/main.py` | New startup hook `_sync_bookings_validator`: idempotent `collMod` with the current validator (skips if collection missing, logs + continues on any error, never touches data) |
| `backend/src/services/booking_service.py` | `ACTIVE_STATUSES` = pending, approved, completed, no_show; new `OPEN_STATUSES` (pending, approved), `ATTENDANCE_STATUSES`, `_TRANSITIONS`; rewritten `set_booking_status`; `_slot_started`; `attendance_summary(customer_id)`; guards in `cancel_customer_booking` and `admin_assign_booking`; AI `my_upcoming_bookings` limited to open statuses |
| `backend/src/services/blocked_slot_service.py` | Affected bookings = `OPEN_STATUSES` only |
| `backend/src/api/admin.py` | `/today`: `TodaySession.id`, statuses approved/completed/no_show, `unmarked_count`; new `GET /customers/{id}/attendance`; `UpdateBookingStatusRequest` description; customer list `last_session` counts `completed` |
| `backend/test/test_attendance.py` | 47 tests (in-memory fake collection, dates relative to now) |
| Docs | `backend/docs/data-model.md`, `backend/docs/notifications.md`, `.kiro/steering/backend-architecture.md` |

## API
- `PATCH /api/v1/admin/bookings/{booking_id}` body `{status}` now accepts `completed`, `no_show`.
  400 details: `"Không thể chuyển trạng thái này."` (invalid transition), `"Buổi tập chưa bắt đầu."`
  (attendance before slot start, ICT), `"Khung giờ này đã đầy."`, `"Trạng thái không hợp lệ."`,
  `"Không tìm thấy lịch đặt."`. Same → same returns success (no-op).
- `GET /api/v1/admin/today` → `{date, sessions: [{id, time, hour, customer_id, customer_goal, status}], pending: [...], unmarked_count}`.
- `GET /api/v1/admin/customers/{customer_id}/attendance` → `{customer_id, completed, no_show}` (admin bearer required).
- Member-facing: `GET /api/v1/bookings/availability` `my_status` may be `completed`/`no_show` (slot `available: false`);
  `POST /api/v1/bookings/cancel` on a marked booking → 400 `"Không thể hủy buổi tập đã điểm danh."`.
- `POST /api/v1/admin/bookings/assign` (and batch-assign per slot) onto a marked booking → `"Buổi tập này đã được điểm danh."`.
- `GET /api/v1/admin/bookings` returns bookings with the new statuses as-is.

## Verification
- `pytest test/ -q`: 158 passed, 2 failed (the two known pre-existing hardcoded-date failures).
- `python -c "import src.main"`: ok.

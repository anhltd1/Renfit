# U12 Block Off Slots — Code Generation Plan

**Unit**: U12 Block Off Slots
**FRs**: FR-4 (Block off slots)
**Dependencies**: U11 (admin tab restructure complete)

---

## Step 1: Backend — BlockedSlot schema + collection accessor

- [ ] Create `backend/src/schema/blocked_slot.py` — Pydantic model with fields: id, date, hours (list[int] | str "all"), reason, created_at, created_by
- [ ] Add `BLOCKED_SLOT = "BlockedSlot"` to `backend/src/schema/collections.py`
- [ ] Add `blocked_slots_collection()` to `backend/src/db/mongo.py`

**Files**: 3 files (1 new, 2 modified)

---

## Step 2: Backend — blocked_slot_service.py

- [ ] Create `backend/src/services/blocked_slot_service.py` with functions:
  - `create_blocked_slot(date, hours, reason, trainer_id)` → dict
  - `list_blocked_slots(start_date, end_date)` → list[dict]
  - `delete_blocked_slot(slot_id)` → dict
  - `get_blocked_hours_for_date(date)` → set[int]
  - `is_slot_blocked(date, hour)` → bool
  - `get_affected_bookings(slot_id)` → list[dict]

**Files**: 1 new file

---

## Step 3: Backend — CRUD endpoints in admin.py

- [ ] Add models: `CreateBlockRequest`, `BlockedSlotOut`
- [ ] `POST /api/v1/admin/blocked-slots` — create a block
- [ ] `GET /api/v1/admin/blocked-slots` — list blocks in the booking window
- [ ] `DELETE /api/v1/admin/blocked-slots/{id}` — delete a block
- [ ] `POST /api/v1/admin/blocked-slots/{id}/cancel-bookings` — cancel all affected bookings

**Files**: `backend/src/api/admin.py`

---

## Step 4: Backend — Integrate into availability

- [ ] `booking_service.py` → `build_availability()`: query blocked slots for the date window, mark slots as `blocked: true, block_reason: str`
- [ ] `booking_service.py` → `list_window_bookings()`: include blocked-slot data so admin calendar can render them
- [ ] `services/ai/tools.py` → `get_available_slots`: uses `build_availability()` which now auto-excludes blocked slots (verify no extra work needed)

**Files**: `booking_service.py`, verify `tools.py`

---

## Step 5: Backend — Verify

- [ ] Confirm `import src.main` succeeds
- [ ] Rebuild backend container and test endpoints

**Files**: None

---

## Step 6: Frontend API client

- [ ] Add `BlockedSlot` interface and CRUD functions to `frontend/src/lib/api/admin.ts`:
  - `fetchBlockedSlots()` → `BlockedSlot[]`
  - `createBlockedSlot(date, hours, reason)` → `BlockedSlot`
  - `deleteBlockedSlot(id)` → void
  - `cancelBlockedSlotBookings(id)` → `{ cancelled: number }`

**Files**: `frontend/src/lib/api/admin.ts`

---

## Step 7: Frontend hook — useBlockedSlots

- [ ] Create `frontend/src/app/shared/hooks/useBlockedSlots.ts`
- [ ] CRUD operations + `isBlocked(date, hour)` helper
- [ ] Fetches on mount, refetches after mutations

**Files**: 1 new file

---

## Step 8: Frontend — BlockOffManager component

- [ ] Create `frontend/src/app/components/BlockOffManager.tsx`
- [ ] Modal/Sheet UI: date display, hour selector (checkboxes for individual hours) OR "full day" toggle, reason input, existing-bookings warning with count + assisted cancel, confirm/cancel buttons
- [ ] Triggered from admin calendar (click on a blocked cell or a "Chặn giờ" button)

**Files**: 1 new file

---

## Step 9: Frontend — Admin calendar integration

- [ ] `AdminBookings.tsx`:
  - Fetch blocked slots alongside booking data (via hook or embedded in `list_window_bookings` response)
  - Render blocked cells with diagonal-hatch (same pattern as Sunday "Nghỉ")
  - Add "Chặn giờ" action button in sub-header or context menu
  - Blocked cells not clickable for assign-booking
- [ ] Member `BookingCalendar.tsx`:
  - Check `slot.blocked` flag from availability data
  - Render blocked slots as disabled/unselectable with reason tooltip

**Files**: `AdminBookings.tsx`, `BookingCalendar.tsx`

---

## Step 10: Verify & test

- [ ] `npm run build` — no errors
- [ ] `npm run test` — all pass
- [ ] Clean up `dist/`

**Files**: Test files as needed

---

## Summary

- **Total steps**: 10
- **New files**: 4 (`blocked_slot.py`, `blocked_slot_service.py`, `useBlockedSlots.ts`, `BlockOffManager.tsx`)
- **Modified files**: ~7 (`collections.py`, `mongo.py`, `admin.py`, `admin.ts`, `booking_service.py`, `AdminBookings.tsx`, `BookingCalendar.tsx`)
- **Backend changes**: 1 new collection, 1 new service, 4 new endpoints, availability integration

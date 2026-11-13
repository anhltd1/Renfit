# Services (V2) — Admin UX & Feature Improvements

New and modified backend endpoints and frontend service orchestration.

## New Backend Endpoints

### GET /api/v1/admin/today
- **Purpose**: Lightweight endpoint for the PT's Today landing screen
- **Returns**: `{ sessions: [{time, customer_id, customer_goal, status}], pending: [{id, customer_id, time, note}] }`
- **Logic**: Query today's approved bookings (sorted by time) + all pending bookings across the window

### POST /api/v1/admin/bookings/batch-assign
- **Purpose**: Assign multiple time slots to one member in a single request
- **Request**: `{ customer_id: str, times: str[] }`
- **Returns**: `{ results: [{time, success, message}], summary_notification_sent: bool }`
- **Logic**: Loop `admin_assign_booking` per slot, collect per-slot results; send ONE summary notification to the member; suppress trainer self-notification

### CRUD /api/v1/admin/blocked-slots
- **POST /api/v1/admin/blocked-slots** — Create a blocked slot (body: `{date, hours: int[]|"all", reason}`)
- **GET /api/v1/admin/blocked-slots** — List blocked slots in the booking window
- **DELETE /api/v1/admin/blocked-slots/{id}** — Remove a blocked slot
- **POST /api/v1/admin/blocked-slots/{id}/cancel-bookings** — Cancel all bookings affected by a blocked slot (assisted cancellation)

### POST /api/v1/admin/customers
- **Purpose**: PT creates a new member
- **Request**: `{ name, phone_number, age, goal?, health_note?, address?, height?, weight? }`
- **Returns**: `{ ...CustomerSummary, temporary_password: str }`
- **Logic**: Reuse signup logic internally, generate random 6-char password, return it once

### PATCH /api/v1/admin/customers/{customer_id}
- **Purpose**: PT edits a member's profile (identity fields locked)
- **Request**: `{ age?, goal?, health_note?, address?, height?, weight?, avatar? }`
- **Returns**: Updated `CustomerSummary`

### POST /api/v1/admin/customers/{customer_id}/archive
- **Purpose**: Soft-delete a member (set `active: false`)
- **Returns**: `{ success: true }`

### POST /api/v1/admin/customers/{customer_id}/restore
- **Purpose**: Restore an archived member (set `active: true`)
- **Returns**: `{ success: true }`

### GET /api/v1/admin/customers (modified)
- **Change**: Add `?active=true|false` query param. Defaults to `active=true` (implicit filter).

### POST /api/v1/push/subscribe
- **Purpose**: Register a push subscription for a customer or trainer
- **Request**: `{ endpoint, keys: {p256dh, auth}, customer_id?: str, is_trainer?: bool }`
- **Returns**: `{ success: true }`

### DELETE /api/v1/push/unsubscribe
- **Purpose**: Remove a push subscription
- **Request**: `{ endpoint }`
- **Returns**: `{ success: true }`

## Modified Backend Services

### booking_service.py
- `build_availability()` — exclude blocked slots (query `BlockedSlot` collection for dates in window, mark those slots as `blocked: true, reason: str`)
- `list_window_bookings()` — include blocked-slot data so admin calendar can render them

### services/ai/tools.py
- `get_available_slots` — exclude blocked slots (same integration as `build_availability`)

### notification_service.py
- Replace `notifications_collection().insert_one()` calls with push delivery via `push_service.send_to_customer()`
- Keep the collection insert as a fallback record (push is fire-and-forget; persisted notifications remain queryable)

## New Backend Data Models

### BlockedSlot (collection: `BlockedSlot`)
```
{
  id: str (uuid),
  date: str (ISO date, e.g. "2026-08-05"),
  hours: int[] | "all",  // [8,9,10] or "all" for full-day
  reason: str,
  created_at: str (ISO datetime),
  created_by: str (trainer_id)
}
```

### PushSubscription (collection: `PushSubscription`)
```
{
  id: str (uuid),
  endpoint: str (unique — the push service URL),
  keys: { p256dh: str, auth: str },
  customer_id: str | null,  // null for trainer subscriptions
  is_trainer: bool,
  created_at: str (ISO datetime)
}
```

### Customer (modified)
- Add field: `active: bool = True`

## New Frontend Services / Hooks

### useAdminToday (`shared/hooks/useAdminToday.ts`) — NEW
- Wraps `GET /api/v1/admin/today`
- Returns `{ sessions, pending, loading, error, refetch }`

### useBatchBooking (`shared/hooks/useBatchBooking.ts`) — NEW
- Manages staged slots state, member selection, submit via batch-assign endpoint
- Returns `{ stagedSlots, toggleSlot, member, setMember, submit, reset, submitting }`

### useBlockedSlots (`shared/hooks/useBlockedSlots.ts`) — NEW
- CRUD for blocked slots
- Returns `{ blockedSlots, createBlock, deleteBlock, cancelAffectedBookings, loading }`

### usePushNotifications (`shared/hooks/usePushNotifications.ts`) — NEW
- Request permission, subscribe, unsubscribe
- Manages subscription lifecycle on login/logout

### useAdminMembers (modified from existing `useCustomers` pattern)
- Add `activeFilter` parameter (default true)
- Add sort state (alpha / lastSession / nextSession)
- Add create/edit/archive/restore actions

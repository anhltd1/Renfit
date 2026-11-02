# Notifications — Design & Implementation

Status: **implemented**, matching the design below. Two independent
notification systems share the same architecture: **customer-facing**
(§1–6) and **trainer-facing** (§8).

- Schema: `src/schema/notification.py` (`Notification` + `TrainerNotification`), `src/schema/mongo.py`
- Business logic: `src/services/notification_service.py`
- Time-based reminder scan: `src/services/notification_scheduler.py`
  (started via `asyncio.create_task` in `main.py`'s startup event)
- Event-driven triggers wired into `booking_service.py` (`set_booking_status`,
  `admin_assign_booking`, `create_customer_booking`, `cancel_customer_booking`),
  `api/admin.py::add_inbody`, and `api/auth.py::signup`
- API: `src/api/notifications.py` (`/api/v1/notifications/*`, customer),
  trainer endpoints inline in `src/api/admin.py` (`/api/v1/admin/notifications/*`)
- Frontend: `frontend/src/lib/api/notifications.ts` +
  `NotificationBell.tsx` (customer, dropdown-only); `lib/api/admin.ts`
  (trainer functions) + `TrainerNotificationBell.tsx` (trainer, dropdown
  **and** top-center popup toasts) — wired into `UserDashboardPage`'s and
  `AdminDashboardPage`'s headers respectively
- Tests: `backend/test/test_notifications.py`,
  `backend/test/test_booking_notifications.py`

---

## 1. What triggers a notification (customer-facing)

Three trigger types for the **customer**.

| # | Trigger | Fires when | Source of truth |
|---|---|---|---|
| 1 | **Booking approved** | A trainer changes a booking's status from `pending` → `approved` | `set_booking_status()` in `booking_service.py`; also `admin_assign_booking()` (creates a booking already `approved`) |
| 2 | **Session reminder** | An `approved` booking's start time is **≤ 60 minutes** away (and still in the future) | Time-based — no single write triggers it, see [§3.2](#32-session-reminder-time-based) |
| 3 | **New InBody score** | A trainer adds an InBody record for a customer | `add_inbody()` in `api/admin.py` |

Rules that apply to all three:
- Notifications are **per-customer** — a customer only ever sees their own.
- A booking that is `rejected` never notifies (silence, not a negative ping —
  consistent with the existing "no PT yet" MVP tone; revisit if trainers want
  rejection notices later).
- Cancelling a booking (customer- or trainer-initiated) does **not** generate
  a *customer* notification; it also **retracts** an unfired session reminder
  (see §3.2) so a cancelled slot never reminds. (It does generate a
  *trainer* notification — see §8.)

For **trainer-facing** triggers (new booking, cancelled booking, new trainee
signup), see [§8](#8-trainer-facing-notifications).

---

## 2. Data model

New collection: **`Notification`** (added to `src/schema/collections.py`).

| Field | Type | Notes |
|---|---|---|
| `id` | string | Unique (UUID-style, app-generated) |
| `customer_id` | string | References `Customer.id` — recipient |
| `type` | enum | `booking_approved` \| `session_reminder` \| `inbody_added` |
| `title` | string | Short headline, Vietnamese, e.g. "Lịch tập đã được xác nhận" |
| `message` | string | One-line detail, e.g. "Buổi tập 08:00 Thứ 5, 16/7 đã được HLV xác nhận." |
| `target` | string | Click-through route (see [§4](#4-click-through-routing)) |
| `related_id` | string | `Booking.id` or `Inbody.id` this notification is about |
| `read` | bool | Default `false` |
| `created_at` | datetime | |
| `read_at` | datetime \| null | Set when marked read |

Indexes: unique on `id`; non-unique on `customer_id`; compound non-unique on
`(customer_id, read)` (powers the unread-count query).

**Idempotency key**: `(type, related_id)` should be unique per notification —
never insert a second `booking_approved` for the same `Booking.id`, and never
insert a second `session_reminder` for the same booking (critical for §3.2,
since the reminder check runs repeatedly). Enforce with a compound index or
an existence check before insert.

---

## 3. Generation mechanism

Two different mechanisms, depending on whether the trigger is event-driven or
time-based.

### 3.1 Event-driven (booking approved, InBody added)

Fire synchronously, inline in the existing write path — no new
infrastructure needed:

- `booking_service.set_booking_status()`: after a successful `pending` →
  `approved` transition, insert a `booking_approved` notification for
  `doc["customer_id"]`.
- `booking_service.admin_assign_booking()`: after inserting/updating a
  booking that lands as `approved`, insert a `booking_approved` notification
  the same way (a trainer directly assigning a slot is equivalent to
  approving it).
- `api/admin.py::add_inbody()`: after `inbody_collection().insert_one(...)`,
  insert an `inbody_added` notification for `customer_id`.

Each of these already knows the customer id and the record id at the point
of the write, so this is a single extra `insert_one` call — no coupling to
the AI agent or any other subsystem.

**Attendance changes send nothing (V5 / U22).** Any `set_booking_status()`
transition into, out of, or between `completed` / `no_show` creates no
customer or trainer notification and retracts nothing: `approved →
completed/no_show` leaves the (already fired or irrelevant) session reminder
alone, and the undo `completed/no_show → approved` does **not** send
`booking_approved` (guarded explicitly in code, on top of the `(type,
related_id)` idempotency key). Members see attendance only as a read-only
label on their own bookings. Same-status re-PATCHes are no-ops.

### 3.2 Session reminder (time-based)

There is no single write to hook — "1 hour before start" is a fact about the
clock, not about a mutation. Two viable approaches:

**Recommended: lightweight in-process scheduler.**
Add an `asyncio` background task started from FastAPI's `lifespan` (no new
dependency — `asyncio.create_task` + `asyncio.sleep`, following the same
"MVP, no extra infra" philosophy as the rest of the backend). Every minute:

1. Query `Bookings` where `status == "approved"` and `time` is between
   `now` and `now + 60min`.
2. For each, check whether a `session_reminder` notification already exists
   for that `related_id` (the idempotency key from §2) — skip if so.
3. Otherwise insert one, with `target` pointing at the bookings tab
   (§4) and a message like *"Buổi tập của bạn bắt đầu trong 1 giờ (08:00)."*

This guarantees a reminder fires once, close to the 1-hour mark, without
needing the customer's browser to be open at the exact trigger time — the
next time they open/poll notifications, it's already there.

**Cancellation retraction**: `cancel_customer_booking()` should delete any
`session_reminder` notification whose `related_id` matches the cancelled
booking, so a reminder never lingers for a slot that no longer exists.

**Alternative (not recommended for MVP)**: compute reminders lazily inside
`GET /api/v1/notifications` (check "any approved booking in the next hour
without a reminder yet" on every fetch). Simpler to ship (zero background
task), but reminders only appear when the customer happens to poll — good
enough as a fallback if the scheduler is deferred, but the scheduler is the
correct fix since it fires deterministically regardless of client activity.

---

## 4. Click-through routing

Every notification carries a `target` string the frontend maps to a
navigation action. All targets land inside `UserDashboardPage`, which already
has three tabs (`overview`, `chat`, `bookings` — see `frontend/README.md`).

| `type` | `target` | Frontend behavior |
|---|---|---|
| `booking_approved` | `dashboard:bookings` | Navigate to `/dashboard`, switch to the **Đặt lịch tập** tab, scroll/highlight the approved slot if visible in the current 5-day window |
| `session_reminder` | `dashboard:bookings` | Same as above — surfaces the upcoming session so the customer can see the time/status at a glance |
| `inbody_added` | `dashboard:overview` | Navigate to `/dashboard`, switch to the **Hồ sơ & InBody** tab (the `StackedInbodyChart` is here — the new point should be visibly the latest one) |

`target` is a simple `"page:tab"` string rather than a full URL, since
everything customer-facing lives inside the one dashboard shell — this keeps
the contract stable even if internal routes are refactored later. The
frontend notification click handler parses it and calls the existing
`setTab()` state setter (or navigates to `/dashboard` first if not already
there, then sets the tab).

---

## 5. API (proposed)

New router: `src/api/notifications.py`, prefix `/api/v1/notifications`.

| Method | Path | Description |
|---|---|---|
| GET | `?customer_id=&unread_only=false` | List notifications for a customer, newest first |
| GET | `/unread-count?customer_id=` | Count of unread — powers the bell badge without fetching the full list |
| POST | `/{notification_id}/read` | Mark one notification read (`read=true`, `read_at=now`) |
| POST | `/read-all` | Mark all of a customer's notifications read — body: `{ customer_id }` |

Matches the existing auth pattern in this codebase (MVP, no JWT):
`customer_id` supplied by the client, same as `bookings.py`/`profile.py`.

---

## 6. Frontend (proposed)

- **Bell icon** in `UserDashboardPage`'s header/sidebar (icon already used
  decoratively in `DashboardPage.tsx`; wire it up for real here) with an
  unread-count badge, polling `GET /unread-count` every ~30s while the
  dashboard is mounted — consistent with the "MVP, poll, no websockets"
  approach the rest of the app uses (no live-push infra exists yet).
- **Dropdown panel** listing recent notifications (title + message +
  relative time), unread ones visually distinct (e.g. left accent bar in
  `#0F6B3E`).
- **Click a notification** → `POST /{id}/read` (optimistic UI: mark read
  immediately, decrement badge) → route per §4.
- **"Mark all read"** action in the panel footer.
- New API client: `frontend/src/lib/api/notifications.ts`, following the
  same `fetch` + typed-response pattern as `lib/api/bookings.ts`.

---

## 7. Non-goals / future work

- **Push/real-time delivery** (WebSockets, SSE, browser push) — current
  design is poll-based, matching the rest of the codebase's MVP posture.
  The trainer popup toast (§8.5) narrows this gap somewhat (10s poll feels
  close to live for a single-admin dashboard) but is still polling under the
  hood. Revisit if instant delivery becomes a requirement.
- **Email/SMS channels** — in-app only for now.
- **Configurable reminder lead time** — hardcoded to 60 minutes per the
  current requirement; would need a per-customer preference field if this
  becomes adjustable.
- **Per-trainer read state** — see §8's "broadcast" note; only a single
  shared admin identity is modeled today.

---

## 8. Trainer-facing notifications

Separate collection (`TrainerNotification`) and separate service functions
from the customer-facing ones above, but the same architecture (event-driven
inserts, idempotent per `(type, related_id)`, `target` for click-through).

### 8.1 Triggers

| # | Trigger | Fires when | Source of truth |
|---|---|---|---|
| 1 | **Booking created** | A trainee books (or re-books) a slot | `create_customer_booking()` in `booking_service.py` |
| 2 | **Booking cancelled** | A trainee cancels a booking | `cancel_customer_booking()` in `booking_service.py` |
| 3 | **Trainee registered** | A new customer completes signup | `signup()` in `api/auth.py` |

Trainer-initiated changes (`admin_assign_booking`, `set_booking_status`) do
**not** notify trainers — only trainee-initiated actions do, since the
trigger is meant to surface things trainers didn't already know about.

### 8.2 Broadcast, not per-recipient

Unlike customer notifications, `TrainerNotification` has **no recipient
field**. This gym's admin model is effectively single-tenant — one shared
`admin` login sees every customer and every booking — so every logged-in
trainer sees the same feed, and any trainer marking one read marks it read
for all trainers. If multi-trainer accounts with independent read state are
ever needed, add a `recipient_id` field and scope `list_trainer_notifications`
/ `mark_trainer_notification_read` by it, mirroring the customer-facing shape.

### 8.3 Idempotency caveat: booking_created vs booking_cancelled

A single booking's lifecycle can produce **both** a `booking_created` and a
later `booking_cancelled` notification. Since idempotency is keyed on
`(type, related_id)` and both would naively use the same `booking_id`, the
cancellation notification suffixes its `related_id` as `"{booking_id}:cancelled"`
— distinct from the plain `booking_id` used by the creation notification, so
neither insert collides with the other, while a *second* cancellation of the
same booking still can't double-notify.

### 8.4 Click-through routing

| `type` | `target` | Frontend behavior |
|---|---|---|
| `booking_created` | `admin:bookings` | Switch `AdminDashboardPage` to the **Lịch đặt** view |
| `booking_cancelled` | `admin:bookings` | Same — surfaces the now-open slot |
| `trainee_registered` | `admin:clients` | Switch to the **Hội viên** view (new customer should appear in the sidebar list) |

### 8.5 Popup toast (in addition to the dropdown)

Per the requirement, new trainer notifications must surface as **a transient
popup centered at the top of the screen that disappears on its own**, on top
of (not instead of) the normal dropdown list:

- `TrainerNotificationBell` polls `GET /api/v1/admin/notifications` every
  10s (tighter than the customer bell's 30s, since PTs actively working the
  dashboard benefit from lower latency on "new booking" alerts).
- On each poll, any notification **not seen in a prior poll** (tracked by id
  in a ref, seeded on first load so history doesn't all pop at once) is
  pushed into a `popups` queue and rendered as a fixed
  `top-4 left-1/2 -translate-x-1/2` toast stack.
- Each popup auto-dismisses after 5s (`POPUP_DURATION_MS`), independent of
  the others; clicking one marks it read and routes via `target` (§8.4)
  immediately, same as clicking it in the dropdown would.
- The dropdown itself is unaffected — it always shows the normal persisted
  list on demand, regardless of which items have already appeared as popups.

### 8.6 API

Endpoints live inline in `src/api/admin.py` (reusing the existing
`_require_admin` bearer-token dependency) rather than a separate router,
since they're trainer-only:

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/admin/notifications?unread_only=` | List all trainer notifications, newest first |
| GET | `/api/v1/admin/notifications/unread-count` | Unread count |
| POST | `/api/v1/admin/notifications/{id}/read` | Mark one read |
| POST | `/api/v1/admin/notifications/read-all` | Mark all read |

# Data Model (MongoDB)

Database name: **`renfit`** (configurable via `DB_NAME` in `env/.env`).

All document schemas and collection validators live in `src/schema/`. Initialise or reset with:

```bash
cd backend
python -m src.init_db.reset_database
```

> **Warning:** `reset_database` drops the entire database before recreating it. Use only for first-time setup or a full reset. The default trainer account is re-seeded automatically.

---

## Collections

### `Customer`

Registered gym customers. `id` is the customer's display name (chosen at signup).

| Field | Type | Notes |
|---|---|---|
| `id` | string | Unique, used as the display name |
| `phone_number` | string | Unique login identifier |
| `password` | string | bcrypt hash |
| `goal` | string | Fitness goal (e.g. "Giảm cân") |
| `health_note` | string | Health conditions / injuries |
| `height` | string | cm |
| `weight` | string | kg |
| `address` | string | |
| `age` | int/float | Optional |
| `avatar` | string | Base64-encoded JPEG data URL (compressed client-side) |

Indexes: unique on `id`, unique on `phone_number`.

---

### `Personal_Trainer`

Trainer / admin accounts. Login via `name` (username) + bcrypt `password`. The coach account (internal `id` `admin`) is created and synced on every startup from `ADMIN_USERNAME` / `ADMIN_PASSWORD` in `backend/env/.env` (see `src/init_db/seed.py`); with those unset, no account is created.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Unique; also used as the admin session Bearer token |
| `name` | string | Login username |
| `age` | int/float | |
| `address` | string | |
| `phone_number` | string | Unique |
| `password` | string | bcrypt hash |

---

### `Bookings`

Hourly training-session reservations.

**Rules**
- Bookable window: **Monday of the current week → Saturday of next week** (12 days, no Sundays).
- Hours: **08:00–20:00** in 1-hour slots (start hours 08–19). Gym is **closed Sundays**.
- Capacity: **4 bookings per slot**. `pending`, `approved`, `completed` and `no_show` bookings all consume capacity (`ACTIVE_STATUSES`) — a held session never reopens its slot. `rejected` / cancelled bookings free the slot.
- Statuses: `pending` → `approved` (trainer accepted) or `rejected` (trainer declined); once the session has started, an `approved` booking can be marked `completed` ("Đã tập") or `no_show` ("Vắng").
- Transitions (enforced only in `booking_service.set_booking_status`):

  | From | Allowed to |
  |---|---|
  | `pending` | `approved`, `rejected` |
  | `approved` | `pending`, `rejected`, `completed`\*, `no_show`\* |
  | `rejected` | `pending`, `approved` (capacity-checked) |
  | `completed` / `no_show` | `approved` (correction/undo), the other attendance status\* |

  \* only when slot start ≤ now (Asia/Ho_Chi_Minh), else `"Buổi tập chưa bắt đầu."`. Same → same is a successful no-op. Anything else: `"Không thể chuyển trạng thái này."`. The capacity check runs only when moving from `rejected` into `pending`/`approved`.
- Attendance-marked bookings (`completed`/`no_show`) cannot be cancelled by the member (`"Không thể hủy buổi tập đã điểm danh."`), are not overwritten by admin assign (`"Buổi tập này đã được điểm danh."`), and are skipped by blocked-slot assisted cancellation (which only rejects `pending`/`approved`).
- Attendance summary: `GET /api/v1/admin/customers/{customer_id}/attendance` → `{customer_id, completed, no_show}` (counts over all stored bookings of that customer).
- Existing databases pick up the extended validator enum via an idempotent startup `collMod` (`main.py::_sync_bookings_validator`), no reset needed.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Unique booking id (UUID-style, app-generated) |
| `customer_id` | string | References `Customer.id` |
| `trainer_id` | string | References `Personal_Trainer.id`; default `"admin"` |
| `time` | string/date | Slot datetime, e.g. `2026-06-15T08:00` |
| `status` | enum | `pending` \| `approved` \| `rejected` \| `completed` \| `no_show` |
| `note` | string | Optional session note |

Indexes: unique on `id`; non-unique on `time`; compound non-unique on `(customer_id, time)`.

---

### `Inbody`

Body composition measurements. Trainers enter these from the admin dashboard after each InBody machine scan.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Unique |
| `customer_id` | string | References `Customer.id` |
| `height` | float | cm |
| `weight` | float | kg |
| `SMM` | float | Skeletal muscle mass (kg) |
| `BFM` | float | Body fat mass (kg) |
| `date_recorded` | string/date | Date of measurement (YYYY-MM-DD) |
| `photo_ids` | string[] | Ordered `InbodyPhoto.id` list, first = cover. Optional (absent on older records) |

API responses (`GET/POST /api/v1/admin/customers/{id}/inbody`, `GET /api/v1/profile/inbody`) expose
these as `photos: string[]` URLs (`/api/v1/inbody/photos/{photo_id}`), never as image data.

---

### `InbodyPhoto`

Progress photos taken on an InBody measurement day, uploaded by the trainer together with the scores
(`POST /api/v1/admin/customers/{id}/inbody`, field `photos`: base64 data-URLs, max 6, ≤ 2 MB each
decoded, JPEG/PNG/WebP; the client compresses to ≤ 1280 px JPEG first). One document per photo so
listing records stays light.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Unique (uuid4); also the URL key |
| `inbody_id` | string | References `Inbody.id` |
| `customer_id` | string | References `Customer.id` |
| `content_type` | string | `image/jpeg` \| `image/png` \| `image/webp` |
| `data` | binData | Raw image bytes |
| `created_at` | date | |

Indexes: `id` unique, `inbody_id`. Ensured on every startup (`main.py`), not only on reset.

Served by `GET /api/v1/inbody/photos/{photo_id}` with `Cache-Control: private, max-age=31536000,
immutable`. **MVP posture:** like the customer InBody endpoint, this has no auth — access relies on
the uuid4 id only being returned to the record's owner and to trainers. Revisit together with the
rest of the auth model.

---

### `ChatSession`

One AI conversation thread per customer or trainer session.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Unique session id |
| `participant_type` | enum | `customer` \| `trainer` |
| `participant_id` | string | References `Customer.id` or `Personal_Trainer.id` |
| `agent_type` | enum | `customer_coach` \| `trainer_coach` |
| `title` | string | Optional display title |
| `status` | enum | `active` \| `archived` |
| `created_at` | string/date | |
| `updated_at` | string/date | |

---

### `ChatMessage`

Individual message turn within a `ChatSession`.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Unique |
| `session_id` | string | References `ChatSession.id` |
| `role` | enum | `user` \| `assistant` \| `system` |
| `content` | string/object | Plain text or OpenAI message blocks |
| `sequence` | int | 0-based monotonic order within session |
| `created_at` | string/date | |

---

### `Notification` (planned — not yet implemented)

Per-customer alerts for booking approvals, upcoming-session reminders, and
new InBody scores. Full design, generation mechanism, and click-through
routing: [notifications.md](notifications.md).

| Field | Type | Notes |
|---|---|---|
| `id` | string | Unique |
| `customer_id` | string | References `Customer.id` — recipient |
| `type` | enum | `booking_approved` \| `session_reminder` \| `inbody_added` |
| `title` | string | Short headline |
| `message` | string | One-line detail |
| `target` | string | Click-through target, e.g. `dashboard:bookings` |
| `related_id` | string | `Booking.id` or `Inbody.id` this notification is about |
| `read` | bool | Default `false` |
| `created_at` | string/date | |
| `read_at` | string/date \| null | |

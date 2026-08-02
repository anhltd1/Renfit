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

Trainer / admin accounts. Login via `name` (username) + bcrypt `password`. A default account (`admin` / `123`) is seeded on startup.

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
- Capacity: **4 bookings per slot**. `pending` and `approved` bookings both consume capacity. `rejected` / cancelled bookings free the slot.
- Statuses: `pending` → `approved` (trainer accepted) or `rejected` (trainer declined).

| Field | Type | Notes |
|---|---|---|
| `id` | string | Unique booking id (UUID-style, app-generated) |
| `customer_id` | string | References `Customer.id` |
| `trainer_id` | string | References `Personal_Trainer.id`; default `"admin"` |
| `time` | string/date | Slot datetime, e.g. `2026-06-15T08:00` |
| `status` | enum | `pending` \| `approved` \| `rejected` |
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
| `content` | string/object | Plain text or Anthropic message blocks |
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

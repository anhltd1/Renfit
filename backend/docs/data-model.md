# Data model (MongoDB)

Database name: `renfit` (configured via `DB_NAME` in `env/.env`).

All document schemas live in `src/schema/`. Initialize or reset the database with:

```bash
cd backend
python -m src.init_db.reset_database
```

> **Warning:** `reset_database` drops the entire database before recreating it. Use only for first-time setup or a clean reset.

---

## Collections

### `Customer`

Gym customers. `id` is the application-assigned identifier (typically the customer's full name until auth is added).

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Unique, case-insensitive lookup key |
| `phone_number` | string | Unique |
| `goal` | string | Fitness goal |
| `health_note` | string | Health conditions / notes |
| `height` | string | cm |
| `weight` | string | kg |
| `address` | string | |
| `password` | string | bcrypt hash (empty until auth is implemented) |
| `age` | int/float | Optional |

---

### `Personal_Trainer`

Gym trainers.

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Unique |
| `name` | string | |
| `age` | int/float | |
| `address` | string | |
| `phone_number` | string | Unique |
| `password` | string | bcrypt hash |

---

### `Bookings`

Training session bookings. Unique compound index on `(customer_id, trainer_id)`.

| Field | Type | Notes |
|-------|------|-------|
| `customer_id` | string | References `Customer.id` |
| `trainer_id` | string | References `Personal_Trainer.id`; default `"Chưa chỉ định"` |
| `time` | string/date | ISO-like date + time string |
| `status` | enum | `pending` \| `approved` \| `rejected` |
| `note` | string | Optional session note |

---

### `Inbody`

Body composition measurement records (from InBody machines or manual input).

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Unique |
| `customer_id` | string | References `Customer.id` |
| `height` | float | cm |
| `weight` | float | kg |
| `date_recorded` | string/date | |
| `SMM` | float | Skeletal muscle mass (kg) |
| `BFM` | float | Body fat mass (kg) |

---

### `ChatSession`

One AI conversation thread (customer coach or trainer assistant).

| Field | Type | Notes |
|-------|------|-------|
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
|-------|------|-------|
| `id` | string | Unique message id |
| `session_id` | string | References `ChatSession.id` |
| `role` | enum | `user` \| `assistant` \| `system` |
| `content` | string/object | Plain text or structured Anthropic message blocks |
| `sequence` | int | 0-based monotonic order within session |
| `created_at` | string/date | |

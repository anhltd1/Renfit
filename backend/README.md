# Renfit Backend

FastAPI REST API serving the Renfit gym management platform.

## Setup

```bash
cp env/.env.example env/.env        # fill in ANTHROPIC_API_KEY and MONGODB_URI
python -m venv .venv
.venv\Scripts\activate               # Windows  |  source .venv/bin/activate on macOS/Linux
pip install -r requirements.txt
python -m src.init_db.reset_database # first-time DB initialisation (drops + recreates)
uvicorn src.main:app --reload        # http://localhost:8000
```

Interactive API docs: http://localhost:8000/docs

---

## Project Layout

```
backend/
├── src/
│   ├── api/
│   │   ├── admin.py        # Trainer dashboard endpoints (auth, clients, bookings)
│   │   ├── auth.py         # Customer signup / login
│   │   ├── bookings.py     # Customer booking endpoints
│   │   └── profile.py      # Customer profile update + InBody read
│   ├── config/
│   │   └── settings.py     # pydantic-settings — reads env/.env
│   ├── db/
│   │   └── mongo.py        # Collection accessor helpers
│   ├── init_db/
│   │   ├── database.py     # Schema validators + index creation
│   │   ├── reset_database.py  # Drop → recreate → seed
│   │   └── seed.py         # Default trainer account seeding
│   ├── schema/             # Pydantic models (MongoDB docs + API shapes)
│   └── services/
│       ├── ai/             # Claude agent, tools, prompts
│       ├── booking_service.py
│       └── customer_service.py
├── test/                   # Pytest unit tests
├── docs/                   # Documentation
└── env/                    # .env files (gitignored — see env/.env.example)
```

---

## API Reference

### Auth — `/api/v1/auth`

| Method | Path | Description |
|---|---|---|
| POST | `/signup` | Create customer account |
| POST | `/login` | Customer login (returns profile JSON) |

### Profile — `/api/v1/profile`

| Method | Path | Description |
|---|---|---|
| PUT | `` | Update profile fields or change password |
| GET | `/inbody?customer_id=` | Customer's own InBody records (read-only) |

### Bookings — `/api/v1/bookings`

| Method | Path | Description |
|---|---|---|
| GET | `/availability?customer_id=` | Two-week slot grid with availability |
| POST | `` | Create a booking (`pending`) |
| POST | `/cancel` | Cancel / delete a booking |

### Admin (Trainer) — `/api/v1/admin`

| Method | Path | Description |
|---|---|---|
| POST | `/login` | Trainer login (returns `{ token, name }`) |
| GET | `/customers` | List all customers |
| GET | `/customers/{id}/inbody` | Customer's InBody records |
| POST | `/customers/{id}/inbody` | Add InBody measurement |
| GET | `/bookings` | Full two-week booking grid (all customers) |
| PATCH | `/bookings/{booking_id}` | Update booking status |

All `/admin` endpoints (except `/login`) require `Authorization: Bearer <token>` where the token is the trainer's `id` returned at login.

### Notifications (customer) — `/api/v1/notifications`

| Method | Path | Description |
|---|---|---|
| GET | `?customer_id=&unread_only=` | List a customer's notifications, newest first |
| GET | `/unread-count?customer_id=` | Unread count (powers the bell badge) |
| POST | `/{notification_id}/read?customer_id=` | Mark one notification read |
| POST | `/read-all` | Mark all of a customer's notifications read |

Fires on booking approval, ≤1-hour session reminders (background scan every
60s, started in `main.py`'s startup event), and new InBody records.

### Notifications (trainer) — `/api/v1/admin/notifications`

Inline in the admin router (same `Authorization: Bearer <token>` as other
`/admin` endpoints). Broadcast, not per-trainer — see design doc.

| Method | Path | Description |
|---|---|---|
| GET | `?unread_only=` | List all trainer notifications, newest first |
| GET | `/unread-count` | Unread count |
| POST | `/{notification_id}/read` | Mark one notification read |
| POST | `/read-all` | Mark all read |

Fires when a trainee creates or cancels a booking, and when a new trainee
signs up. Full design for both: [`docs/notifications.md`](docs/notifications.md).

### AI Chat — `/api/v1/chat`

| Method | Path | Description |
|---|---|---|
| POST | `` | Send a message as a logged-in customer; returns assistant reply + optional artifact |

Login-only — `customer_id` (the caller's own `Customer.id`) is required in the
request body and scopes every AI tool server-side. The agent has read-only
access to the caller's own profile and InBody history (no tool to edit them —
that happens on the Profile page) plus booking availability/create/cancel for
that same customer. Instead of inline forms, tool results are returned as a
structured, read-only `artifact` (`profile`, `inbody_progress`,
`booking_availability`, `booking_confirmation`, or `booking_cancelled`) that
the frontend renders as a card under the reply.

---

## Booking Rules

- **Window:** Monday of the current week → Saturday of next week (12 days).
- **Hours:** 08:00–20:00, 1-hour slots (start hours 08, 09, …, 19). **Closed Sundays.**
- **Capacity:** maximum **4** bookings per slot (counting `pending` + `approved`).
- **Statuses:** `pending` → `approved` (accepted) or `rejected`. Rejected/cancelled bookings free the slot.

---

## Default Accounts

On first start (or after a DB reset) a trainer account is seeded:

| Field | Value |
|---|---|
| Username (`name`) | `admin` |
| Password | `123` |

Change this directly in MongoDB before going to production.

---

## Running Tests

```powershell
.\test\run_tests.ps1
```

See [`test/README.md`](test/README.md) for details.

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

### AI Chat — `/api/v1/chat`

| Method | Path | Description |
|---|---|---|
| POST | `` | Send a message; returns assistant reply |

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

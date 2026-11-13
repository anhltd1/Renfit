---
paths:
  - "backend/**/*.py"
---

# Backend Architecture & Conventions

Layered architecture: **API routers → services → MongoDB**. The AI Coach is a parallel branch
(`services/ai/`) that also calls into `services/booking_service.py` for booking tools.

## Layout
- `src/main.py` — FastAPI app, CORS, router registration, startup hooks (idempotent, best-effort:
  stale-index drop, optional `RESET_DB` database wipe, admin seed, notification-reminder scheduler
  `asyncio.create_task`).
- `src/api/*` — routers: `auth.py`, `profile.py`, `bookings.py`, `admin.py`, `chat.py`,
  `notifications.py`, `push.py`. Admin endpoints use a `_require_admin` bearer-token dependency;
  customer endpoints use `require_customer` (`src/api/deps.py`) — identity comes from the session
  token, never from a client-supplied `customer_id` (see `services/session_service.py`).
- `src/services/*` — `booking_service.py`, `customer_service.py`, `notification_service.py`,
  `notification_scheduler.py`, `blocked_slot_service.py`, `push_service.py`.
- `src/services/ai/*` — `agent.py` (conversation loop), `tools.py` (profile/InBody/booking tools),
  `prompts.py` (system prompt + date-grounding lookup table), `memory.py`, `suggestions.py`.
- `src/schema/*` — Pydantic/document models + `collections.py` (collection name constants).
- `src/db/mongo.py` — PyMongo client + typed collection accessors.
- `src/config/settings.py` — `pydantic-settings`, loads `backend/env/.env`.
- `src/init_db/*` — `seed.py`, `reset_database.py` (drops + recreates the whole DB — first-time
  setup only), `database.py`.

## Data model (MongoDB, db `renfit`)
MongoDB runs as a local Docker container (`mongo:7`), data persisted in the `mongo_data` named
volume. Two compose files control startup behavior:
- `docker-compose.yml` — normal operation, data preserved across restarts.
- `docker-compose.reset.yml` — sets `RESET_DB=true`, causing the backend startup hook to drop +
  recreate all collections, indexes, and seed the admin trainer (clean slate).

Full reference: `backend/docs/data-model.md`. Collections: `Customer`, `Personal_Trainer`,
`Bookings`, `Inbody`, `ChatSession`, `ChatMessage`, `Notification`, `TrainerNotification`,
`TrainerNote`, `BlockedSlot`, `PushSubscription`.

Key rules to respect when touching bookings:
- Bookable window: Monday of current week → Saturday of next week (12 days), **no Sundays**.
- Hours 08:00–20:00, 1-hour slots, **capacity 4 per slot** (pending, approved, completed and
  no_show all count — a held session never reopens its slot).
- Statuses: `pending` → `approved` | `rejected`; started `approved` sessions → `completed` |
  `no_show` (attendance, undo back to `approved`). Transition rules live only in
  `booking_service.set_booking_status` (see `backend/docs/data-model.md`).

## Notification system
Two independent systems sharing one architecture (event-driven insert + idempotency key
`(type, related_id)`, plus one time-based scheduler). Full design: `backend/docs/notifications.md`.
- **Customer-facing** (`Notification`): `booking_approved`, `session_reminder` (fires via the
  `asyncio` scheduler when an approved booking is ≤60min out), `inbody_added`. Poll-based
  (~30s), click-through via a `"page:tab"` `target` string.
- **Trainer-facing** (`TrainerNotification`): `booking_created`, `booking_cancelled`,
  `trainee_registered`. **Broadcast, not per-recipient** (single shared admin identity — no
  `recipient_id` field). Polled every ~10s; also surfaces as an auto-dismissing top-center popup
  toast in addition to the normal dropdown.
- When adding a new trigger, follow the existing pattern: insert inline in the write path that
  causes it, check the idempotency key first, never introduce a new transport (no WebSockets/SSE —
  this codebase is deliberately poll-based, see notifications.md §7 non-goals).

## AI Coach conventions
(Originally from the old `api-guidelines.md` rules file, folded in here.)
- **Login-only** — no anonymous chat. `customer_id` is always the logged-in customer (from the session token), used
  server-side to scope every tool call.
- Tone: professional, supportive Vietnamese ("bạn"), ≤3 short paragraphs per turn, never hype.
- **Artifacts, not inline forms.** A structured, read-only `ChatArtifact` (`profile`,
  `inbody_progress`, `booking_availability`, `booking_confirmation`, `booking_cancelled`) renders
  under the assistant's text. The agent has no tool to *write* profile fields — profile edits only
  happen on the Profile page.
- **Booking availability is scoped**, not a full 2-week dump: the requested day if named, else
  today + tomorrow only; past slots excluded server-side.
- **Date-grounding is a literal lookup table**, not model arithmetic — `build_system_prompt()` in
  `prompts.py` prepends the real current date/weekday (Ho Chi Minh City time) plus a table mapping
  every bookable weekday phrase to its exact `YYYY-MM-DD`. Any date-relative prompt change must go
  through this table — LLMs are unreliable at weekday arithmetic (this caused two prior bugs).
  See `prompts.py::_build_date_lookup_table`.
- **Training-plan consultation ≠ booking intent.** "Tư vấn lịch tập" means the member wants
  workout/nutrition guidance — answer with an actual plan using `get_my_profile`/
  `get_my_inbody_history`, don't interrogate with numbered questions, and don't pivot to booking
  tools unless the member explicitly asks to book.
- `ChatResponse.suggestions` is always exactly 3 deterministic (non-LLM) pill-chip strings — see
  `services/ai/suggestions.py`. First turn: 3 fixed onboarding prompts. Later turns: 2 contextual
  follow-ups (keyed off the last tool called) + 1 fixed anchor.
- Safety: never diagnose; flag pain/injury; suggest a doctor for serious issues; start light.

## Testing
- `backend/test/` via `pytest` (see `pytest.ini`, `conftest.py`). Existing suites:
  `test_tools.py`, `test_suggestions.py`, `test_notifications.py`, `test_agent_artifacts.py`,
  `test_booking_notifications.py`.
- Run from `backend/`: `.venv/bin/python -m pytest test/` (venv setup: `python3 -m venv .venv && .venv/bin/pip install -r requirements.txt -c constraints.txt`).
- Confirm `import src.main` succeeds after any change touching startup/config.

## When adding a backend feature
1. Add/extend the schema in `src/schema/` (+ `collections.py` if a new collection).
2. Add service logic in `src/services/`; keep routers thin (validate → delegate → shape response).
3. If it changes notifications, data model, or the AI Coach contract, update
   `backend/docs/notifications.md` / `data-model.md` — this project keeps those docs current after
   feature work (see prior work history).
4. Add/extend pytest coverage in `backend/test/`.

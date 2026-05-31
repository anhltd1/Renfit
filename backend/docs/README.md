# Renfit Backend

Python API for Renfit: **AI Fitness Coach** (Claude Haiku) and **MVP data** via two Google Spreadsheet files (Customers, Bookings).

## Folder layout

```
backend/
├── env/                 # API keys and configuration (.env — not committed)
├── docs/
│   ├── README.md        # This file
│   └── data-model.md    # Customers & Bookings sheet schemas
└── src/
    ├── main.py          # FastAPI entry
    ├── config/          # Settings from env/
    ├── models/          # Customer, Booking Pydantic models
    ├── api/             # HTTP routes (planned)
    └── services/        # Anthropic, Google Sheets (planned)
```

## Tech stack (MVP)

| Layer | Choice |
|-------|--------|
| Runtime | Python 3.11+ |
| HTTP | FastAPI + Uvicorn |
| LLM | Anthropic — **Claude Haiku** |
| Data | **Google Sheets** — 2 spreadsheet files (no DB) |
| Config | `backend/env/.env` via pydantic-settings |

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## Data model (Google Sheets)

| Sheet file | Object | Doc |
|------------|--------|-----|
| `GOOGLE_CUSTOMERS_SHEET_URL` | Customers | [data-model.md](data-model.md#sheet-1-customers) |
| `GOOGLE_BOOKINGS_SHEET_URL` | Bookings | [data-model.md](data-model.md#sheet-2-bookings) |

**Workflow:** create customer → booking request → new Bookings row (`pending`) → trainer updates status.

Env setup: [env/README.md](../env/README.md).

## APIs

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/health` | Liveness (+ sheets configured flag) |
| `POST` | `/chat` or `/api/v1/chat` | AI Coach chat with tools |
| `GET/POST` | `/api/v1/customers` | *(planned)* List / create customers |
| `GET/POST/PATCH` | `/api/v1/bookings` | *(planned)* List / update bookings |

### POST `/chat`

**Request**

```json
{
  "message": "Đặt lịch tập ngày mai 19h với PT Huy",
  "conversation_id": "optional-uuid",
  "form_data": {}
}
```

**Response types:** `text` | `form_request` | `customer_saved` | `booking_success`

**Tools (agent):** `upsert_customer_info`, `upsert_booking` — create or update by name (no duplicate rows). Legacy names `save_customer_info`, `update_customer_info`, `create_booking` still work as aliases.

## AI Coach

See `frontend/rules/DESIGN.md` (`ai_ux`, `ai_safety_rules`) and `.cursor/rules/api-guidelines.md`.

- Vietnamese, professional tone, ≤3 paragraphs, optional action cards
- No medical diagnosis; safety warnings for injury/serious health topics

## Configuration

All secrets: **`../env/.env`**

Required for full MVP:

- `ANTHROPIC_API_KEY`
- `GOOGLE_API_KEY`
- `GOOGLE_CUSTOMERS_SHEET_URL`
- `GOOGLE_BOOKINGS_SHEET_URL`

## Local development

```bash
cd backend
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

Frontend: `VITE_API_URL=http://localhost:8000`

## Status

| Phase | Status |
|-------|--------|
| Folder structure + env + data models | Done |
| Google Sheets read/write service | Not started |
| AI chat agent + tools | Done |
| REST customers/bookings CRUD | Not started |
| Frontend wiring | Not started |

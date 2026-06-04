# Backend documentation

| File | Contents |
|------|----------|
| [data-model.md](data-model.md) | MongoDB collections, fields, and indexes |

---

## Project layout

```
backend/
├── src/
│   ├── api/            # FastAPI routes
│   ├── config/         # Settings (pydantic-settings, reads env/.env)
│   ├── db/             # MongoDB collection helpers
│   ├── init_db/        # Database setup / reset script
│   ├── schema/         # Pydantic models (MongoDB documents + API models)
│   └── services/
│       ├── ai/         # Anthropic agent, tools, prompts, memory
│       ├── booking_service.py
│       └── customer_service.py
├── test/               # Pytest unit tests (mocked MongoDB)
└── env/                # .env config (gitignored)
```

## Quick start

```bash
cp env/.env.example env/.env   # fill in ANTHROPIC_API_KEY and MONGODB_URI
pip install -r requirements.txt
python -m src.init_db.reset_database   # first-time DB setup
uvicorn src.main:app --reload
```

## Running tests

```powershell
.\test\run_tests.ps1
```

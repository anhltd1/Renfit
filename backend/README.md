# Renfit Backend

FastAPI API: **AI Fitness Coach** (Claude Haiku) and **MongoDB** data store.

## Setup

1. `cp env/.env.example env/.env` — set `ANTHROPIC_API_KEY`, `MONGODB_URI`
2. `python -m venv .venv` and activate
3. `pip install -r requirements.txt`
4. `python -m src.init_db.reset_database` — initialize MongoDB (first time / reset)
5. `uvicorn src.main:app --reload`

## Layout

- `src/schema/` — MongoDB document models and collection validators
- `src/init_db/` — database reset script
- `src/services/` — AI agent, customer/booking services
- `src/api/` — HTTP routes
- `env/` — `.env` configuration

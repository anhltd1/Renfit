# Renfit — Private Gym Management Platform

A full-stack web app for a private gym. Customers book sessions, track body composition and chat with an AI coach. Personal trainers manage bookings and InBody data from a dedicated dashboard.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| Backend | Python 3.11 + FastAPI |
| Database | MongoDB (remote, e.g. MongoDB Atlas) |
| AI Coach | Anthropic Claude (Haiku) via tool-use agents |
| Auth | bcrypt password hashing (passlib) |
| Infra | Docker + Docker Compose |

---

## Quick Start (Docker — recommended)

### 1. Configure environment

```bash
cp backend/env/.env.example backend/env/.env
```

Edit `backend/env/.env` and fill in:

```
ANTHROPIC_API_KEY=sk-ant-...
MONGODB_URI=mongodb+srv://...
```

### 2. Run

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API health | http://localhost:8000/api/v1/health |

The first run seeds a default trainer account automatically (see [Default accounts](#default-accounts)).

> The frontend Vite dev server proxies `/api/*` and `/chat` to the backend, so no CORS configuration is needed in the browser.

---

## Manual Development Setup

### Backend

```bash
cd backend
cp env/.env.example env/.env        # fill in keys
python -m venv .venv
.venv\Scripts\activate               # Windows
# source .venv/bin/activate          # macOS/Linux
pip install -r requirements.txt
python -m src.init_db.reset_database # first-time DB init
uvicorn src.main:app --reload        # http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                          # http://localhost:5173
```

---

## Application Routes

### Customer-facing

| Route | Description |
|---|---|
| `/` | Landing page |
| `/login` | Customer login |
| `/signup` | New account registration |
| `/dashboard` | Unified user dashboard (profile, InBody charts, AI coach, bookings) |
| `/ai-coach` | Standalone AI coach chat |
| `/booking` | Standalone booking calendar |

### Trainer / Admin (hidden)

| Route | Description |
|---|---|
| `/admin` | Trainer login |
| `/admin/dashboard` | Dashboard — client list, InBody tracking, booking calendar |

---

## Default Accounts

A trainer account is seeded on first startup (idempotent):

| Field | Value |
|---|---|
| Username (name) | `admin` |
| Password | `123` |

> **Change this before going to production.** The trainer account can be updated directly in MongoDB.

---

## Key Features

- **Customer auth** — signup with personal info (name, phone, age, goal, health notes, height/weight); bcrypt password; avatar upload.
- **User dashboard** — single-page shell with sidebar navigation: profile editing, read-only InBody history charts, AI coach chat tab, booking calendar tab.
- **AI Coach** — Claude Haiku agent with tool use (look up customer profile, create/cancel bookings). Chat state persists within a browser session.
- **Bookings** — 5-day sliding calendar (Mon–Sat, 08:00–20:00, 1-hour slots, max 4 customers/slot). Two-week bookable window. Statuses: `pending` → `approved` / `rejected`.
- **InBody tracking** — trainers log height, weight, SMM, BFM per session. Customers see read-only stacked line charts on their dashboard.
- **Trainer dashboard** — client list with InBody charts + add-measurement form; booking calendar with status management (approve / reject / reset).

---

## Repository Layout

```
Renfit/
├── backend/                  # FastAPI application
│   ├── src/
│   │   ├── api/              # HTTP route handlers
│   │   ├── config/           # pydantic-settings (reads env/.env)
│   │   ├── db/               # MongoDB collection accessors
│   │   ├── init_db/          # DB init, reset, and seed scripts
│   │   ├── schema/           # Pydantic models + MongoDB validators
│   │   └── services/
│   │       ├── ai/           # Claude agent, tools, prompts
│   │       ├── booking_service.py
│   │       └── customer_service.py
│   ├── env/                  # .env config (gitignored)
│   ├── test/                 # Pytest unit tests
│   └── docs/                 # Backend documentation
├── frontend/                 # React + Vite SPA
│   └── src/
│       ├── app/
│       │   ├── components/   # Shared UI components
│       │   └── pages/        # Route-level page components
│       └── lib/
│           ├── api/          # Typed fetch wrappers
│           └── auth.ts       # localStorage session helpers
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
└── DOCKER.md                 # Docker-specific commands
```

---

## Further Reading

- [`DOCKER.md`](DOCKER.md) — Docker commands and tips
- [`backend/README.md`](backend/README.md) — Backend API reference
- [`backend/docs/data-model.md`](backend/docs/data-model.md) — MongoDB collections
- [`frontend/README.md`](frontend/README.md) — Frontend pages and components

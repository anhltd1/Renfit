# Technology Stack

## Programming Languages
- **Python** — 3.10+ (backend; uses `list[str]` builtins generics, `X | Y` unions).
- **TypeScript / TSX** — frontend SPA.

## Frameworks & Key Libraries

### Backend (`backend/requirements.txt`)
- **FastAPI** (>=0.115.0) — web framework.
- **Uvicorn[standard]** (>=0.32.0) — ASGI server.
- **Pydantic** (>=2.0) + **pydantic-settings** (>=2.0) — models + config.
- **PyMongo** (>=4.10) — MongoDB driver.
- **anthropic** (>=0.39.0) — Claude API SDK (model `claude-3-5-haiku-20241022`).
- **passlib[bcrypt]** (>=1.7.4) + **bcrypt** (>=3.2,<4.0) — password hashing.
- **python-dotenv** (>=1.0) — env loading.

### Frontend (`frontend/package.json`)
- **React** 18.3.1 + **react-dom** 18.3.1.
- **Vite** 6.3.5 — build/dev server.
- **Tailwind CSS** 4.1.12 (via `@tailwindcss/vite`).
- **react-router** 7.13.0 — routing.
- **Radix UI** primitives + **MUI** 7 + **lucide-react** — UI/icons.
- **recharts** ^2.15 — InBody charts.
- **react-markdown** ^10 — chat message rendering.
- **react-hook-form**, **motion**, **sonner**, **date-fns**, and other UI utilities.

## Data Store
- **MongoDB** — database `renfit`; collections: Customer, Personal_Trainer, Bookings, Inbody,
  ChatSession, ChatMessage, Notification, TrainerNotification.

## Infrastructure
- **Docker** + **Docker Compose** — backend (:8000) and frontend (:5173) services.
- Backend health check on `/api/v1/health`; frontend proxies `/api` and `/chat` to backend.

## Build Tools
- **pip** (+ local pypoetry venv) — backend deps.
- **npm** + **Vite** — frontend build (`vite build`) and dev (`vite`).

## Testing Tools
- **pytest** (>=8.0) — backend tests (`backend/test`, `backend/pytest.ini`).
- Frontend: no test runner; `npm run build` used as the verification gate.

## External Services
- **Anthropic Claude** — AI Coach (Messages API + tool use).

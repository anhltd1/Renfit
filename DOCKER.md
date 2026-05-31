# Docker — Renfit

Run frontend + backend together with Docker Compose.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose)
- `backend/env/.env` filled in (Anthropic key, Google Sheets URLs)
- `backend/env/service-account.json` (Google service account key)

## Quick start

From project root:

```bash
docker compose up --build
```

First run downloads base images and installs npm/pip dependencies (may take several minutes).

## Endpoints (host machine)

| Service   | URL |
|-----------|-----|
| Frontend  | http://localhost:5173 |
| Backend   | http://localhost:8000 |
| Health    | http://localhost:8000/api/v1/health |
| Chat API  | http://localhost:8000/chat |
| Chat API  | http://localhost:8000/api/v1/chat |

From the browser, the frontend dev server proxies:

- `/api/*` → backend
- `/chat` → backend

So the app can call `fetch('/chat', ...)` without CORS issues.

## Commands

```bash
# Build and start (foreground)
docker compose up --build

# Detached
docker compose up --build -d

# Stop
docker compose down

# Rebuild one service
docker compose build backend
docker compose up backend
```

## Layout

```
Renfit/
├── docker-compose.yml
├── Dockerfile.backend    # build context: repo root
├── Dockerfile.frontend
├── backend/Dockerfile      # alternate (same image, backend/ context)
└── frontend/Dockerfile
```

# Docker — Renfit

Run the full stack (frontend + backend) with Docker Compose.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose plugin)
- `backend/env/.env` filled in — at minimum `ANTHROPIC_API_KEY` and `MONGODB_URI`

## Quick Start

```bash
# From the repository root:
docker compose up --build
```

First run pulls base images and installs dependencies — allow a few minutes.

## Service URLs

| Service | URL |
|---|---|
| Frontend (Vite) | http://localhost:5173 |
| Backend (FastAPI) | http://localhost:8000 |
| Health check | http://localhost:8000/api/v1/health |
| Interactive API docs | http://localhost:8000/docs |

The Vite dev server proxies `/api/*` and `/chat` to the backend container, so the browser only talks to port 5173.

## Common Commands

```bash
# Start in foreground (rebuild images)
docker compose up --build

# Start detached (background)
docker compose up --build -d

# View logs
docker compose logs -f
docker compose logs -f backend

# Stop and remove containers
docker compose down

# Rebuild a single service
docker compose build backend
docker compose up backend --no-deps

# Shell into a running container
docker compose exec backend bash
docker compose exec frontend sh
```

## Resetting the Database

```bash
# Run the reset script inside the backend container:
docker compose exec backend python -m src.init_db.reset_database
```

> **Warning:** This drops and recreates the entire `renfit` database. All data is lost. The default trainer account is re-seeded automatically.

## File Layout

```
Renfit/
├── docker-compose.yml       # Orchestration (backend + frontend)
├── Dockerfile.backend       # Backend image (build context: repo root)
├── Dockerfile.frontend      # Frontend image (build context: repo root)
├── backend/.dockerignore
└── frontend/.dockerignore
```

## Environment Variables (Docker-specific)

These are set directly in `docker-compose.yml` and override `env/.env`:

| Variable | Value in Compose | Purpose |
|---|---|---|
| `API_HOST` | `0.0.0.0` | Bind on all interfaces inside container |
| `API_PORT` | `8000` | FastAPI port |
| `CORS_ORIGINS` | `http://localhost:5173,...` | Allow browser and frontend container |
| `VITE_BACKEND_URL` | `http://backend:8000` | Internal service-to-service URL |
| `VITE_API_URL` | `http://localhost:8000` | Public URL used by the browser |

# Docker — Renfit

Run the full stack (frontend + backend + MongoDB) with Docker Compose. The frontend image builds a
production Vite bundle and serves it with [Caddy](https://caddyserver.com/), which also
reverse-proxies API calls to the backend and automatically provisions TLS via Let's Encrypt when a
real domain is configured (see [Production Deployment](#production-deployment-single-vm) below).

MongoDB runs as a local container (`mongo:7`) with data persisted in a named Docker volume
(`mongo_data`). No external database service required.

## Local Development (Docker)

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose plugin)
- `backend/env/.env` filled in — at minimum `OPENAI_API_KEY` (MongoDB is self-hosted, no URI needed)

### Quick Start

```bash
# From the repository root — first time (clean DB):
docker compose -f docker-compose.reset.yml up --build -d

# Subsequent runs (preserves data):
docker compose up --build -d
```

First run pulls base images, installs dependencies, and builds the frontend bundle — allow a few
minutes. With no root `.env` file present, `DOMAIN` defaults to `:80` and Caddy serves plain HTTP
with no certificate management — fine for local testing.

> **Don't set `DOMAIN=localhost`** for local testing. Caddy treats any hostname (including
> `localhost`) as a real domain that needs an HTTPS certificate, and its internal-CA fallback
> needs a `certutil` tool that isn't installed in this image — the container will fail to start
> and the frontend will be unreachable. Use a port-only value like `:80` instead, or leave `DOMAIN`
> unset to get the default.

### Service URLs (local, no domain configured)

| Service | URL |
|---|---|
| Frontend (Caddy, serving the built SPA) | http://localhost |
| Backend (FastAPI) | Not exposed to the host by default — see `docker-compose.yml`'s commented `ports` block under `backend` to re-enable direct access for debugging |
| MongoDB | Not exposed to the host by default — uncomment `ports` in `docker-compose.yml` under `mongo` for Compass access |
| Health check (from inside the network, or after uncommenting backend's ports) | http://localhost:8000/api/v1/health |
| Interactive API docs (same caveat) | http://localhost:8000/docs |

Caddy proxies `/api/*` and `/chat` to the backend container, so in normal operation the browser
only ever talks to port 80/443.

---

## Production Deployment (single VM)

Target: one self-managed Linux VM (any provider), sized for 30-100 users. No managed cloud IaC —
see `aidlc-docs/construction/U9-deployment/infrastructure-design/` for the full design.

### Prerequisites

- A Linux VM with Docker + the Docker Compose plugin installed.
- A domain name with its DNS A (and/or AAAA) record pointing at the VM's public IP — required for
  Caddy's automatic Let's Encrypt certificate.
- Ports 80 and 443 open in the VM's firewall/security group. Port 8000 does **not** need to be
  open — the backend is only reachable internally by the frontend container.

### First-time deploy

```bash
# 1. Clone the repo onto the VM
git clone <repo-url> renfit && cd renfit

# 2. Backend secrets (never committed)
cp backend/env/.env.example backend/env/.env
# edit backend/env/.env — fill in OPENAI_API_KEY

# 3. Deployment config (domain + CORS, non-secret)
cp .env.example .env
# edit .env — set DOMAIN=your-domain.com and CORS_ORIGINS=https://your-domain.com

# 4. Build and start (first time — reset DB)
docker compose -f docker-compose.reset.yml up --build -d

# 5. Visit https://your-domain.com — Caddy requests the TLS cert automatically
#    on first request (may take a few seconds).
```

### Redeploy (subsequent updates)

```bash
git pull
docker compose up --build -d
```

### Rollback

```bash
git checkout <previous-commit-or-tag>
docker compose up --build -d
```

### Monitoring

No dedicated monitoring stack is included at this scale — use:

```bash
docker compose logs -f            # all services
docker compose logs -f backend    # backend only
docker compose logs -f frontend   # Caddy access/TLS logs
curl -s https://your-domain.com/api/v1/health   # health check via the public domain
```

### Backups

MongoDB data lives in the Docker named volume `mongo_data`. To back up:

```bash
# Export a full dump from the running container
docker compose exec mongo mongodump --db renfit --out /tmp/backup
docker cp renfit-mongo:/tmp/backup ./backup-$(date +%Y%m%d)
```

To restore from a backup:

```bash
docker cp ./backup-YYYYMMDD renfit-mongo:/tmp/restore
docker compose exec mongo mongorestore --db renfit --drop /tmp/restore/renfit
```

## Common Commands

```bash
# Start in foreground (rebuild images)
docker compose up --build

# Start detached (background)
docker compose up --build -d

# Fresh start (wipes DB)
docker compose -f docker-compose.reset.yml up --build -d

# View logs
docker compose logs -f
docker compose logs -f backend

# Stop and remove containers (keeps data volumes)
docker compose down

# Stop, remove containers AND volumes (nuclear — loses all DB data)
docker compose down -v

# Rebuild a single service
docker compose build backend
docker compose up backend --no-deps

# Shell into a running container
docker compose exec backend bash
docker compose exec frontend sh
docker compose exec mongo mongosh renfit
```

## Resetting the Database

Use the reset compose file — it sets `RESET_DB=true` which triggers the backend to drop and
recreate all collections on startup:

```bash
docker compose -f docker-compose.reset.yml up -d
```

After the reset completes and all containers are healthy, switch back to the normal compose file
for subsequent runs:

```bash
docker compose up -d
```

> **Warning:** This drops and recreates the entire `renfit` database. All data is lost. The default trainer account is re-seeded automatically.

## File Layout

```
Renfit/
├── docker-compose.yml       # Normal operation (mongo + backend + frontend, preserves data)
├── docker-compose.reset.yml # Fresh start (same services, but RESET_DB=true wipes the DB)
├── Dockerfile.backend       # Backend image (build context: repo root)
├── Dockerfile.frontend      # Frontend image — multi-stage: Vite build → Caddy runtime
├── Caddyfile                # Caddy config: static SPA + reverse proxy + auto TLS
├── .env.example             # Deployment config template (DOMAIN, CORS_ORIGINS) — copy to .env
├── backend/.dockerignore
└── frontend/.dockerignore
```

## Environment Variables (Docker-specific)

Set via the root `.env` file (see `.env.example`) and consumed by `docker-compose.yml`:

| Variable | Default (if `.env` absent) | Purpose |
|---|---|---|
| `DOMAIN` | `:80` | Domain Caddy serves + requests a TLS cert for. Use a real domain in production; use `:80` (not `localhost`) for local HTTP-only testing |
| `CORS_ORIGINS` | `http://localhost:5173,...` | Origins the backend allows |

Set directly in `docker-compose.yml` (not overridden by env files):

| Variable | Value in Compose | Purpose |
|---|---|---|
| `API_HOST` | `0.0.0.0` | Bind on all interfaces inside container |
| `API_PORT` | `8000` | FastAPI port |
| `MONGODB_URI` | `mongodb://mongo:27017/renfit` | Local mongo container (compose-internal network) |
| `DB_NAME` | `renfit` | MongoDB database name |
| `RESET_DB` | `false` (normal) / `true` (reset) | Whether to wipe DB on backend startup — only `true` in `docker-compose.reset.yml` |

Set in `backend/env/.env` (secrets, not in compose):

| Variable | Purpose |
|---|---|
| `OPENAI_API_KEY` | OpenAI API key for AI Coach |
| `VAPID_PUBLIC_KEY` | Web Push VAPID public key (generate: `npx web-push generate-vapid-keys`) |
| `VAPID_PRIVATE_KEY` | Web Push VAPID private key |
| `VAPID_CONTACT_EMAIL` | Contact email for VAPID (default: `mailto:admin@renfit.local`) |

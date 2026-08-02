# U9 Deployment — Infrastructure Design

**Unit**: U9 (EN-8). Target: a single self-managed Linux cloud VM, sized for 30-100 users. No
managed cloud IaC (AWS/Azure/GCP services) — this maps logical components to VM-level
infrastructure (containers, reverse proxy/TLS, env files), per the original requirements scope
note.

## Logical component → infrastructure mapping

| Logical component | Infrastructure choice | Rationale |
|---|---|---|
| Frontend (React SPA) | Static build (`vite build`) served by **Caddy** in a container | Q1-A/Q2-A: replaces the current dev-server container; Caddy serves `dist/` and reverse-proxies API calls in one process |
| Backend (FastAPI) | Existing `Dockerfile.backend` (uvicorn), unchanged | Already production-appropriate — no dev server involved, no change needed |
| Reverse proxy / TLS termination | **Caddy**, same container as the frontend | Q1-A + Q2-A: avoids a 3rd container; Caddy auto-provisions/renews Let's Encrypt certs via its built-in ACME client |
| Database | External MongoDB (Atlas or equivalent), unchanged | Already out-of-VM; no container/volume for this unit |
| Secrets | `backend/env/.env` (gitignored), volume-mounted read-only into the backend container | Q4-A: preserves the existing pattern, no new secrets service |
| Deployment-specific non-secret config (domain, CORS origins) | New root-level `.env` consumed by `docker-compose.yml` via `env_file`/variable substitution | Q4-A: keeps `docker-compose.yml` itself generic/reusable across environments |
| Monitoring | `docker compose logs` + existing `/api/v1/health` healthcheck | Q5-A: matches the 30-100 user scale; no dedicated observability stack |
| Backups | Delegated to the external MongoDB provider's own backup/retention policy | Q6-A: no self-hosted DB volume in this unit's scope |
| CI/CD | Manual `git pull` + `docker compose up --build -d` on the VM | Q7-A: no pipeline platform introduced |

## Container topology (final)

```text
┌─────────────────────────── Cloud VM ───────────────────────────┐
│                                                                  │
│  ┌──────────────────────┐       ┌──────────────────────────┐  │
│  │  frontend container   │       │   backend container       │  │
│  │  (Caddy)               │       │   (uvicorn/FastAPI)        │  │
│  │  :80, :443 → host       │──────▶│   :8000 (internal only)   │  │
│  │  serves dist/           │ proxy │                            │  │
│  │  /api/*, /chat → backend│       │                            │  │
│  └──────────────────────┘       └──────────────┬───────────┘  │
│                                                  │              │
└──────────────────────────────────────────────────┼──────────────┘
                                                     │ MONGODB_URI (TLS, outbound)
                                                     ▼
                                          External MongoDB (Atlas)
```

Only ports 80/443 are exposed to the internet; the backend's 8000 is reachable only on the
compose-internal network (no host port mapping) — this is a NEW hardening compared to the current
compose file, which exposes 8000 directly.

## Services affected
- `frontend` (rebuilt: multi-stage Dockerfile, Caddy runtime, no more `npm run dev`)
- `backend` (unchanged Dockerfile; `docker-compose.yml` port mapping removed for 8000)
- `docker-compose.yml` (updated: new frontend build/ports, root `.env` wiring, backend port
  hardening)

## Assumptions and prerequisites (documented, not assumed silently)
- The user has provisioned a Linux VM (any provider) with Docker + Docker Compose installed, and a
  domain name's DNS A/AAAA record pointing at the VM's public IP (required for Caddy's automatic
  TLS — Q3-A).
- The external MongoDB provider's plan includes automated backups (Q6-A) — the user should confirm
  this with their provider; this deployment does not add a redundant backup layer.
- Ports 80 and 443 are open in the VM's firewall/security group; port 8000 does not need to be
  (and per the hardening above, no longer will be exposed to the host).

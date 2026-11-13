# U9 Deployment — Infrastructure Design Plan

**Unit**: U9 (EN-8 — deployment via Docker Compose on a single cloud VM, 30-100 users)
**Scope note (from requirements.md)**: "Deployment target is a single Linux cloud VM the user will
provision; no managed cloud IaC." No cloud-provider-specific services (AWS/Azure/GCP) are in scope
— this maps logical components to a self-managed VM's infrastructure (containers, reverse proxy,
TLS, volumes), not managed cloud services.

## Context found
- **Current compose setup is dev-mode, not production-ready**: `Dockerfile.frontend` runs
  `npm run dev -- --host 0.0.0.0` (the Vite *dev server*, with HMR/source maps, not a production
  build) and exposes port 5173 directly to the host. NFR-7 explicitly requires the production
  build to be served, not a dev server.
- **No reverse proxy / TLS termination exists** — both services are exposed on raw ports
  (8000, 5173) with no HTTPS anywhere in the compose stack.
- **MongoDB is already external** (Atlas or similar, via `MONGODB_URI`) — no database container to
  provision, which simplifies this unit considerably (no volumes/backups for a self-hosted DB).
- **Secrets already flow through a gitignored `backend/env/.env`** file, mounted read-only into
  the backend container — this pattern is sound and should be preserved, not replaced.
- **CORS_ORIGINS is currently hardcoded to localhost** in both `docker-compose.yml` and
  `.env.example` — will need a real domain/IP once deployed.
- No CI/CD, no monitoring/logging aggregation, no automated backups exist yet — all out of scope
  per the "single VM, 30-100 users" sizing (NFR-7's own framing), but worth confirming explicitly
  rather than assuming.

## Decisions needed (please answer)

### Question 1 — Frontend production serving
NFR-7 requires serving the built assets, not a dev server.

A) **Multi-stage Docker build**: `Dockerfile.frontend` builds the app (`npm run build`) in a
   node:20-alpine stage, then copies `dist/` into a lightweight `nginx:alpine` stage that serves
   the static files and reverse-proxies `/api`/`/chat` to the backend container (recommended) —
   removes the need for a separate reverse-proxy service, keeps the topology at 2 containers
   (frontend, backend), and nginx is the standard choice for serving a Vite SPA in production.

B) Keep 2 containers but add a 3rd dedicated reverse-proxy container (e.g. Caddy or nginx) in
   front of both frontend (serving static files via a lightweight static-file server, not Vite)
   and backend — cleaner separation of concerns, but adds a 3rd container/config surface for a
   30-100-user single-VM deployment where that separation buys little.

X) Other (please describe after [Answer]: tag below)

[Answer]: A (recommendation)

### Question 2 — TLS / HTTPS
No TLS exists anywhere in the current stack. This app handles auth (passwords) and personal health
data (InBody), so plaintext HTTP in production is a real exposure, not just a nice-to-have.

A) **Caddy as the nginx replacement for the frontend's serving layer** (recommended, supersedes
   Q1) — Caddy serves the built static assets, reverse-proxies `/api`+`/chat` to the backend, and
   automatically obtains + renews a free Let's Encrypt TLS certificate for a domain name the user
   points at the VM — zero manual certbot/nginx-TLS-config steps, which matters for a small
   single-operator deployment with no dedicated ops person.

B) nginx (per Q1-A) + a separate manual certbot/Let's Encrypt setup documented as a manual
   post-deploy step — more traditional, but adds manual certificate renewal upkeep.

C) No TLS for now (HTTP only) — document it as a known gap, defer to a future pass.

X) Other (please describe after [Answer]: tag below)

[Answer]: A (recommendation)

### Question 3 — Domain name / IP-only access
A) **Assume the user has (or will point) a domain name at the VM's IP** (recommended) — required
   for Q2-A's automatic TLS (Let's Encrypt needs a resolvable domain); document this as a
   prerequisite in the deployment guide with a placeholder (e.g. `renfit.example.com`) the user
   substitutes.

B) Design for IP-only access (no domain), accepting that automatic TLS won't work and falling back
   to Q2-C (HTTP only) or a self-signed cert (browser warnings).

X) Other (please describe after [Answer]: tag below)

[Answer]: A (recommendation)

### Question 4 — Environment/secrets handling for deployment
The existing `backend/env/.env` (gitignored, mounted read-only) pattern works locally.

A) **Keep the same pattern for the VM deployment** (recommended) — the user creates
   `backend/env/.env` directly on the VM (via `scp`/manual edit, never committed), and
   `docker-compose.yml`'s existing volume mount continues to work unchanged. Document this as the
   deployment secrets flow — no new secrets-management service (e.g. Vault) for this scale.
   Additionally introduce a root-level `.env` (or reuse compose's own env-file support) for the
   *deployment-specific* non-secret values (domain name, CORS origins) so they're not hardcoded
   into `docker-compose.yml` itself.

B) Introduce a dedicated secrets manager or cloud provider's secret store — unwarranted complexity
   for a single self-managed VM with no cloud-provider lock-in requirement.

X) Other (please describe after [Answer]: tag below)

[Answer]: A (recommendation)

### Question 5 — Monitoring / logging
No monitoring or log aggregation currently exists.

A) **Rely on `docker compose logs` + the existing `/api/v1/health` healthcheck only** (recommended)
   — matches the "single VM, 30-100 users" sizing; a dedicated monitoring stack (Prometheus/
   Grafana/ELK) is disproportionate operational overhead for this scale and wasn't requested.
   Document `docker compose logs -f` as the operational runbook for troubleshooting.

B) Add a lightweight logging/monitoring container (e.g. a log-rotation sidecar, or a hosted
   free-tier uptime-check service) as part of this unit.

X) Other (please describe after [Answer]: tag below)

[Answer]: A (recommendation)

### Question 6 — Backups
MongoDB is already externally hosted (Atlas or similar) — most managed Mongo providers include
automated backups.

A) **Out of scope — rely on the external MongoDB provider's own backup/retention policy**
   (recommended) — this project doesn't self-host the database, so there's no local data volume
   for this unit to back up. Document this assumption explicitly (confirm the provider's plan
   includes backups) rather than silently ignoring it.

B) Add a scheduled `mongodump` cron job from the VM as an additional backup layer.

X) Other (please describe after [Answer]: tag below)

[Answer]: A (recommendation)

### Question 7 — CI/CD
No CI/CD pipeline exists.

A) **Manual deploy via `git pull` + `docker compose up --build -d` on the VM** (recommended) —
   documented as a short runbook; matches "no managed cloud IaC" from the original scope note and
   avoids introducing a CI/CD platform dependency for a single-operator small app.

B) Set up a CI/CD pipeline (GitHub Actions building images and deploying via SSH) as part of this
   unit.

X) Other (please describe after [Answer]: tag below)

[Answer]: A (recommendation)

---

## Execution Checklist (runs after answers)
- [x] infrastructure-design.md — logical-component-to-VM-infrastructure mapping
- [x] deployment-architecture.md — container topology, network flow, TLS termination point

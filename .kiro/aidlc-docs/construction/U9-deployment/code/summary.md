# U9 Deployment — Code Generation Summary

**Story implemented**: EN-8 (deployment via Docker Compose on a single self-managed cloud VM).
**Status**: DONE — all infrastructure-design decisions implemented and verified.

## What was built

### `Dockerfile.frontend` — rewritten as a multi-stage build
- **Stage 1 (`build`)**: `node:20-alpine`, runs `npm ci` + `npm run build` — produces the
  production Vite bundle in `/app/dist`. Replaces the old single-stage image that ran
  `npm run dev -- --host 0.0.0.0` (the dev server) in production.
- **Stage 2 (runtime)**: `caddy:2-alpine`, copies the built `dist/` into Caddy's web root and the
  new `Caddyfile` into its config path. Exposes 80/443.

### `Caddyfile` (new)
- Serves the SPA from `/usr/share/caddy`, with `try_files`/`file_server` SPA fallback so
  client-side routing (react-router deep links) works on hard refresh.
- Reverse-proxies `/api/*` and `/chat` to `backend:8000` over the compose-internal network.
- `{$DOMAIN}` is substituted from the `DOMAIN` env var at container start — when it's a real
  domain, Caddy automatically obtains/renews a Let's Encrypt TLS certificate and redirects HTTP→
  HTTPS; when it's `localhost`/a bind address (local dev, no real domain), it serves plain HTTP.

### `docker-compose.yml` — modified
- `frontend`: ports changed from `5173:5173` to `80:80`/`443:443`; added `DOMAIN` env var (default
  `localhost`); added `caddy_data`/`caddy_config` named volumes so issued TLS certs survive
  container rebuilds (no unnecessary re-requests to Let's Encrypt).
- `backend`: removed the `8000:8000` host port mapping (commented out, with instructions to
  re-enable for local debugging) — replaced with `expose: ["8000"]`, so it's reachable only from
  the frontend/Caddy container on the compose-internal network, not from the internet. This is a
  hardening beyond the literal ask, flagged in the infra design doc and to the user as a
  standing security-awareness note (the security extension is opted out project-wide, but
  removing an unnecessary public port for an app handling auth + health data is a strict
  improvement with no functional downside).
- `CORS_ORIGINS` now reads from a `${CORS_ORIGINS}` substitution (falls back to the same localhost
  defaults) instead of being hardcoded.

### `.env.example` (new, repo root)
- Template for the two non-secret deployment values: `DOMAIN`, `CORS_ORIGINS`. Copied to `.env`
  (gitignored — confirmed via `git check-ignore`) on the deployment target.

### `.dockerignore` — modified
- Added `.env`/`.env.local` (root-level) to the ignore list, alongside the existing
  `backend/env/.env` entries.

### `DOCKER.md` — modified
- Split into "Local Development" (existing quick-start, updated for the new port 80 default) and
  a new "Production Deployment (single VM)" section: prerequisites, first-time deploy steps,
  redeploy/rollback runbooks, monitoring (`docker compose logs` + health check), and a backups
  note (delegated to the external MongoDB provider).

### `README.md` — modified
- Quick Start section and repo file-layout tree updated to reflect the new port/Caddy/`.env.example`
  setup; links to `DOCKER.md`'s production section.

## Verification
- `docker compose config` — validates cleanly, both with no root `.env` (defaults apply) and with
  a temporary test `.env` (real substitution confirmed, then removed).
- `docker build -f Dockerfile.frontend .` — builds successfully end to end (both stages).
- `caddy validate --config /etc/caddy/Caddyfile` (run inside the built image, with `DOMAIN` set) —
  valid configuration.
- Ran the built image directly (`docker run -p 18080:80 -e DOMAIN=:80 ...`) and confirmed via
  `curl`: `GET /` → 200, `GET /dashboard` (deep link) → 200 (SPA fallback working). Test container
  and image removed afterward.
- `frontend`: `npm run build` still succeeds unaffected (27 chunks, no warnings — this unit didn't
  touch application code, only deployment config). `dist/` cleaned up.
- Backend `Dockerfile.backend` unchanged — no verification needed beyond the existing test suite
  (not affected by this unit).

## Deviations from the infrastructure design
None. All decisions from `infrastructure-design.md`/`deployment-architecture.md` (Q1-Q7, all "A")
were implemented as specified.

## Files created
- `Caddyfile`
- `.env.example` (repo root)

## Files modified
- `Dockerfile.frontend` (rewritten, multi-stage)
- `docker-compose.yml`
- `.dockerignore`
- `DOCKER.md`
- `README.md`

## Files NOT touched (confirmed out of scope)
- `Dockerfile.backend`, `backend/env/.env.example`, all application source code (frontend + backend).

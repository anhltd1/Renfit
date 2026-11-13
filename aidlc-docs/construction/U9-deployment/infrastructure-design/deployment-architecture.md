# U9 Deployment — Deployment Architecture

## Network flow

1. Browser → `https://<domain>` (port 443) → **Caddy** (frontend container).
2. Caddy serves the built SPA (`dist/`) for all non-API paths.
3. Caddy reverse-proxies `/api/*` and `/chat` to `http://backend:8000` over the Docker compose
   internal network (service name `backend`, not exposed to the host).
4. Backend calls out to external MongoDB (`MONGODB_URI`, TLS) and the Anthropic API
   (`ANTHROPIC_API_KEY`) — both outbound-only, no inbound firewall changes needed for these.
5. HTTP (port 80) requests are automatically redirected to HTTPS by Caddy (default ACME-issued-cert
   behavior) — no manual redirect config needed.

## TLS

- Caddy's built-in ACME client obtains a Let's Encrypt certificate for the configured domain on
  first start, and renews automatically before expiry — no certbot, no cron job, no manual
  intervention (Q2-A).
- Requires: the domain's DNS A record already points at the VM's public IP before the frontend
  container starts (ACME HTTP-01 challenge requires the domain to resolve).

## Files changed/added

```text
Renfit/
├── Dockerfile.frontend        (REWRITTEN — multi-stage: node build → Caddy runtime)
├── Caddyfile                  (NEW — Caddy's config: domain, static root, reverse_proxy rules)
├── docker-compose.yml         (MODIFIED — frontend ports 80/443, backend port un-exposed to host,
                                 env_file wiring for a new root .env)
├── .env.example                (NEW — deployment-specific non-secret values: DOMAIN, and any
                                 values needed by docker-compose.yml's variable substitution)
├── .gitignore                  (MODIFIED — ignore root-level .env, keep .env.example tracked)
└── DOCKER.md                   (MODIFIED — production deployment section: VM prerequisites, DNS
                                 setup, first-deploy steps, redeploy runbook)
```

## Deployment runbook (first-time)

1. Provision a Linux VM; install Docker + Docker Compose plugin.
2. Point a domain's DNS A record at the VM's public IP.
3. `git clone` the repo onto the VM.
4. `cp backend/env/.env.example backend/env/.env` and fill in `ANTHROPIC_API_KEY`, `MONGODB_URI`.
5. `cp .env.example .env` (root) and set `DOMAIN=<your-domain>` and `CORS_ORIGINS=https://<your-domain>`.
6. `docker compose up --build -d`.
7. Visit `https://<your-domain>` — Caddy obtains the TLS cert automatically on first request.

## Redeploy runbook (subsequent updates)

```bash
git pull
docker compose up --build -d
```

## Rollback

```bash
git checkout <previous-commit-or-tag>
docker compose up --build -d
```

## NFR traceability
- **NFR-7 (deployability)**: multi-stage build serves production assets (not a dev server);
  Docker Compose topology; deployment steps + secret handling documented above and in `DOCKER.md`.
- **Security baseline (opted out, but not ignored)**: TLS added despite the security extension
  being disabled for this project, because auth + personal health data over plaintext HTTP in a
  real deployment is a materially different risk than during local dev — flagged per this
  assistant's standing security-awareness responsibility, not an extension re-opt-in.

# Server-only Caddy settings

Every `*.caddy` file in this folder is loaded into Caddy's global options
(see `Caddyfile`). The files are **gitignored** — they hold secrets and are
created on the server. With no `*.caddy` file, Caddy runs with defaults.

## DNS-01 certificate validation (DuckDNS)

Use this when Let's Encrypt can't reach the server from abroad (some
Vietnamese hosts block foreign traffic), so the normal HTTP check fails.
Caddy then proves ownership through a DNS TXT record instead.

On the server:

```bash
cd /opt/renfit
printf 'acme_dns duckdns %s\n' 'YOUR-DUCKDNS-TOKEN' > caddy/acme-dns.caddy
chmod 600 caddy/acme-dns.caddy
# root .env: DOMAIN=yourname.duckdns.org  and  CORS_ORIGINS=https://yourname.duckdns.org
docker compose up -d --build frontend
docker compose logs -f frontend      # look for "certificate obtained successfully"
```

The token is on your duckdns.org account page. The Caddy image includes the
`caddy-dns/duckdns` module (see `Dockerfile.frontend`).

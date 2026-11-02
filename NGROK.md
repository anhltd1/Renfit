# ngrok — Mobile Testing Guide

Use ngrok to expose your local Renfit instance to the internet so you can test on your phone
(or share with teammates) without deploying to a server.

## Why ngrok?

- Test the PWA install flow on a real phone
- Test Web Push notifications on mobile
- Share a working demo link with someone externally
- HTTPS out of the box (required for service workers and push)

---

## Setup (one-time)

### 1. Get your auth token

1. Sign up at [ngrok.com](https://dashboard.ngrok.com/signup) (free tier is enough)
2. Go to [Your Authtoken](https://dashboard.ngrok.com/get-started/your-authtoken)
3. Copy the token

### 2. Add it to your `.env`

In the root `.env` file (create from `.env.example` if it doesn't exist):

```env
NGROK_AUTHTOKEN=2abc123def456_your_actual_token_here
```

### 3. (Optional) Reserve a static URL

Free ngrok gives you a random URL each time. For a stable URL:
1. Go to [ngrok Domains](https://dashboard.ngrok.com/domains)
2. Create a free static domain (e.g. `crib-decibel-backslid.ngrok-free.dev`)
3. Use it in the command below with `--url`

---

## Running ngrok

### Make sure Renfit is running first

```bash
docker compose up -d
```

Verify it works locally: open `http://localhost` in your browser.

### Start the tunnel

**With a reserved static URL:**

```powershell
docker run -it -e NGROK_AUTHTOKEN=$env:NGROK_AUTHTOKEN ngrok/ngrok:latest http host.docker.internal:80 --url https://your-subdomain.ngrok-free.dev
```

**Without a static URL (random URL each time):**

```powershell
docker run -it -e NGROK_AUTHTOKEN=$env:NGROK_AUTHTOKEN ngrok/ngrok:latest http host.docker.internal:80
```

**On Linux/macOS (if running outside Docker):**

```bash
ngrok http 80 --url https://your-subdomain.ngrok-free.dev
```

### What's happening

```
Your Phone  ──HTTPS──►  ngrok Edge  ──tunnel──►  ngrok container  ──►  host.docker.internal:80 (Caddy)  ──►  backend:8000
```

- `host.docker.internal` is Docker Desktop's special DNS that resolves to your Windows/Mac host
- Port 80 is where Caddy (the frontend container) listens
- Caddy then proxies `/api/*` to the backend container internally

---

## Update CORS for ngrok

The backend needs to accept requests from the ngrok URL. Add it to `CORS_ORIGINS` in
`docker-compose.yml` or your root `.env`:

```env
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,https://your-subdomain.ngrok-free.dev
```

Then restart the backend:

```bash
docker compose up -d --build backend
```

---

## Testing on your phone

1. Open the ngrok URL on your phone's browser (e.g. `https://crib-decibel-backslid.ngrok-free.dev`)
2. ngrok's free tier shows an interstitial page — tap "Visit Site"
3. The app loads with the mobile UI (device detection kicks in)
4. To install as PWA: use "Add to Home Screen" from the browser menu

---

## Troubleshooting

### "connection refused" error

```
dial tcp [::1]:80: connect: connection refused
```

**Cause**: ngrok can't reach port 80 on your host.

**Fixes:**
- Make sure `docker compose up -d` is running and the frontend container is healthy
- On Windows: use `host.docker.internal:80` (not `localhost:80`)
- Remove `--net=host` — it doesn't work on Windows/Docker Desktop
- Verify: `curl http://localhost` should return HTML

### "tunnel session violates policy"

You're trying to use a static URL that belongs to a different ngrok account. Use your own or
omit `--url` for a random one.

### CORS errors in browser console

Add the ngrok URL to `CORS_ORIGINS` (see above) and restart the backend.

### Push notifications don't work

Push requires HTTPS + a valid service worker. ngrok provides HTTPS, so push should work.
Make sure you've set `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` in `backend/env/.env`.

---

## Using environment variable for the token

Instead of hardcoding the token in the command, the examples above use `$env:NGROK_AUTHTOKEN`
(PowerShell) which reads from the environment. To set it:

**From .env file (PowerShell):**
```powershell
# Load .env into the current session
Get-Content .env | ForEach-Object {
  if ($_ -match '^([^#][^=]+)=(.*)$') {
    [System.Environment]::SetEnvironmentVariable($Matches[1].Trim(), $Matches[2].Trim(), 'Process')
  }
}

# Now run ngrok
docker run -it -e NGROK_AUTHTOKEN=$env:NGROK_AUTHTOKEN ngrok/ngrok:latest http host.docker.internal:80
```

**Or just pass it directly:**
```powershell
docker run -it -e NGROK_AUTHTOKEN=2abc123def456_your_token ngrok/ngrok:latest http host.docker.internal:80
```

---

## Quick reference

| Task | Command |
|---|---|
| Start tunnel (static URL) | `docker run -it -e NGROK_AUTHTOKEN=... ngrok/ngrok:latest http host.docker.internal:80 --url https://your-sub.ngrok-free.dev` |
| Start tunnel (random URL) | `docker run -it -e NGROK_AUTHTOKEN=... ngrok/ngrok:latest http host.docker.internal:80` |
| Check tunnel status | Visit `http://localhost:4040` (ngrok's local dashboard) |
| Stop tunnel | `Ctrl+C` in the terminal running ngrok |

# Renfit — Private Gym Management Platform

A full-stack web app for a private gym. Customers book sessions, track body composition and chat with an AI coach. Personal trainers manage bookings and InBody data from a dedicated dashboard.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| Backend | Python 3.11 + FastAPI |
| Database | MongoDB 7 (self-hosted via Docker, persisted volume) |
| AI Coach | OpenAI GPT-5.6-luna via tool-use agents |
| Notifications | Web Push (VAPID) — real-time native OS notifications |
| Auth | bcrypt password hashing (passlib) |
| Infra | Docker + Docker Compose + Caddy (TLS, reverse proxy) |

---

## Quick Start (Docker — recommended)

### 1. Configure environment

```bash
cp backend/env/.env.example backend/env/.env
```

Edit `backend/env/.env` and fill in:

```
OPENAI_API_KEY=sk-...
```

For Web Push notifications (optional — app works without it):
```
VAPID_PUBLIC_KEY=<generate with: npx web-push generate-vapid-keys>
VAPID_PRIVATE_KEY=<generate with: npx web-push generate-vapid-keys>
```

> **MongoDB** is self-hosted inside Docker — no external `MONGODB_URI` needed. The compose file
> sets it to `mongodb://mongo:27017/renfit` automatically.

### 2. Run (normal — preserves existing data)

```bash
docker compose up --build -d
```

### 3. Run (first time / reset — wipes DB and starts fresh)

```bash
docker compose -f docker-compose.reset.yml up --build -d
```

This drops all collections, recreates indexes, and seeds the default admin trainer.

| Service | URL |
|---|---|
| Frontend | http://localhost |
| Backend API | not exposed to the host by default (see `docker-compose.yml`) |
| API health | via the frontend proxy, e.g. `curl http://localhost/api/v1/health` |

The first run seeds a default trainer account automatically (see [Default accounts](#default-accounts)).

> The frontend is served by Caddy in production and proxies `/api/*` and `/chat` to the backend
> container, so no CORS configuration is needed in the browser. For a real deployment (TLS,
> domain, VM setup) see [`DOCKER.md`](DOCKER.md#production-deployment-single-vm).

---

## Manual Development Setup

### Backend

```bash
cd backend
cp env/.env.example env/.env        # fill in keys
python -m venv .venv
.venv\Scripts\activate               # Windows
# source .venv/bin/activate          # macOS/Linux
pip install -r requirements.txt
python -m src.init_db.reset_database # first-time DB init
uvicorn src.main:app --reload        # http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                          # http://localhost:5173
```

---

## Application Routes

### Customer-facing

| Route | Description |
|---|---|
| `/` | Landing page |
| `/login` | Customer login |
| `/signup` | New account registration |
| `/dashboard` | Unified user dashboard (profile, InBody charts, AI coach, bookings) |
| `/ai-coach` | Standalone AI coach chat |
| `/booking` | Standalone booking calendar |

### Trainer / Admin (hidden)

| Route | Description |
|---|---|
| `/admin` | Trainer login |
| `/admin/dashboard` | Dashboard — client list, InBody tracking, booking calendar |

---

## Default Accounts

A trainer account is seeded on first startup (idempotent):

| Field | Value |
|---|---|
| Username (name) | `admin` |
| Password | `123` |

> **Change this before going to production.** The trainer account can be updated directly in MongoDB.

---

## Key Features

### Member-facing
- **Data-driven home dashboard** — next session with countdown, weight/BFM progress since first measurement, contextual AI Coach entry. Replaces static navigation links.
- **Customer auth** — signup with personal info (name, phone, age, goal, health notes, height/weight); bcrypt password; avatar upload.
- **AI Coach** — GPT-5.6-luna agent with tool use (look up customer profile, create/cancel bookings, check availability). Respects blocked slots. Chat state persists within a browser session.
- **Bookings** — 5-day sliding calendar (Mon–Sat, 08:00–20:00, 1-hour slots, max 4 customers/slot). Two-week bookable window. Blocked slots shown as unavailable.
- **InBody tracking** — read-only stacked line charts, body composition ring (muscle/fat/rest), first-vs-latest comparison with delta arrows.
- **Web Push notifications** — real-time native OS notifications for booking approvals, session reminders, new InBody data. No polling.

### Trainer/Admin-facing
- **"Hôm nay" landing screen** — today's approved sessions + all pending bookings with inline approve/reject. The PT sees what matters immediately.
- **Batch pre-booking** — select one member, paint multiple slots across days, confirm in one action. Summary notification to the member.
- **Block off slots** — block individual hours or full days (holiday, maintenance). Affected bookings can be cancelled in one assisted action. Blocked slots excluded from member calendar and AI Coach.
- **Calendar kiosk mode** ("Lịch để bàn") — fullscreen tablet view of today's schedule with real-time clock, interactive status management, date navigation.
- **Member management** — PT can create members (generates temp password), edit profiles (identity fields locked), archive/restore members (soft-delete with visual badge).
- **Client list** — sort by name / last session / next session. Archived members shown at the bottom with "Đã nghỉ" badge. Keyboard navigation (`/` to search).
- **Two-column member detail** — identity and info on the left, trainer notes + InBody charts on the right (desktop). Compact hero.
- **Trainer notes** — timestamped notes per member (PT writes about performance, improvements). Add/delete with timestamps.
- **Booking calendar** — 2-week grid with status management (approve/reject/reset), admin assignment, blocked-slot visualization (diagonal hatch).

---

## Repository Layout

```text
Renfit/
├── backend/                  # FastAPI application
│   ├── src/
│   │   ├── api/              # HTTP route handlers (auth, admin, bookings, chat, push, notifications, profile)
│   │   ├── config/           # pydantic-settings (reads env/.env)
│   │   ├── db/               # MongoDB collection accessors
│   │   ├── init_db/          # DB init, reset, and seed scripts
│   │   ├── schema/           # Pydantic models (Customer, Booking, BlockedSlot, PushSubscription, etc.)
│   │   └── services/
│   │       ├── ai/           # OpenAI agent, tools, prompts
│   │       ├── booking_service.py
│   │       ├── blocked_slot_service.py
│   │       ├── push_service.py
│   │       ├── notification_service.py
│   │       └── customer_service.py
│   ├── env/                  # .env config (gitignored)
│   ├── test/                 # Pytest unit tests
│   └── docs/                 # Backend documentation
├── frontend/                 # React + Vite SPA
│   └── src/
│       ├── app/
│       │   ├── components/   # Shared UI (CalendarKiosk, BatchBookingMode, BlockOffManager, TrainerNotes, BodyCompositionRing, etc.)
│       │   ├── desktop/      # Desktop-specific pages/components (MemberHomeDashboard, AdminTodayScreen, CustomerDetail, etc.)
│       │   ├── mobile/       # Mobile-specific pages/components (native-like bottom-tab shell)
│       │   ├── shared/       # Shared primitives (Button, Card, Modal, Skeleton, PullToRefresh, haptics), hooks, device detection
│       │   └── pages/        # Thin route-level entries (device-split)
│       └── lib/
│           ├── api/          # Typed fetch wrappers (admin, auth, bookings, chat, notifications, profile, push)
│           └── auth.ts       # localStorage session helpers
├── docker-compose.yml         # Normal operation (preserves DB)
├── docker-compose.reset.yml   # Fresh start (wipes DB, recreates everything)
├── Dockerfile.backend
├── Dockerfile.frontend        # Multi-stage: Vite build → Caddy runtime (TLS, reverse proxy)
├── Caddyfile
└── DOCKER.md                 # Docker-specific commands + production deployment guide
```

---

## Deployment (Production)

### What you need

- A Linux VM (Ubuntu/Debian recommended, any cloud provider — DigitalOcean, AWS, Hetzner, etc.)
- A domain name pointing to your VM's IP (for automatic HTTPS via Let's Encrypt)
- Docker + Docker Compose plugin installed on the VM
- Ports 80 and 443 open in the firewall

### Step-by-step

```bash
# 1. SSH into your VM
ssh user@your-server-ip

# 2. Clone the repo
git clone https://github.com/YOUR_USERNAME/renfit.git && cd renfit

# 3. Create backend secrets
cp backend/env/.env.example backend/env/.env
nano backend/env/.env
# Fill in:
#   OPENAI_API_KEY=sk-...
#   VAPID_PUBLIC_KEY=...   (generate: npx web-push generate-vapid-keys)
#   VAPID_PRIVATE_KEY=...

# 4. Create deployment config
cp .env.example .env
nano .env
# Set:
#   DOMAIN=your-domain.com
#   CORS_ORIGINS=https://your-domain.com

# 5. Deploy (first time — fresh DB)
docker compose -f docker-compose.reset.yml up --build -d

# 6. Verify
curl https://your-domain.com/api/v1/health
# Should return: {"status":"ok", ...}
```

Caddy automatically obtains and renews a Let's Encrypt TLS certificate for your domain. No manual certbot or nginx config needed.

### Subsequent deploys (after code changes)

```bash
cd renfit
git pull
docker compose up --build -d
```

### Database backups

```bash
# Create backup
docker compose exec mongo mongodump --db renfit --out /tmp/backup
docker cp renfit-mongo:/tmp/backup ./backup-$(date +%Y%m%d)

# Restore
docker cp ./backup-YYYYMMDD renfit-mongo:/tmp/restore
docker compose exec mongo mongorestore --db renfit --drop /tmp/restore/renfit
```

For more details see [`DOCKER.md`](DOCKER.md).

---

## Push to GitHub

### First-time setup

```bash
# From the project root
git init   # if not already a git repo
git add .
git commit -m "Initial commit — Renfit gym management platform"

# Create a repo on GitHub (via web or CLI)
gh repo create renfit --private --source=. --push
# OR manually:
git remote add origin https://github.com/YOUR_USERNAME/renfit.git
git branch -M main
git push -u origin main
```

### Subsequent pushes

```bash
git add .
git commit -m "description of changes"
git push
```

### What's gitignored (safe to push)

The `.gitignore` already excludes:
- `backend/env/.env` (secrets)
- `node_modules/`, `dist/`, `__pycache__/`
- `.venv/`, coverage reports
- Docker volumes (data lives in named volumes, not on disk)

You can safely push the entire repo — no secrets will leak.

---

## Further Reading

- [`DOCKER.md`](DOCKER.md) — Docker commands, environment variables, and production deployment details
- [`NGROK.md`](NGROK.md) — Mobile testing with ngrok (expose localhost to your phone)
- [`backend/docs/data-model.md`](backend/docs/data-model.md) — MongoDB collections and schema
- [`backend/docs/notifications.md`](backend/docs/notifications.md) — Notification system design
- [`frontend/README.md`](frontend/README.md) — Frontend architecture and components

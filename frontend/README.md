# Renfit Frontend

React 18 + Vite + TypeScript SPA for the Renfit gym management platform.

## Setup

```bash
npm install
npm run dev      # http://localhost:5173
```

The Vite dev server proxies `/api/*` and `/chat` requests to the backend at `http://localhost:8000` (configured in `vite.config.ts`).

To build for production:

```bash
npm run build    # output → dist/
```

---

## Pages & Routes

### Public (no login required)

| Route | Component | Description |
|---|---|---|
| `/` | `LandingPage` | Marketing landing page with CTAs |
| `/login` | `LoginPage` | Customer login (phone + password) |
| `/signup` | `SignupPage` | New account registration |

### Customer (requires login — wrapped in `AuthGuard`)

| Route | Component | Description |
|---|---|---|
| `/dashboard` | `UserDashboardPage` | Unified dashboard: profile, InBody charts, AI coach, bookings |
| `/ai-coach` | `AIChatPage` | Standalone AI coach chat |
| `/booking` | `BookingPage` | Standalone booking calendar |
| `/profile` | `ProfilePage` | Profile editor (also accessible as a dashboard tab) |

### Admin / Trainer (hidden — not linked from the UI)

| Route | Component | Description |
|---|---|---|
| `/admin` | `AdminLoginPage` | Trainer login |
| `/admin/dashboard` | `AdminDashboardPage` | Client list, InBody tracking, booking management |

---

## Key Components

### Layout & Navigation

| Component | Purpose |
|---|---|
| `Navigation` | Top nav bar — adapts based on login state (Dashboard button when logged in) |
| `AuthGuard` | Redirects unauthenticated users to `/login` |
| `AdminGuard` | Redirects unauthenticated admins to `/admin` |

### User Dashboard (`UserDashboardPage`)

A single-page shell with a persistent sidebar. Three tabs kept mounted to preserve state:

- **Hồ sơ & InBody** — profile form + read-only InBody stacked charts
- **AI Coach** — `ChatPanel` (chat history survives tab switching)
- **Đặt lịch** — `BookingCalendar` component

### Booking Calendar (`BookingCalendar`)

Shared between the customer dashboard and the standalone `/booking` page.

- Shows **5 days at a time** (default: today's date centred).
- Left/right arrow navigation slides one day at a time.
- **Today's column** is highlighted with a solid green header and a green left-border column.
- If today is Sunday (gym closed), the view snaps to the next Monday.
- Available slots show a **"+ Đặt lịch"** button; my bookings show their status with a cancel-on-click option.

### InBody Charts (`InbodyCharts`)

Shared between `AdminDashboardPage` and `UserDashboardPage`.

- Stacked line charts for Height, Weight, SMM, BFM.
- Shared x-axis (date recorded), synced scroll.
- Dynamic width expands for many data points; pads with phantom points so single entries appear left-aligned.

### Admin Booking Calendar (`AdminBookings`)

Same 5-day sliding window as the customer calendar. Trainers see all customers' bookings per slot and can approve / reject / reset status via a modal.

---

## State & Auth

Customer session is stored in **`localStorage`** via `src/lib/auth.ts`:

```typescript
getAuthUser()   // → AuthUser | null
setAuthUser()   // called after login / profile update
clearAuthUser() // logout
```

Admin session uses a separate key via `src/lib/adminAuth.ts`.

---

## API Clients

All typed fetch wrappers live in `src/lib/api/`:

| File | Endpoints |
|---|---|
| `auth.ts` | `/api/v1/auth/signup`, `/login` |
| `profile.ts` | `/api/v1/profile` (PUT, GET /inbody) |
| `bookings.ts` | `/api/v1/bookings` (availability, create, cancel) |
| `admin.ts` | `/api/v1/admin/*` (customers, InBody, bookings) |
| `chat.ts` | `/api/v1/chat` |

---

## Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_URL` | `` (empty) | Backend base URL — empty means same-origin (uses Vite proxy in dev) |

Set in a `.env` file at `frontend/.env` (not committed). Not required in Docker since the Vite proxy handles routing.

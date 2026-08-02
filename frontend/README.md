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

### Onboarding Tour (`OnboardingTour`)

First-run guide shown **once**, immediately after signup (never on a normal
login) — triggered by a one-shot `localStorage` flag set in `lib/auth.ts`
(`markNewAccount` / `consumeNewAccountFlag`). Walks through the sidebar
navigation, notifications, the Profile/InBody section, and the booking
calendar via a spotlight overlay that highlights real DOM elements marked
with `data-tour="<key>"` attributes. Shows a step counter (dots + "Bước X/Y")
and always offers a **Bỏ qua** (Skip) button and Back/Next controls.

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
| `VITE_ENABLE_SW` | unset (disabled) | Set to `true` to register the service worker in dev (it always registers in production builds) |

Set in a `.env` file at `frontend/.env` (not committed). Not required in Docker since the Vite proxy handles routing.

---

## Progressive Web App (PWA)

Renfit is installable as a PWA on mobile and desktop, backed by a hand-written
service worker (no PWA build plugin/dependency added).

| File | Purpose |
|---|---|
| `public/manifest.webmanifest` | App name, icons, `start_url`/`id` = `/dashboard`, standalone display, dark theme colors |
| `public/service-worker.js` | Precaches the app shell (`/`, manifest, icons); network-first for everything else |
| `src/lib/registerServiceWorker.ts` | Registers the SW on load — no-ops in dev unless `VITE_ENABLE_SW=true` |
| `public/icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png` | App icons, generated by `scripts/generate-pwa-icons.py` from `src/imports/image.png` |

**Important:** the service worker explicitly never intercepts `/api/*` or
`/chat` requests — booking, notification, and chat data must always be
fetched fresh from the network, never served from cache.

To regenerate icons after the logo changes (requires Python + Pillow):

```bash
python scripts/generate-pwa-icons.py
```

### Mobile responsive layout

The customer dashboard (`UserDashboardPage`) and trainer dashboard
(`AdminDashboardPage`) both collapse to mobile-friendly layouts below the
`768px` breakpoint (`useIsMobile` hook, `src/app/components/ui/use-mobile.ts`):

- **Customer dashboard**: sidebar hides below `md`; a hamburger button opens a
  slide-in drawer (profile, new chat, logout); a fixed bottom tab bar
  (overview / chat / bookings) replaces sidebar navigation. The onboarding
  tour is skipped on mobile since its spotlight targets live in the
  desktop-only sidebar — full mobile onboarding is deferred to a future pass.
- **Trainer dashboard**: master-detail pattern — the customer list and the
  customer detail panel are shown one at a time on mobile, with a sticky
  "back to list" bar in the detail view.
- Notification dropdowns/toasts (`NotificationBell`, `TrainerNotificationBell`,
  and the booking-calendar toasts) are clamped to the viewport width so they
  never overflow on narrow (< 360px) screens.

This is a responsive/layout pass only — a distinct native-feeling mobile UI
(different visual style, not just reflow) is a deferred follow-up.

# Services (Frontend Orchestration Layer)

The frontend "services" are the client-side modules that orchestrate data, session, and platform
concerns. No backend services change; these wrap the existing REST API and browser platform.

## API Client Service (`lib/api/*`)
- **Responsibility**: Typed fetch wrappers for auth, profile, bookings, admin, chat, notifications.
- **Orchestration**: Consumed exclusively through shared data hooks (`shared/hooks`), so both the
  desktop and mobile trees use identical request/response logic.
- **Contract**: Unchanged — same endpoints/paths as `reverse-engineering/api-documentation.md`.

## Auth / Session Service (`lib/auth.ts`, `lib/adminAuth.ts`)
- **Responsibility**: Persist customer session and admin token in `localStorage`; expose current
  user; new-account flag for onboarding.
- **Orchestration**: `useAuth`/`useAdminAuth` hooks read/write here; `AuthGuard`/`AdminGuard`
  gate routes; device-agnostic.

## Device Service (`app/device/*`) — NEW
- **Responsibility**: Resolve device class, expose `useDevice`, hold manual override.
- **Orchestration**: Wraps the app at the root; route entries and shells consume it to pick tree.

## PWA / Service Worker Service (`lib/registerServiceWorker.ts`, `public/service-worker.js`)
- **Responsibility**: Register SW, cache app shell, keep `/api/*` and `/chat` network-only.
- **Orchestration**: Registered from entry after render; no-op in dev unless `VITE_ENABLE_SW=true`.
- **Rebuild note**: Verify install/launch into mobile UI; keep the network-only rule intact.

## Design-Token Service (`styles/theme.css` + Tailwind `@theme`) — formalized
- **Responsibility**: Single runtime source of `DESIGN.md` tokens (colors, radius, spacing, fonts).
- **Rebuild note**: Sync tokens to `DESIGN.md`; remove the unused/conflicting `.dark` oklch block so
  there is one coherent dark-luxury theme.

## Build / Deploy Service (Vite + Docker Compose)
- **Responsibility**: Production build (code-split bundles) and containerized serving.
- **Orchestration**: Vite build → static assets served in the frontend container; compose wires
  frontend + backend; deploy to a single cloud VM (detailed in Infrastructure Design).

## Orchestration Summary
```
DeviceProvider (root)
  → Route entry (per URL) picks Desktop|Mobile tree
    → Tree screens/components render DESIGN.md primitives
      → Shared data hooks
        → lib/api clients ──HTTP──> FastAPI backend (unchanged)
Auth/session service gates routes; PWA service handles install/offline shell.
```

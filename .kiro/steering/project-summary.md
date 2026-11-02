---
inclusion: always
---

# Renfit — Project Summary

Renfit is a management system for a **private gym**. It gives trainees (members) and personal
trainers (PT/coach) one place to handle **session booking**, **InBody body-composition tracking**,
**profiles**, and an **AI Coach** for guidance and booking help. Small user base: ~30–100 members.

This file is the **root steering document** — read it first. It links out to the other steering
files below; read those on-demand for the area you're working in rather than loading everything
at once.

## Stack at a glance
- **Backend**: Python 3.10+, FastAPI, PyMongo (MongoDB, db name `renfit`), OpenAI
  (`gpt-5.6-luna`) for the AI Coach, `passlib[bcrypt]` for auth, `pywebpush` for
  Web Push notifications (VAPID). Tests: `pytest`.
- **Frontend**: React 18 + TypeScript + Vite 6, Tailwind CSS 4, `react-router` 7, Radix UI +
  some MUI, `recharts` (charts), `react-markdown` (chat), `lucide-react` (icons). Tests: Vitest +
  React Testing Library + fast-check.
- **Infra**: Docker Compose (`docker-compose.yml`, `docker-compose.reset.yml`,
  `Dockerfile.backend`, `Dockerfile.frontend`). Self-hosted MongoDB 7 via Docker (persisted in a
  named volume). Backend on :8000, frontend dev server on :5173 proxying `/api` and `/chat` to
  the backend. Caddy serves the production SPA + auto-TLS + reverse-proxy to the backend.
- **Design system**: dark-luxury fitness aesthetic (`#0B0B0B` background, `#0F6B3E` emerald primary,
  glassmorphism cards, pill buttons, Be Vietnam Pro font). Vietnamese-first UI text everywhere.

## Where things live
- `backend/src/api/` — REST routers (auth, profile, bookings, admin, chat, notifications)
- `backend/src/services/` — booking/customer/notification services; `services/ai/` — the AI Coach
  (agent, tools, prompts, memory, suggestions)
- `backend/src/schema/` — MongoDB document models + collection names
- `backend/docs/` — living backend docs: `data-model.md`, `notifications.md`
- `frontend/src/app/pages/` — routed pages (`LandingPage`, `LoginPage`, `SignupPage`,
  `AdminLoginPage`, `UserDashboardPage`, `AdminDashboardPage`); some pages exist but are **not
  routed** (`DashboardPage`, `ProfilePage`, `BookingPage`, `AIChatPage` — routes redirect to
  `/dashboard`), treat those as dead code
- `frontend/src/app/components/` — booking calendars, chat panel + artifacts, InBody charts,
  notification bells, onboarding tour, marketing sections, **CalendarKiosk** ("Lịch để bàn" —
  fullscreen tablet view of today's schedule with interactive status management)
- `frontend/rules/DESIGN.md` — the authoritative design-token + design-philosophy source (YAML +
  prose). All UI steering below is derived from it; if in doubt, `DESIGN.md` wins.
- `.kiro/aidlc-docs/` — AI-DLC workflow documentation (requirements, stories, designs, construction
  artifacts) for the in-progress frontend rebuild — see `aidlc-workflow.md` steering.
- `docker-compose.yml` — normal operation (preserves DB data)
- `docker-compose.reset.yml` — fresh start (drops + recreates DB, seeds admin trainer)

## Steering index (read on demand)
- `backend-architecture.md` — backend layering, data model, notification system, API conventions
- `frontend-architecture.md` — routing, app structure, state/auth patterns, device-based rendering
  (in progress)
- `design-system.md` — DESIGN.md distilled into actionable Tailwind/React rules
- `testing-conventions.md` — backend pytest + frontend Vitest/RTL/fast-check conventions
- `aidlc-workflow.md` — how the AI-DLC methodology is used on this project, and where its docs live

## Recent work (as of this writing)
Four AI-DLC initiatives completed:
1. **V1 (U1–U9)**: Frontend UI/UX rebuild — DESIGN.md conformance, native-like mobile UI via
   device detection, PWA, code-splitting, accessibility pass, Docker/Caddy deployment.
2. **V2 (U10–U17)**: Admin UX & feature improvements — denser admin layout, "Hôm nay" PT landing
   screen, block-off slots, batch pre-booking, PT member management (create/edit/archive), client
   list sorting + two-column detail, member home dashboard (next session hero, progress strip,
   body composition ring), Web Push notifications replacing polling.

3. **V3/V4 (U18–U19)**: Motion polish — duration tokens, reduced-motion, tab crossfade, undo-friendly
   row-leave, count-up, typing indicator, card tilt, SVG empty states (`motion` package installed).
4. **V5 (U20–U25)**: PT experience — attendance tracking (`completed` "Đã tập" / `no_show` "Vắng"
   booking statuses with server-side transition rules), Hôm nay hub (Đang tập/Tiếp theo card, tappable
   sessions → member, pending grouped by day, freshness indicator), undo toasts + confirm dialogs,
   accent-insensitive search, safer member/InBody forms, mobile edit/archive + single-day agenda +
   client filters, new `primary_text` green (`#3DBE7A`) and booking-status visual language, ops
   motion/size rules, session-expiry message, tablet/phone tree switch. Design rules:
   `frontend/rules/DESIGN.md` v1.1.0 "Operations Surfaces".

All are complete. See `.kiro/aidlc-docs/aidlc-state.md` for full status.

## Ground rules that apply everywhere
- All user-facing text is **Vietnamese**, dark theme only, no light-mode variants.
- Backend has **no auth tokens/JWT** — customer/trainer identity is passed as plain ids from the
  client and trusted server-side (MVP posture, documented in `backend/docs/`). Don't "fix" this
  unasked; if you touch auth, preserve the existing contract unless explicitly asked to change it.
- Prefer editing/extending existing patterns over introducing new libraries or architectures.

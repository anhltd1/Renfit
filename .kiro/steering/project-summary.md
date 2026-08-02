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
- **Backend**: Python 3.10+, FastAPI, PyMongo (MongoDB, db name `renfit`), Anthropic Claude
  (`claude-3-5-haiku-20241022`) for the AI Coach, `passlib[bcrypt]` for auth. Tests: `pytest`.
- **Frontend**: React 18 + TypeScript + Vite 6, Tailwind CSS 4, `react-router` 7, Radix UI +
  some MUI, `recharts` (charts), `react-markdown` (chat), `lucide-react` (icons). Tests: Vitest +
  React Testing Library + fast-check (added in the ongoing UI/UX rebuild, see below).
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

## Current initiative (as of this writing)
A **frontend UI/UX rebuild** is in progress via the AI-DLC workflow: rebuilding the dashboards, auth
pages, and shared components to fully conform to `DESIGN.md`, adding a **native-like mobile UI**
selected by device detection (desktop UI on computers, distinct mobile UI on phones — not just a
responsive reflow), completing the PWA, improving performance, and adding automated frontend tests.
Backend is stable and out of scope for this initiative. See `aidlc-workflow.md` and
`.kiro/aidlc-docs/aidlc-state.md` for live status.

## Ground rules that apply everywhere
- All user-facing text is **Vietnamese**, dark theme only, no light-mode variants.
- Backend has **no auth tokens/JWT** — customer/trainer identity is passed as plain ids from the
  client and trusted server-side (MVP posture, documented in `backend/docs/`). Don't "fix" this
  unasked; if you touch auth, preserve the existing contract unless explicitly asked to change it.
- Prefer editing/extending existing patterns over introducing new libraries or architectures.

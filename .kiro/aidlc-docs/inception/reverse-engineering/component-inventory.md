# Component Inventory

## Application Packages
- `backend/src/api` — REST routers (auth, profile, bookings, admin, chat, notifications).
- `backend/src/services` — domain services (booking, customer, notification, scheduler).
- `backend/src/services/ai` — AI Coach (agent, tools, prompts, memory, suggestions).
- `backend/src/db` — MongoDB access layer.
- `backend/src/schema` — document models + collection names.
- `backend/src/config` — settings.
- `backend/src/init_db` — seed/reset utilities.
- `frontend/src/app` — React pages + components (dashboards, calendars, chat, notifications, onboarding).
- `frontend/src/lib` — API clients, auth, service-worker registration.

## Infrastructure Packages
- Root `docker-compose.yml` + `Dockerfile.backend` + `Dockerfile.frontend` — container orchestration.
- `frontend/public` (manifest + service worker) — PWA runtime assets.
- (No cloud IaC: no CDK/Terraform/CloudFormation present.)

## Shared Packages
- `frontend/src/app/components/ui` — shadcn-style UI primitives (incl. `use-mobile` hook).
- `frontend/src/styles` — theme tokens.
- `backend/src/constants.py` — shared backend constants.

## Test Packages
- `backend/test` — pytest suites: `test_agent_artifacts.py`, `test_booking_notifications.py`,
  `test_notifications.py`, `test_suggestions.py`, `test_tools.py`, with `conftest.py` and
  `run_tests.ps1`.
- (Frontend: no automated test suite; verification is via `npm run build`.)

## Documentation
- `backend/docs` — `data-model.md`, `notifications.md`, `README.md`.
- `.kiro/rules` — `api-guidelines.md`, `frontend/components.mdc` (design/system rules).
- `frontend/README.md`, `backend/README.md`, root `DOCKER.md`.

## Total Count (approximate, by role)
- **Application**: 9 packages (6 backend groups incl. AI, 2 frontend groups, 1 shared UI)
- **Infrastructure**: 3 (compose + 2 Dockerfiles) + PWA assets
- **Shared**: 3
- **Test**: 1 backend test package (5 test modules)

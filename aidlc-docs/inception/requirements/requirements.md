# Requirements — Frontend UI/UX Rebuild + Native-like Mobile PWA + Deployment

## Intent Analysis Summary
- **User Request**: The backend is fine; the frontend UI/UX is low quality. Review, test, and
  rebuild the frontend UI/UX strictly following `frontend/rules/DESIGN.md`. Deliver a lightweight
  mobile PWA that looks like a **native app** (not a responsive website), with **device-based
  rendering** (desktop UI on computers, distinct mobile UI on phones). Improve performance and fix
  styling defects. Then deploy.
- **Request Type**: Enhancement + Refactor (frontend rebuild) + New capability (native-like mobile
  UI) + Deployment.
- **Scope Estimate**: Large / multiple components (grew from the initial "Moderate" estimate after
  clarification — the native-like mobile UI variant and "everything except landing" broadened it).
- **Complexity Estimate**: Complex (dual desktop/mobile UI trees, device detection, PWA completion,
  performance work, new test tooling, deployment).
- **Backend**: Out of scope for changes — treated as a stable API contract. (Minor,
  non-breaking backend touches allowed only if strictly required to support the frontend; must be
  called out.)

## In Scope
- User (trainee) Dashboard and all its tabs/components.
- Admin/Trainer Dashboard and all its components.
- Auth pages: Login, Signup, Admin Login.
- Shared components: booking calendars (customer + admin), AI chat panel + artifacts, InBody
  charts, notification bells/toasts, onboarding tour, modals.
- The PWA (complete/polish existing scaffold) + a native-like mobile UI variant.
- Frontend performance (load + runtime) and styling-defect fixes.
- Automated frontend test setup (Vitest + React Testing Library + fast-check).
- Deployment via Docker Compose to a single cloud VM.

## Out of Scope
- The marketing landing page and its sections (leave as-is).
- Backend feature changes and API contract changes.
- Native app store packaging (iOS/Android) — this is a web PWA, not a native binary.

---

## Functional Requirements

### FR-1: Device-based rendering (desktop vs mobile)
- The authenticated app MUST detect device class (computer vs mobile) and render the appropriate
  UI tree: **desktop UI** on computers, a **distinct native-like mobile UI** on phones.
- Detection MUST be robust (viewport + coarse-pointer/user-agent signals) and update on
  resize/orientation change. A single breakpoint flip is not sufficient on its own.
- The two experiences MAY share data/hooks/API clients but present different layouts/navigation.

### FR-2: Native-like mobile UI
- On mobile, most components MUST be rebuilt to feel like a native app rather than a reflowed
  website: app-style bottom tab navigation, full-screen views/stacked navigation, touch-friendly
  hit targets, native-feel transitions, sheets/drawers instead of desktop modals where appropriate.
- Core mobile flows MUST cover: dashboard overview, booking (calendar/slot flow adapted for touch),
  AI chat, InBody/progress, profile, notifications, and (trainer) member management.

### FR-3: Desktop UI rebuild
- Desktop dashboards (user + admin) and auth pages MUST be rebuilt/refined to fully conform to
  `DESIGN.md` (see NFR-1), fixing the reported defects: inconsistent text colors, box sizing,
  and proportions/ratios — especially in the dashboards.

### FR-4: PWA completion
- The existing PWA scaffold (manifest, service worker, icons, registration) MUST be completed and
  verified: installable on mobile, correct icons/splash/theme, offline-safe app shell, and the
  service worker MUST continue to never cache `/api/*` or `/chat` (fresh data).
- Installed PWA MUST launch into the native-like mobile UI on phones.

### FR-5: Feature parity
- The rebuild MUST preserve all existing functionality (auth, booking create/cancel/approve/assign,
  InBody view/record, AI chat with artifacts + suggestions, customer & trainer notifications,
  onboarding). No regression in behavior or API usage.

### FR-6: Vietnamese-first content
- All user-facing text MUST remain Vietnamese-first, with correct diacritic rendering (Be Vietnam
  Pro, line-height ≥ 1.5, no uppercased Vietnamese) per `DESIGN.md`.

### FR-7: Automated frontend tests
- A frontend test setup MUST be established: **Vitest + React Testing Library**, plus **fast-check**
  for property-based tests where applicable.
- Key components and pure utilities MUST have tests; device-based rendering logic MUST be tested.

---

## Non-Functional Requirements

### NFR-1: Design-system conformance (authoritative)
- All rebuilt UI MUST comply with `frontend/rules/DESIGN.md`: background `#0B0B0B`, primary
  `#0F6B3E`, glassmorphism cards (transparent + backdrop-blur, 1.5rem radius, ≥2rem padding),
  8px spacing grid, 300ms subtle transitions, hover scale 1.05 with green glow on primary
  elements, pill primary buttons, Be Vietnam Pro typography and scale.
- The `DESIGN.md` "Common Anti-Patterns" MUST be avoided (no bright backgrounds, no solid card
  backgrounds, no new green shades, no uppercased Vietnamese, never remove focus indicators).

### NFR-2: Accessibility
- Meet `DESIGN.md` accessibility rules: visible green focus indicators (2px, 2px offset), WCAG
  AAA-oriented contrast for text, keyboard navigability. (Full WCAG certification requires manual
  assistive-tech testing and is not claimed.)

### NFR-3: Load performance
- Reduce initial JS payload from the current single ~867 kB chunk via route-based code-splitting
  and lazy loading; improve first paint. Establish a sensible chunking strategy.

### NFR-4: Runtime performance
- Eliminate avoidable re-renders and animation jank on the dashboards (memoization, stable props,
  virtualization where lists are large). Interactions should feel smooth on mid-range phones.

### NFR-5: Styling-defect correctness
- Fix the specific reported defects: text-color inconsistencies, box sizing, and proportion/ratio
  issues, prioritizing the dashboards.

### NFR-6: Maintainability
- Shared logic (API clients, hooks, formatting) MUST be reused across desktop and mobile trees to
  avoid duplication. Device-specific code MUST be clearly organized.

### NFR-7: Deployability
- The app MUST be deployable via Docker Compose to a single cloud VM sized for ~30–100 users.
  Build must succeed (`npm run build`) and containers must run with the existing compose topology.
- Deployment guidance/docs MUST be provided; secrets stay in gitignored env files.

### NFR-8: Verification gate
- Every change set MUST pass `npm run build` cleanly, and the new frontend test suite MUST pass,
  before a stage is considered complete.

---

## Extension Configuration (from opt-in)
- **Security Baseline**: Disabled (user opted out).
- **Resiliency Baseline**: Disabled (user opted out).
- **Property-Based Testing**: Partial — enforced rules PBT-02 (round-trip), PBT-03 (invariant),
  PBT-07 (generator quality), PBT-08 (shrinking/reproducibility), PBT-09 (framework selection).
  For a UI rebuild, several PBT rules will be N/A; framework selection (fast-check) applies to the
  new test setup, and round-trip/invariant rules apply to any pure utilities (formatters, date
  helpers, availability transforms) touched on the frontend.

## Assumptions
- Backend API is stable and correct; frontend consumes it as-is.
- "Native-like" means a web PWA styled and structured to feel native, not a compiled native binary.
- Deployment target is a single Linux cloud VM the user will provision; no managed cloud IaC.

## Key Requirements Summary
Rebuild the authenticated frontend (dashboards, auth pages, shared components) to fully conform to
`DESIGN.md`, delivering a **distinct native-like mobile UI** via device-based rendering alongside the
desktop UI, completing the PWA, improving load + runtime performance, fixing dashboard styling
defects, adding a Vitest/RTL/fast-check test setup, and shipping a Docker-Compose deployment for a
small (30–100 user) private gym — all with no loss of existing functionality and no backend contract
changes.

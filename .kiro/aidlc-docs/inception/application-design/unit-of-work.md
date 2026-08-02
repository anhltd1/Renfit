# Units of Work

**Context**: Single frontend SPA (monolith). Units are **development modules** delivered
sequentially; each gets its own Construction pass (design + code + tests). Backend unchanged.
**Approved decomposition**: 9 units; desktop and mobile split per persona; recommended order;
cross-cutting perf/PWA/a11y as dedicated passes after features.

## Code Organization Strategy
Aligns with the approved architecture (`application-design.md`):
```text
frontend/src/app/
├── device/        # U1
├── shared/        # U1 (primitives/tokens), U2 (data hooks), shared feature logic
├── desktop/       # U3 (trainee), U5 (trainer)
├── mobile/        # U4 (trainee), U6 (trainer)
└── pages/         # thin route entries selecting tree by device
```
Cross-cutting units (U7 perf/PWA, U8 a11y) modify code across the above; U9 is build/deploy config.

---

## U1 — Foundation
- **Stories**: EN-1 (device rendering), EN-2 (design conformance/tokens), EN-7 (test harness).
- **Responsibilities**: `DeviceProvider`/`useDevice` (enhanced detection + override); shared
  design-system primitives (Button, Card, Input, Sheet, Modal, Toast, Tabs, focus/typography);
  formalize `theme.css`/Tailwind tokens to `DESIGN.md` and remove the unused `.dark` oklch block;
  set up Vitest + React Testing Library + fast-check with an npm test script.
- **Deliverable**: foundational scaffolding all other units build on. No user-facing screen changes
  yet beyond primitive adoption.

## U2 — Shared data layer
- **Stories**: supports FR-5 (parity) across all feature units.
- **Responsibilities**: extract API access from components into shared hooks (`useBookingAvailability`,
  `useCreateBooking`, `useChat`, `useInbodyHistory`, `useNotifications`, `useAuth`, admin variants);
  preserve current request/response behavior; add tests (incl. fast-check for pure transforms).
- **Deliverable**: one data/state layer consumed by both trees.

## U3 — Trainee desktop
- **Stories**: TS-2, TS-4, TS-6, TS-8, TS-10 (desktop).
- **Responsibilities**: rebuild desktop trainee dashboard shell, booking calendar, chat panel +
  artifacts, progress/profile, auth — restyled to `DESIGN.md`, defects fixed, behavior parity.

## U4 — Trainee mobile
- **Stories**: TS-1, TS-3, TS-5, TS-7, TS-9, TS-10 (mobile).
- **Responsibilities**: native-like mobile shell (bottom tabs + stack + sheets), mobile booking flow,
  full-screen chat + touch artifacts, mobile InBody/progress, profile, notifications, onboarding, auth.

## U5 — Trainer desktop
- **Stories**: TR-1, TR-3, TR-5, TR-6, TR-7 (desktop).
- **Responsibilities**: rebuild desktop master-detail admin dashboard, booking management modals,
  InBody recording, trainer notifications, admin login — restyled, parity preserved.

## U6 — Trainer mobile
- **Stories**: TR-2, TR-4, TR-5, TR-6 (mobile).
- **Responsibilities**: native-like mobile management (list→detail stack, sheet-based approve/reject/
  assign, InBody record sheet, notifications).

## U7 — Performance & PWA
- **Stories**: EN-3 (PWA), EN-4 (load perf/code-splitting), EN-5 (runtime perf).
- **Responsibilities**: route/tree-level code-splitting + lazy loading (split the ~867 kB monolith),
  runtime re-render/jank fixes (memoization/virtualization), complete + verify the PWA (installable,
  launches into mobile UI, SW keeps `/api`+`/chat` network-only).

## U8 — Accessibility pass
- **Stories**: EN-6.
- **Responsibilities**: green focus rings, AAA-oriented contrast, keyboard navigation across both trees.

## U9 — Deployment
- **Stories**: EN-8.
- **Responsibilities**: production frontend serving, Docker Compose topology for a single cloud VM
  (30–100 users), deploy documentation, env/secret handling.

## Delivery Order
U1 → U2 → U3 → U4 → U5 → U6 → U7 → U8 → U9.

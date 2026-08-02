---
inclusion: manual
---

# AI-DLC Workflow on This Project

This project uses the **AI-DLC** methodology (see `.kiro/steering/ai-dlc.md` for the activation
trigger and path override) for structured feature work — currently driving the **frontend UI/UX
rebuild** initiative. This file documents how it's configured here and where things live; the
`ai-dlc.md` steering file only handles activation.

## Where the docs live
All AI-DLC generated documentation is at **`.kiro/aidlc-docs/`** (relocated from the workspace-root
`aidlc-docs/` so Kiro steering/skills can reference it directly). Key files:
- `.kiro/aidlc-docs/aidlc-state.md` — **live status**: current phase/stage, per-unit progress
  checklist, extension configuration. Check this before assuming any unit is done.
- `.kiro/aidlc-docs/audit.md` — append-only audit trail of every user input and AI response,
  timestamped, per stage.
- `.kiro/aidlc-docs/inception/` — reverse-engineering, requirements, user stories, application
  design, and units-generation artifacts for the current initiative.
- `.kiro/aidlc-docs/construction/{unit-name}/` — per-unit functional design, NFR requirements/design,
  and code-generation summaries.

The staged workflow rule files (downloaded release, regenerated on demand, gitignored) live at
`.aidlc/aidlc-rules/` at the workspace root — separate from the generated docs above.

## Current initiative snapshot
Frontend UI/UX rebuild: rebuild dashboards + auth pages + shared components to conform to
`frontend/rules/DESIGN.md`, add a native-like mobile UI via device-based rendering (see
`frontend-architecture.md`), complete the PWA, improve performance, add automated frontend tests,
and deploy via Docker Compose. Backend is out of scope. Decomposed into 9 sequential units
(U1 Foundation → U9 Deployment) — see `.kiro/aidlc-docs/inception/application-design/unit-of-work.md`
for definitions and `unit-of-work-story-map.md` for story assignments. **Always check
`aidlc-state.md` for the actual current unit/stage** before continuing this work — don't assume
progress from memory.

## Extension configuration (decided during Requirements Analysis)
| Extension | Status |
|---|---|
| Security Baseline | Disabled |
| Resiliency Baseline | Disabled |
| Property-Based Testing | Partial (round-trip/invariant properties, generator quality, shrinking/reproducibility, framework selection only — see `testing-conventions.md`) |

## Adaptive stage policy for this initiative
Decided during Construction of U1 and applied to remaining units, to avoid ceremony overload on a
frontend-only rebuild:
- **Functional Design**: selective per unit (only units with real logic, not pure-styling units).
- **NFR Requirements / NFR Design**: established once, project-wide, in U1; revisited only for
  U7 (performance/PWA) and U9 (deployment) rather than repeated every unit.
- **Infrastructure Design**: U9 (deployment) only.
- **Code Generation / Build & Test**: as prescribed by the core workflow (every unit / once at the end).

## Working within this workflow
- If the user says "Using AI-DLC, ..." or asks to continue the rebuild/workflow, read
  `.kiro/aidlc-docs/aidlc-state.md` first to re-anchor on the current stage before doing anything.
- Follow the core workflow's approval gates (functional design → NFR → code generation, etc.) —
  don't skip stage-completion messages or proceed without the user's explicit approval marker
  ("Approve & Continue" / "Continue to Next Stage" / etc.).
- Log every stage transition and user response into `.kiro/aidlc-docs/audit.md` (append, never
  overwrite) per the core workflow's audit rules.
- Application code always goes to the normal workspace paths (`frontend/`, `backend/`) — never
  into `.kiro/aidlc-docs/`.

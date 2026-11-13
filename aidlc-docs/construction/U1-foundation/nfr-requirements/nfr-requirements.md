# U1 Foundation — NFR Requirements (project-wide standards)

These NFRs are established once here and apply across all units unless a later unit refines them.

## Performance
- **PERF-1 (load)**: Initial JS for a given device tree should be substantially smaller than the
  current single ~867 kB chunk. Target: route/tree-level code-splitting so the first meaningful
  route loads a lean chunk; heavy libs (recharts, react-markdown) load lazily. (Realized in U7.)
- **PERF-2 (build)**: `npm run build` must succeed with no chunk-size error and produce split chunks.
- **PERF-3 (runtime)**: No avoidable re-renders / animation jank on dashboards on a mid-range phone.
  (Realized/verified in U7; foundation provides memo-friendly hook patterns.)

## Accessibility
- **A11Y targets**: visible green focus rings (2px/2px offset), AAA-oriented contrast for body text,
  full keyboard operability. Primitives (U1) bake these in so all units inherit them. (Audit in U8.)

## Maintainability / Testability
- **TEST-1**: Automated frontend tests via Vitest + React Testing Library; property-based tests via
  fast-check (PBT-09). Runnable via npm scripts; single-run mode for CI/Windows (no watch).
- **TEST-2 (PBT-08)**: fast-check shrinking enabled; seed logged on failure; deterministic runs.
- **TEST-3 (NFR-8)**: Each unit passes `npm run build` + tests before its stage completes.
- **MAINT-1**: Shared layer reused across trees; no duplicated data logic; trees never import each other.

## Usability
- **UX-1**: DESIGN.md conformance is the usability baseline (dark luxury, glassmorphism, Vietnamese-safe).
- **UX-2 (mobile)**: native-like interactions (bottom tabs, stacked nav, sheets, touch targets ≥ 44px).

## Security (extension disabled)
- Security extension opted OUT. Baseline hygiene only: no secrets in frontend code; continue the
  existing localStorage session model (unchanged); SW never caches `/api/*` or `/chat`.

## Availability / Scalability
- Small user base (30–100). No special scaling NFRs for the frontend beyond a cheap single-VM deploy
  (U9). No resiliency extension (opted OUT).

## Applicability note
- NFR Requirements/Design are treated as project-wide here; units U3–U6 inherit them without
  repeating the stage. U7 refines PERF-1/2/3; U9 covers deployment specifics.

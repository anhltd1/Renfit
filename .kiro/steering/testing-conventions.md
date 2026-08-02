---
inclusion: fileMatch
fileMatchPattern: ["**/*.test.*", "**/*.spec.*", "backend/test/**/*.py"]
---

# Testing Conventions

## Backend — pytest
- Location: `backend/test/`. Config: `backend/pytest.ini`, fixtures in `conftest.py`.
- Run: from `backend/`, `<pypoetry-venv-python> -m pytest test/` (venv path:
  `C:\Users\anh.le_deliveree\AppData\Roaming\pypoetry\venv\Scripts\python.exe`).
- Existing suites to extend rather than duplicate: `test_tools.py` (AI tools), `test_suggestions.py`
  (suggested replies), `test_notifications.py` / `test_booking_notifications.py` (notification
  triggers + idempotency), `test_agent_artifacts.py` (chat artifacts).
- After any change touching startup/config/imports, confirm `import src.main` still succeeds.
- No property-based testing on the backend currently — the PBT extension (see aidlc-workflow.md)
  is scoped to the frontend rebuild only.

## Frontend — Vitest + React Testing Library + fast-check
Added in U1 of the frontend rebuild (see aidlc-workflow.md). Config: `frontend/vitest.config.ts`
(jsdom environment), setup: `frontend/src/test/setup.ts` (jest-dom matchers, auto-cleanup).

- **Run**: `npm run test` (single run, use this — not watch mode — for verification and CI-style
  checks) or `npm run test:watch` for local iteration.
- **Colocate tests**: `Component.tsx` + `Component.test.tsx` in the same folder. No `__tests__/` tree.
- **Naming**: `describe(ComponentOrModuleName)` → `it('does specific behavior', ...)`.
- **`data-testid` convention**: `{component}-{element-role}` (e.g. `button-primary`,
  `input-phone`, `tab-overview`) — stable across renders, only changes when the element's purpose
  changes. Already applied to the shared primitives (`app/shared/primitives/`) — follow the same
  pattern for new interactive elements.

### Property-based tests (fast-check)
- Use for **pure functions** with identifiable properties (round-trip, invariant, idempotence) —
  not for React component behavior in general. Reference example: `app/device/resolveDevice.test.ts`.
- **Write a custom generator** (`fc.record({...})`) matching the domain shape — never bare
  `fc.integer()`/`fc.string()` for a domain-typed parameter. See `resolveDevice.test.ts`'s
  `signalsArb` for the pattern.
- Keep property-based and example-based tests in the same file but under separate `describe`
  blocks (`describe('... (property-based, ...)')` vs `describe('... (example-based, ...)')`) —
  don't let PBT replace pinned example cases for known scenarios.
- fast-check shrinking is on by default — don't disable it. On a real failure, promote the shrunk
  minimal case to a permanent example-based test.
- The project runs fast-check in **Partial** enforcement mode (an AI-DLC extension decision — see
  `.kiro/aidlc-docs/aidlc-state.md` Extension Configuration): only round-trip/invariant properties,
  generator quality, shrinking/reproducibility, and framework selection are treated as blocking;
  other PBT categories (stateful testing, oracle testing, induction) are advisory, not required.

### React Testing Library
- Query by role/text/testid — prefer `getByRole`/`getByText`; use `getByTestId` for elements
  without a clear accessible role (icon-only buttons already have `data-testid`).
- Use `render` + `screen`, and `fireEvent`/`userEvent` for interaction. Always assert on user-visible
  outcomes, not implementation details.
- For `DeviceProvider`-dependent components, pass `forceDevice="mobile"|"desktop"` to render
  deterministically instead of stubbing `matchMedia` unless testing the detection logic itself
  (see `DeviceProvider.test.tsx` for the `matchMedia` stub pattern when that's actually needed).

## Verification gate (both stacks)
Every change set should pass its stack's build/test before being considered done:
- Backend: tests pass + `import src.main` succeeds.
- Frontend: `npm run build` succeeds (no separate typecheck script) + `npm run test` passes.

# U1 Foundation — Code Generation Plan

**Unit**: U1 Foundation
**Stories**: EN-1 (device rendering), EN-2 (design conformance/tokens), EN-7 (test harness)
**Dependencies**: none (first unit)
**Workspace root**: `c:\Users\anh.le_deliveree\Desktop\Renfit` (brownfield — modify existing files
in place where they exist; create new files under `frontend/src/app/...` for new modules)
**Application code location**: `frontend/src/app/device/`, `frontend/src/app/shared/primitives/`,
`frontend/src/styles/theme.css` (modify), `frontend/` root config for test tooling.
**Documentation location**: `aidlc-docs/construction/U1-foundation/code/`

This plan is the single source of truth for U1 Code Generation. Execute steps in order.

---

## Step 1: Test tooling setup (EN-7, TD-1)
- [ ] Add devDependencies: `vitest`, `@vitejs/plugin-react` (already present), `jsdom`,
      `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `fast-check`
- [ ] Add `frontend/vitest.config.ts` (jsdom environment, globals, setup file)
- [ ] Add `frontend/src/test/setup.ts` (jest-dom matchers)
- [ ] Add npm scripts to `frontend/package.json`: `"test": "vitest run"`, `"test:watch": "vitest"`

## Step 2: Device detection business logic (EN-1)
- [ ] Create `frontend/src/app/device/resolveDevice.ts` — pure `resolveDevice()` per
      `business-logic-model.md` (DR-1..DR-5)
- [ ] Create `frontend/src/app/device/resolveDevice.test.ts` — fast-check property tests (PBT-03):
      always returns 'desktop'|'mobile'; override wins; width<768 ⇒ mobile

## Step 3: Device provider & hook (EN-1)
- [ ] Create `frontend/src/app/device/DeviceProvider.tsx` — context provider, matchMedia/resize
      subscriptions, override persisted to `localStorage`, `forceDevice` prop for tests
- [ ] Create `frontend/src/app/device/useDevice.ts` — context hook (throws outside provider)
- [ ] Create `frontend/src/app/device/DeviceProvider.test.tsx` — RTL tests: resolves per viewport,
      override precedence, forceDevice

## Step 4: Design tokens (EN-2, TK-1/TK-2)
- [ ] Modify `frontend/src/styles/theme.css` — verify `:root` tokens match `DESIGN.md` exactly;
      remove the unused/conflicting `.dark` oklch block (single coherent theme)

## Step 5: Shared primitives (EN-2, DC-1..DC-5, A11Y-1..A11Y-3)
- [ ] Create `frontend/src/app/shared/primitives/Button.tsx` (+ `.test.tsx`) — pill, variants,
      hover scale+glow, focus ring, `data-testid="button-{variant}"`
- [ ] Create `frontend/src/app/shared/primitives/Card.tsx` (+ `.test.tsx`) — glassmorphism only
- [ ] Create `frontend/src/app/shared/primitives/Input.tsx` (+ `.test.tsx`) — label/error/icon,
      Vietnamese-safe, `data-testid="input-{name}"`
- [ ] Create `frontend/src/app/shared/primitives/Modal.tsx` (+ `.test.tsx`) — desktop dialog
- [ ] Create `frontend/src/app/shared/primitives/Sheet.tsx` (+ `.test.tsx`) — mobile bottom sheet
- [ ] Create `frontend/src/app/shared/primitives/Toast.tsx` (+ `.test.tsx`) — viewport-clamped
- [ ] Create `frontend/src/app/shared/primitives/Tabs.tsx` (+ `.test.tsx`) — accessible tabs
- [ ] Create `frontend/src/app/shared/primitives/index.ts` — barrel export

## Step 6: Wire DeviceProvider into the app (EN-1)
- [ ] Modify `frontend/src/app/App.tsx` — wrap `<AppRoutes/>` with `<DeviceProvider>` (no route
      behavior change yet; trees still to be split in U3–U6)

## Step 7: Documentation summary
- [ ] Create `aidlc-docs/construction/U1-foundation/code/summary.md` — files created/modified,
      how to run tests, notes for downstream units (U2+ consume `useDevice` + primitives)

## Step 8: Story completion marking
- [ ] Mark EN-1, EN-2, EN-7 as implemented in `unit-of-work-story-map.md` (annotate, not delete)

---

## Story Traceability
| Step | Story |
|---|---|
| 1 | EN-7 |
| 2, 3, 6 | EN-1 |
| 4, 5 | EN-2 |
| 7, 8 | (docs/tracking) |

## Notes
- Backend untouched. No files outside `frontend/` are modified in this unit.
- Existing components are NOT yet migrated to the new primitives/device split — that begins in U2
  (data hooks) and U3–U6 (screens). U1 only lays the foundation.
- Tests are generated now; actual execution + build verification happens per NFR-8 at the end of
  this unit's Code Generation stage, and again in the final Build and Test phase.

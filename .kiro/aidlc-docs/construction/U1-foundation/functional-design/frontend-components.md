# U1 Foundation — Frontend Components

## Component Hierarchy (new/foundation)
```text
App
└── DeviceProvider (context)        # app/device/
    └── <route entries>             # pick desktop|mobile tree via useDevice
shared/primitives/                  # app/shared/primitives/
├── Button   (pill, variants, loading, glow)
├── Card     (glassmorphism, hoverable)
├── Input    (label, error, icon, Vietnamese-safe)
├── Sheet    (bottom sheet — mobile)
├── Modal    (dialog — desktop)
├── Toast    (viewport-clamped)
├── Tabs     (accessible tabs)
├── Badge / Pill
└── (focus-ring + typography utilities)
```

## Component Specs

### DeviceProvider `app/device/DeviceProvider.tsx`
- **Props**: `{ children: ReactNode; forceDevice?: DeviceClass }`.
- **State**: `signals` (viewportWidth, coarsePointer, noHover), `override`.
- **Behavior**: subscribes to matchMedia/resize; computes `device = resolveDevice(...)`; provides
  `DeviceState`. `forceDevice` overrides for tests/storybook.
- **Interactions**: `setOverride` persists to localStorage.

### useDevice `app/device/useDevice.ts`
- Returns `DeviceState`; throws if used outside provider.

### Button
- **Props**: `{ variant?: 'primary'|'secondary'; size?; loading?; disabled?; onClick?; children }`.
- **Rules**: primary = green pill, hover scale 1.05 + glow (DC-3/DC-4); focus ring (A11Y-1).

### Card
- **Props**: `{ elevated?; hoverable?; className?; children }`.
- **Rules**: glassmorphism only (DC-2); radius 1.5rem; padding ≥ 2rem.

### Input
- **Props**: `{ label?; error?; icon?; type?; value; onChange; placeholder? }`.
- **Rules**: dark-theme field, focus green border, Vietnamese-safe line-height (DC-5).

### Sheet (mobile) / Modal (desktop)
- **Sheet Props**: `{ open; onClose; side?: 'bottom'; children }` — slides from bottom, backdrop, drag/close.
- **Modal Props**: `{ open; onClose; children }` — centered dialog, backdrop-blur, viewport-safe.

### Toast
- **Props**: `{ kind: 'ok'|'err'; text }` — fixed, viewport-clamped container (no overflow on <360px).

## State Management
- Device state via React context (`DeviceProvider`).
- No global store introduced; data state lives in shared hooks (U2). Primitives are presentational.

## API Integration Points
- None in U1 (foundation). Primitives are backend-agnostic; data hooks arrive in U2.

## User Interaction Flows
- App boot → DeviceProvider resolves class → route entry renders desktop or mobile tree.
- User toggles "view desktop site" (edge case) → `setOverride('desktop')` → tree swaps live.

## Test Setup (EN-7)
- `vitest.config` (jsdom env), `@testing-library/react`, `@testing-library/jest-dom`, `fast-check`.
- npm script `test` (and `test:run` for single-run CI-style execution, matching the Windows/no-watch
  guidance).
- First tests: `resolveDevice` properties (fast-check), `DeviceProvider` render with `forceDevice`,
  and a smoke render for each primitive.

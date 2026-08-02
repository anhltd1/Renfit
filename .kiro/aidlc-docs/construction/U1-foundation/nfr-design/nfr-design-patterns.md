# U1 Foundation — NFR Design Patterns (project-wide)

## Performance Patterns
- **Route/tree-level code-splitting**: each device tree and each major route entry is `React.lazy`
  + `Suspense`-loaded, so a session loads only its device's UI. Heavy libs (recharts, react-markdown)
  are imported lazily within the screens that use them. (Applied in U7; foundation enables it by
  keeping trees import-isolated.)
- **Memoization-friendly hooks**: shared data hooks return stable references (memoized selectors,
  `useCallback`/`useMemo`) so consuming components avoid needless re-renders (PERF-3).
- **List virtualization**: reserved for large lists (bookings/members) where needed (U5/U7).

## Detection Pattern (resilience/correctness)
- **Single source via context**: `DeviceProvider` is the only place that reads device signals;
  components consume `useDevice()` — no scattered `matchMedia` calls.
- **Synchronous first resolution + subscription**: resolve once at init (no flash), then subscribe to
  matchMedia/resize `change` events; clean up listeners on unmount.
- **Override escape hatch**: persisted override guarantees a deterministic manual path.

## Security Patterns (baseline; extension disabled)
- No secrets in frontend bundles; session stays in localStorage (unchanged); SW bypasses `/api/*`
  and `/chat` (network-only) — never serve API data from cache.

## Accessibility Patterns
- Focus-ring and contrast enforced at the primitive layer (one implementation, inherited everywhere).
- Semantic roles for interactive primitives (buttons, tabs, dialog/sheet) via Radix where used.

## Testing Patterns
- **Pure-logic PBT**: `resolveDevice` and pure utilities tested with fast-check (custom generators
  for `DeviceSignals`), shrinking + seed logging (PBT-07/PBT-08).
- **Component tests**: RTL render/behavior; `DeviceProvider` with `forceDevice` to test both trees
  deterministically.
- **Separation**: example-based tests and property-based tests kept in clearly-named files (PBT-10).

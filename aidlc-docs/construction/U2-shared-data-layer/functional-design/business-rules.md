# U2 Shared Data Layer — Business Rules

## DR (Data Rules)
- **DR-1**: Every hook returns `{ data, loading, error, refetch }` at minimum (mutation hooks
  return an async function instead of `data`/`refetch`).
- **DR-2**: `error` is always the already-Vietnamese-normalized message from `lib/api`'s
  `handleResponse` — hooks never re-wrap or translate errors themselves.
- **DR-3**: `refetch()`/silent polling never clears existing `data` before the new result arrives
  (no flash-to-empty).
- **DR-4**: Polling hooks (admin bookings, both notification bells) pause while a relevant
  modal/sheet is open, exactly as today, to avoid state changing under an open dialog.
- **DR-5**: Hooks do not change any REST contract — same endpoints, same request/response shapes
  as the current `lib/api/*` modules. U2 is a refactor of *call sites*, not the API layer.

## Ownership Rules
- **OWN-1**: `frontend/src/lib/api/*` remains the single source of HTTP calls and response typing.
  Hooks in `app/shared/hooks/` call into `lib/api`, never `fetch` directly.
- **OWN-2**: Both device trees (desktop/mobile, built in U3–U6) import the same hooks — no
  duplicate data-fetching logic per tree (this is the core purpose of U2, supporting FR-5 parity).

## Migration Rule (for U3–U6, not executed in U2 itself)
- **MIG-1**: When a screen is migrated to its device tree, its inline `fetch`/`useState` data logic
  is replaced by the corresponding U2 hook — the visual/behavioral output must stay identical
  (parity), only the data-fetching implementation moves.

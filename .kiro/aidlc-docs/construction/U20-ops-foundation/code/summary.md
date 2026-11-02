# U20 Ops Foundation — Code Summary

**Status**: Code generated, unit tests green. `npm run build` deliberately not run (parallel agents);
run it at the V5 integration gate.

## Files
| File | Change |
|---|---|
| `frontend/src/styles/theme.css` | `--primary-text`, `--error-text`, `--color-primary-text`, `--color-error-text` (`:root` + `@theme inline`), `--status-*` tones, `--motion-view`; `:focus-visible` → `#3DBE7A`; `@utility tap-target`; `.ops-surface` scope |
| `frontend/src/app/shared/primitives/Toast.tsx` (+ `Toast.test.tsx`) | Optional `action`; wrapper `role="status" aria-live="polite"`; error tone via token |
| `frontend/src/app/shared/primitives/index.ts` | Also exports `ToastAction` type |
| `frontend/src/app/shared/booking/statusMeta.ts`, `StatusBadge.tsx`, `statusMeta.test.ts` | New |
| `frontend/src/app/shared/text/normalizeVi.ts`, `normalizeVi.test.ts` | New (fast-check) |
| `frontend/src/app/shared/hooks/useToast.ts`, `useUndoableAction.ts`, `useDirtyGuard.ts` (+ tests) | New; exported from `hooks/index.ts` |
| `frontend/src/app/shared/components/ConfirmDialog.tsx` (+ test, also covers `useDirtyGuard`) | New |
| `frontend/src/app/shared/forms/validation.ts`, `validation.test.ts` | New |

## Public API
```ts
// shared/booking/statusMeta.ts
type BookingStatusKey = 'pending' | 'approved' | 'rejected' | 'completed' | 'no_show';
interface BookingStatusMeta { label; Icon: LucideIcon; pillClass; textClass; borderStyle: 'solid'|'dashed'; recede; strike }
const bookingStatusMeta: Record<BookingStatusKey, BookingStatusMeta>;
function isBookingStatusKey(s: string): s is BookingStatusKey;
function bookingStatusLabel(s: string): string;            // unknown → raw string
function formatBookingTime(time: string): string;          // "2026-10-29T07:00" → "T5 29/10 07:00"; unparseable → as-is
function bookingAccessibleName(b: { customer_id: string; time?: string; status: string }): string;
// shared/booking/StatusBadge.tsx
function StatusBadge({ status: string, size?: 'sm'|'md' (default 'sm'), className? }); // data-testid="status-badge-{status}"
// shared/text/normalizeVi.ts
function normalizeVi(s: string): string;
function matchesQuery(fields: Array<string|null|undefined>, query: string): boolean;
// shared/primitives/Toast.tsx
interface ToastAction { label: string; onClick: () => void }
interface ToastProps { kind: 'ok'|'err'; text: string; className?: string; action?: ToastAction }
// shared/hooks/useToast.ts
interface ToastInput { kind; text; action?: ToastAction; durationMs?: number }
interface ToastState extends ToastInput { id: number; durationMs: number }
function useToast(): { toast: ToastState | null; show(t: ToastInput): void; hide(): void; node: React.ReactNode };
const TOAST_DEFAULT_MS = 3500, TOAST_ACTION_MS = 5000;
// shared/hooks/useUndoableAction.ts
function useUndoableAction(show): { run(o: UndoableActionOptions): Promise<boolean>; pending: boolean };
// shared/components/ConfirmDialog.tsx
function ConfirmDialog({ open, title, body?, confirmLabel, cancelLabel='Huỷ', tone='default'|'danger', busy?, onConfirm, onCancel });
// shared/hooks/useDirtyGuard.ts
function useDirtyGuard<T>(initial: T, current: T): { isDirty; requestClose(onClose): void; dialog: React.ReactNode };
// shared/forms/validation.ts
validateVnPhone(s): string|null; validateAge(s, { required? } = {}): string|null;
INBODY_RANGES = { weight:[25,250], height:[100,230], SMM:[5,80], BFM:[1,150] } as const;
type InbodyField; validateInbodyField(field, value): string|null; parseDecimal(s): number;
changeWarning(prev, next, threshold = 0.10): boolean;
```

## Notes for U21–U25
- **Toast**: render `{node}` from `useToast()` once per screen. Clicking the action hides the toast
  first, then runs `onClick`. The live region is now the outer wrapper (`getByRole('status')`);
  `data-testid="toast-ok|toast-err"` stays on the inner panel, action is `toast-action`.
- **Error toast** is a dark panel with `#f87171` border/icon and white text (white on `#ef4444`
  is ~3.8:1). Success toast is unchanged.
- **useUndoableAction error text precedence**: thrown `Error.message` → `errorText` → generic
  fallback. Optimistic UI: restore state in `onError`. Undo failure shows an error toast; the
  caller is not notified — if undo must restore local state, do it inside `undo` itself.
- **ConfirmDialog** reads `DeviceContext` directly and falls back to desktop (Modal) when there
  is no `<DeviceProvider>` (deviation from "via useDevice()", which throws outside a provider).
  Danger confirm is an outlined error-tone button (`text-error-text`, tinted bg), not a red fill.
  Cancel/Escape/backdrop are ignored while `busy`.
- **useDirtyGuard**: route every close path (X button, backdrop, Escape, "Huỷ") through
  `requestClose(onClose)` and render `{guard.dialog}`. After a successful save, call `onClose`
  directly (not `requestClose`).
- **validateInbodyField** treats empty as an error (the field is required); for optional fields
  check emptiness before calling it. Comma decimals are accepted. `changeWarning` is strict `>`
  (exactly 10 % does not warn); prev `null`/`0` → no warning.
- **StatusBadge** defaults to `size="sm"`. Unknown statuses render a neutral pill with the raw value.
- **`.ops-surface`**: put on the root of PT work screens. Inside it, `animate-panel-in`,
  `animate-tab-enter` and `.tab-panel` use 150 ms, and any `hover:scale-*` is reset to none on
  hover (press `active:scale-*` still works). `var(--motion-view)` = 150 ms in scope, 250 ms outside.
- **`tap-target`**: 44×44 on `pointer: coarse`, 32×32 otherwise; Tailwind `@utility`, so it
  supports variants.
- Primitives `Button`, `Modal` still use `#0F6B3E` for their own focus ring (not in U20 scope).

# U20 Ops Foundation — Code Generation Plan

**Unit**: U20 Ops Foundation (V5)
**Requirements**: FR-6 (status meta), FR-7 (normalizeVi), FR-3/FR-8 building blocks, NFR-1 tokens,
NFR-2 ops scope, NFR-3 toast a11y — see `inception/requirements/requirements-v5.md`
**Design**: `inception/application-design/application-design-v5.md` (D5, D6, D8, D9)
**Dependencies**: none · **Backend**: none · **New dependencies**: none

---

## Step 1: Tokens in `frontend/src/styles/theme.css`
- [x] `:root` / `@theme`: `--color-primary-text: #3DBE7A`, `--color-error-text: #f87171`,
      status tones (`--status-pending`, `--status-approved`, `--status-completed`,
      `--status-no-show`, `--status-rejected`)
- [x] Global `:focus-visible` outline → `#3DBE7A`
- [x] `.ops-surface` scope: view-switch animation uses `--motion-fast`; utility to neutralise hover
      scale inside it
- [x] `.tap-target` utility: `min-width/min-height: 44px` under `@media (pointer: coarse)`, 32px
      otherwise

**Files**: 1 modified

## Step 2: Booking status meta
- [x] `frontend/src/app/shared/booking/statusMeta.ts` — `BookingStatusKey` union (5 statuses),
      `bookingStatusMeta` (label, lucide icon, tone classes, border style, `recede`),
      `bookingAccessibleName({customer_id, time, status})`
- [x] `frontend/src/app/shared/booking/StatusBadge.tsx`
- [x] `statusMeta.test.ts` — every status has label/icon/tone; accessible name contains name,
      time and label

**Files**: 3 new

## Step 3: Vietnamese-aware search
- [x] `frontend/src/app/shared/text/normalizeVi.ts` — `normalizeVi(s)`, `matchesQuery(fields, q)`
- [x] `normalizeVi.test.ts` — fast-check: idempotent; `normalizeVi(withAccents(s)) ===
      normalizeVi(s)` for generated Vietnamese strings; `đ/Đ → d`; examples ("Nguyễn" ~ "nguyen")

**Files**: 2 new

## Step 4: Toast with action + queue + undo
- [x] `shared/primitives/Toast.tsx` — optional `action?: {label, onClick}`; container keeps
      `pointer-events-none`, action button `pointer-events-auto` + `.tap-target`; `aria-live="polite"`;
      error colour via token (backward compatible props)
- [x] `shared/hooks/useToast.ts` — single visible toast, replace-on-show, auto-hide (default 3.5 s,
      5 s when an action is present), returns `{toast, show, hide}`
- [x] `shared/hooks/useUndoableAction.ts` — `run({ action, undo, successText, undoneText,
      errorText })`: awaits `action`; success → toast with "Hoàn tác"; click → awaits `undo`;
      failures → error toast; exposes `pending`
- [x] Tests: toast action click, auto-hide timing (fake timers), undo success/failure paths

**Files**: 1 modified, 2 new (+ tests)

## Step 5: Confirm dialog + dirty guard
- [x] `shared/components/ConfirmDialog.tsx` — `useDevice()` → `Modal` or `Sheet`; title, body,
      confirm label, `tone: 'danger' | 'default'`, `onConfirm/onCancel`
- [x] `shared/hooks/useDirtyGuard.ts` — `(initial, current) → { isDirty, requestClose(onClose) ,
      dialog }` rendering "Bỏ thay đổi?" via ConfirmDialog
- [x] Tests: confirm/cancel callbacks; guard closes directly when clean, prompts when dirty

**Files**: 2 new (+ tests)

## Step 6: Form validation helpers
- [x] `shared/forms/validation.ts` — `validateVnPhone`, `validateAge` (10–100, optional),
      `INBODY_RANGES` + `validateInbodyField`, `changeWarning(prev, next, 0.10)`
- [x] `validation.test.ts` — boundaries (inclusive), empty optional age, warning threshold

**Files**: 1 new (+ test)

## Step 7: Exports + verify
- [x] Export new items from `shared/primitives/index.ts` / `shared/hooks/index.ts` where that is the
      existing convention
- [~] `npm run build`, `npm run test` (known flakes per memory are pre-existing); clean `dist/`
- [x] `construction/U20-ops-foundation/code/summary.md`

---

## Summary
- **Steps**: 7 · **New files**: ~11 (+ tests) · **Modified**: `theme.css`, `Toast.tsx`, index files
- **Visible change**: focus ring colour only; everything else is consumed by U21–U25

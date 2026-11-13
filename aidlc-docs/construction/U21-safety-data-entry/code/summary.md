# U21 Safety Net & Data Entry — Code Summary

**Status**: Code generated, unit tests green (`npx vitest run` over `src/app/{desktop,mobile,shared}`
+ the new component tests: 69 files pass). `npm run build` not run (parallel agents); no
`tsconfig.json` exists, so type checking happens only at the V5 integration build.

## Files
| File | Change |
|---|---|
| `frontend/src/app/desktop/components/AdminTodayScreen.tsx` (+ new test) | Approve → toast "Đã duyệt lịch của {customer}."; reject via `useUndoableAction` (undo = `pending` + `refetch(true)`), "Đã từ chối lịch của {customer}."; failures → error toast, row stays (it only leaves after server success). Row-leave animation unchanged. `{toastNode}` rendered in main + error branches. |
| `frontend/src/app/components/TrainerNotes.tsx` (+ new test) | Delete via `useUndoableAction` ("Đã xoá ghi chú."); undo re-creates the note with `addNote(customerId, content)` (new id/timestamp, list re-sorted by `created_at` desc; skipped if the member changed meanwhile). Delete button also visible on keyboard focus. Unused `Plus` import removed. |
| `frontend/src/app/desktop/components/CustomerDetail.tsx` (+ test) | "Đã nghỉ" → `ConfirmDialog` (danger); "Khôi phục" direct. Both try/catch, busy state, success/error toast, then `onRefresh`. Sửa / Đã nghỉ / Khôi phục: `.tap-target`, `text-sm`, `aria-label` with member name, green text via `text-primary-text`. Passes `showToast` to `MemberFormModal`. Static `restoreMember` import (was dynamic). |
| `frontend/src/app/components/MemberFormModal.tsx` (+ new test) | Rebuilt on `Modal`/`Sheet` (via `DeviceContext`, desktop fallback). See API below. |
| `frontend/src/app/desktop/components/AddInbodyModal.tsx`, `mobile/components/AddInbodySheet.tsx` (+ tests) | `type="text" inputMode="decimal"` on all four numbers (comma decimals accepted); per-field `validateInbodyField` errors (blocking, `aria-invalid`/`aria-describedby`); amber non-blocking warning "Chênh lệch hơn 10% so với lần trước — kiểm tra lại." (`text-sm`, `#f59e0b`); "Lần trước" hint now on all four fields at `text-xs text-white/60`; `useDirtyGuard` on X/backdrop/Esc/Hủy; success toast "Đã lưu kết quả InBody." (parents had none); form resets on every open; buttons use the `Button` primitive. |
| `frontend/src/app/desktop/components/CustomerSidebar.tsx`, `mobile/screens/CustomerListScreen.tsx` | `matchesQuery([c.id, c.phone_number, c.goal], search)`. |

## Behaviour changes (intentional)
- Age has no default (`''`, was `'20'`); required in create, optional in edit (validated 10–100 if present).
- Phone must be a VN mobile (10 digits, leading 0); spaces/dots/dashes stripped before sending.
- Height/weight in the member form: sanity range checked only when the PT changed the field
  (legacy free-text values don't block unrelated edits).
- InBody: the single "Vui lòng nhập đầy đủ và hợp lệ." banner is replaced by per-field errors
  (existing tests updated accordingly). Unsaved InBody drafts no longer survive close/reopen —
  closing dirty asks first, and every open starts fresh.
- Create-member success screen: every close path (X, backdrop, Esc, Đóng) now calls `onSaved()`
  then `onClose()` (backdrop previously skipped `onSaved`, leaving the list stale).

## MemberFormModal API (for U24 mobile edit/archive)
```ts
interface MemberFormModalProps {
  mode: 'create' | 'edit';
  customer?: CustomerSummary;     // required for edit
  onClose: () => void;            // routed through the dirty guard
  onSaved: () => void;            // edit: called after save (form expects the parent to unmount it)
  showToast?: (t: ToastInput) => void; // pass the parent's useToast().show → "Đã lưu thay đổi."
}
```
- Mount it conditionally (as today). It picks `Sheet` when `DeviceContext.isMobile`, else `Modal`.
- The edit-success toast must live in the **parent** (it unmounts the form on save) — that is why
  it takes `showToast` instead of rendering its own toast. U24 should pass its screen's `show`.
- Test ids: `member-form`, `member-form-submit`, `member-form-cancel`, `member-form-error-{name|phone|age|height|weight}`,
  `member-form-submit-error`, `member-form-success`, `member-form-copy-password`, `member-form-done`.
- Archive flow to copy for mobile: `CustomerDetail.setActive` (ConfirmDialog only for archive).

## Notes for later units
- **U23 (Hôm nay redesign)**: `handleStatus(id, status, customerName)` holds the toast/undo
  logic; keep `{toastNode}` rendered in every return branch. Undo of a reject calls
  `refetch(true)` itself (useUndoableAction doesn't notify the caller). The pending-count pill
  still uses `text-[10px]` and several `text-[#0F6B3E]` icons — left for the redesign.
- AddInbodyModal and AddInbodySheet are deliberate copies (scope limited edits to these files);
  a shared `useInbodyForm` hook in `shared/` would be the natural follow-up.
- `CustomerDetail.test.tsx` archive block uses a 15 s per-test timeout: the full panel is slow
  under loaded parallel runs (passed ~1 s alone, hit 5 s once in a big run).
- Nested dialogs: pressing Esc while the "Bỏ thay đổi?" dialog is open fires both window
  listeners; the guard's cancel runs last, so the net result is "keep editing" (correct).

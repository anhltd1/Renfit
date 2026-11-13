# U21 Safety Net & Data Entry — Code Generation Plan

Scope: FR-3, FR-7 (apply), FR-8. Builds on U20 shared hooks/validation.

- [x] 1. AdminTodayScreen: error toasts (row restored), reject via `useUndoableAction` (undo → pending + refetch), approve success toast
- [x] 2. TrainerNotes: delete via `useUndoableAction`, undo re-creates the note with `addNote`
- [x] 3. CustomerDetail: archive `ConfirmDialog`, restore direct, try/catch + toasts, busy, `.tap-target` ≥ text-sm
- [x] 4. MemberFormModal: rebuilt on Modal/Sheet, labels, input modes, no age default, per-field validation, dirty guard, copy aria-label, Button primitive, edit toast
- [x] 5. AddInbodyModal / AddInbodySheet: decimal input mode, range errors, >10 % warning, dirty guard, success toast, "Lần trước" hint ≥ text-xs white/60
- [x] 6. CustomerSidebar / CustomerListScreen: `matchesQuery`
- [x] 7. Tests (MemberFormModal, InBody, CustomerDetail archive, TrainerNotes undo, AdminTodayScreen) + run vitest
- [x] 8. Code summary

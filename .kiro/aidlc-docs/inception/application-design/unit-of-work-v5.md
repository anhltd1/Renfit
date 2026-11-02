# Units of Work (V5) — PT Experience Improvements

Continues from U19. New units U20–U25, delivered sequentially. Each unit ends with
`npm run build` + `npm run test` (and backend `pytest` when the backend changes), `dist/` cleanup,
and a code summary in `construction/{unit}/code/summary.md`.

## Delivery order and dependencies

```
U20 Ops Foundation ──► U21 Safety & Data Entry ──► U22 Attendance ──► U23 Hôm nay Hub ──► U24 Mobile Parity & Agenda ──► U25 Ops Visual Pass
   (tokens, shared       (undo/confirm, forms,       (backend status,     (uses status actions,   (uses hub navigation,          (contrast, sizes,
    status meta, toast,   search)                      shared actions)      freshness)              agenda, filters)               motion, tablet mode)
    search, guards)
```

| Unit | Depends on | Backend | Risk |
|---|---|---|---|
| U20 | — | none | Low |
| U21 | U20 | none | Low |
| U22 | U20, U21 (undo) | **yes** (enum, validator, transitions, today payload) | Medium |
| U23 | U22 | none | Medium |
| U24 | U20–U23 | none | Medium |
| U25 | all | none | Low |

---

## U20: Ops Foundation

**Scope**: shared building blocks for every later unit (FR-6, FR-7 core, NFR-1 tokens, D5/D6/D8/D9)

**Tasks**
- [ ] `theme.css`: `--color-primary-text`, `--color-error-text`, status tone tokens, focus ring →
      `#3DBE7A`, `.ops-surface` scope (no hover scale, fast view fade), `.tap-target` (44px on
      `pointer: coarse`, 32px otherwise)
- [ ] `shared/booking/statusMeta.ts` (all 5 statuses, incl. future `completed`/`no_show`) +
      `bookingAccessibleName()`; `StatusBadge.tsx`
- [ ] `shared/text/normalizeVi.ts` + `matchesQuery()`
- [ ] `Toast` primitive: optional `action`, `aria-live="polite"`, tokenised colours;
      `shared/hooks/useToast.ts`; `useUndoableAction.ts`
- [ ] `shared/components/ConfirmDialog.tsx` (Modal desktop / Sheet mobile); `useDirtyGuard.ts`
- [ ] `shared/forms/validation.ts` (phone, age, InBody ranges, % change)
- [ ] Tests: normalizeVi properties (idempotent, accent-insensitive equality, `đ`), statusMeta
      completeness, useUndoableAction (undo + failure paths), validation boundaries, Toast action

**Output**: no visible screen change except the focus ring colour; all later units consume these.

---

## U21: Safety Net & Data Entry

**Scope**: FR-3, FR-7 (apply), FR-8

**Tasks**
- [ ] Reject booking (Hôm nay, calendar dialog, kiosk dialog) via `useUndoableAction`; Today
      approve/reject errors → error toast + row restored
- [ ] TrainerNotes delete with undo
- [ ] Archive member: `ConfirmDialog` + try/catch + success/error toast (desktop `CustomerDetail`)
- [ ] `MemberFormModal` rebuilt on `Modal`/`Sheet`: associated labels, `tel`/`decimal` input modes,
      no age default, per-field errors (`aria-invalid`/`aria-describedby`), phone check, dirty guard
- [ ] `AddInbodyModal`/`AddInbodySheet`: `inputMode="decimal"`, range errors, >10 % warning,
      dirty guard, success toast
- [ ] `normalizeVi` search in `CustomerSidebar`, `CustomerListScreen`, assign dialog (+ phone match)
- [ ] Copy-password button `aria-label`
- [ ] Tests: MemberFormModal validation + dirty guard, InBody range/warning, archive confirm flow

---

## U22: Attendance Tracking

**Scope**: FR-1, FR-6 (apply), D1–D3

**Backend tasks**
- [ ] `BookingStatus.COMPLETED/NO_SHOW`; `ACTIVE_STATUSES` includes them
- [ ] Validator enum + idempotent startup `collMod` for `Bookings`
- [ ] Transition rules + start-time check in `set_booking_status`; admin request model docs
- [ ] `/admin/today`: `TodaySession.id`, today's `completed/no_show` included, `unmarked_count`
- [ ] `attendance_summary(customer_id)` exposed on member detail payload
- [ ] Member-side booking lists return the new statuses unchanged; AI tools treat them as occupied
- [ ] pytest: transitions (valid/invalid/future), capacity with attendance statuses, today payload,
      no notifications on attendance changes
- [ ] Docs: `data-model.md`, `notifications.md`, `backend-architecture.md` steering

**Frontend tasks**
- [ ] `lib/api` types extended; `shared/booking/BookingStatusActions.tsx` (approve/reject vs
      Đã tập/Vắng by status + start time), with undo
- [ ] Calendar status dialog + kiosk dialog use `BookingStatusActions`; calendar pills use
      `statusMeta` (icon, dashed/strike for rejected, accessible names)
- [ ] Member detail (desktop + mobile): "N buổi · M vắng"
- [ ] Member side renders `completed`/`no_show` read-only via `StatusBadge`
- [ ] Tests: BookingStatusActions visibility rules, pill accessible names

---

## U23: Hôm nay Hub

**Scope**: FR-2, FR-9

**Tasks**
- [ ] Đang tập / Tiếp theo card (current + next session, countdown)
- [ ] Session rows: tappable → member detail (desktop view switch; mobile tab switch + stack push,
      Back returns to Hôm nay); attendance actions on started sessions; finished rows recede
- [ ] "Chưa điểm danh: N" indicator
- [ ] Pending grouped by day with date headers; date + time on every row
- [ ] Lịch để bàn shortcut
- [ ] `useFreshness` + `FreshnessIndicator` on Hôm nay, Lịch đặt, Lịch để bàn; offline state
- [ ] URL state: member opened from Today survives refresh
- [ ] Tests: grouping by day, current/next selection (pure function + fast-check over times),
      navigation callback

---

## U24: Mobile Parity, Day Agenda & Client Filters

**Scope**: FR-4, FR-5, FR-10, FR-12

**Tasks**
- [ ] `AdminMobileHeader` (title, bell, overflow: refresh / tablet mode / logout) on all mobile PT tabs
- [ ] `CustomerDetailScreen`: Sửa (Sheet) + Đã nghỉ/Khôi phục (confirm) + attendance summary
- [ ] `AdminDayAgenda` + `AdminDayScroller` for mobile Lịch đặt (URL key `day`); hours with
      bookings, free capacity "+ Đặt lịch", blocked/Sunday states; entry points to block-off,
      batch booking, kiosk; pending count in header
- [ ] Desktop/tablet grid: persistent faint "+" in empty cells
- [ ] Client filter chips (Đang tập / Đã nghỉ / Có lịch tuần này / Lâu chưa tập >14 ngày), URL
      key `filter`; mobile sort options + archived marker
- [ ] Next-step: "Đặt thêm buổi" toast action after single assign (enters batch mode with member);
      InBody success shows deltas vs previous record
- [ ] Tests: filter predicates, agenda slot derivation, URL state keys

---

## U25: Ops Visual & Motion Pass

**Scope**: NFR-1, NFR-2, NFR-3, FR-9 (bell), FR-11, FR-13

**Tasks**
- [ ] Contrast sweep on PT files: informational text ≥ `white/60`; green text → `primary-text`;
      error text → `error-text`
- [ ] Text ≥12px everywhere on PT screens (replace ~18 `text-[10px]`/`text-[11px]`); remove
      `uppercase` labels; `tabular-nums` on times; kiosk text ≥20px
- [ ] `.tap-target` on modal close buttons, booking pills, chips, header tabs, Sửa/Đã nghỉ,
      mobile refresh/logout, block-off checkbox
- [ ] Flat `ambient` tier on PT work screens; backgrounds `#0B0B0B`/`#000`; pill buttons; modal and
      input tokens via primitives
- [ ] Motion: `.ops-surface` on admin shells (≤150ms view fade); batch staging static style + one
      bounce on add; remove hover scale on rows/cells/pills; silent polling
- [ ] a11y: `aria-current` on header/bottom tabs, `aria-pressed` on chips, toasts `aria-live`
- [ ] Trainer bell: stop polling when push subscribed; refetch on push + `visibilitychange`
- [ ] 401 → `/admin?expired=1` + message on login (desktop + mobile)
- [ ] Tablet mode menu item (desktop header + mobile overflow) via `setOverride`
- [ ] Steering/docs: `project-summary.md` recent work; `aidlc-state.md`
- [ ] Final verification across phone (375px), tablet (1024 touch) and desktop

---

## Requirement → unit map

| Requirement | Unit(s) |
|---|---|
| FR-1 Attendance | U22 (core), U23 (Today), U24 (mobile detail) |
| FR-2 Hôm nay hub | U23 |
| FR-3 Safety net | U20 (hooks), U21 (apply), U22/U23 (status undo) |
| FR-4 Mobile parity | U24 |
| FR-5 Phone calendar | U24 |
| FR-6 Status language | U20 (meta), U22 (apply) |
| FR-7 Vietnamese search | U20 (helper), U21 (apply) |
| FR-8 Data entry | U20 (validation), U21 (apply) |
| FR-9 Freshness + bell | U23 (freshness), U25 (bell) |
| FR-10 Client filters | U24 |
| FR-11 Session expiry | U25 |
| FR-12 Next-step suggestions | U24 |
| FR-13 Tablet mode | U25 |
| NFR-1 Design conformance | U20 (tokens), U25 (sweep) |
| NFR-2 Ops motion | U20 (scope), U25 |
| NFR-3 Accessibility | U20, U22, U25 |
| NFR-4 URL state | U23, U24 |
| NFR-5 No new deps | all |
| NFR-6 Compatibility | U20 (primitives), U22 (backend) |
| NFR-7 Verification | all |

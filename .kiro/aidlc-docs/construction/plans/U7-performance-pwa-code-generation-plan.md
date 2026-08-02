# U7 Performance & PWA — Code Generation Plan

**Unit**: U7 (EN-3, EN-4, EN-5) — revisits NFR-3/NFR-4 (U1 project-wide NFRs)
**Application code location**: `frontend/src/app/**`, `frontend/package.json`
**Documentation location**: `.kiro/aidlc-docs/construction/U7-performance-pwa/code/`

---

## Step 1: Dead-code removal (DEAD-1)
- [ ] Delete `frontend/src/app/components/ui/` (46 files) — re-confirm zero imports first

## Step 2: Dead-dependency removal (DEAD-2/DEAD-3/DEAD-4)
- [ ] Remove the confirmed-unused packages from `frontend/package.json` (list in
      frontend-components.md); re-run `npm install` to update the lockfile
- [ ] Re-verify `date-fns` and `motion` have zero imports before removing; keep if any import found

## Step 3: Shared Suspense fallback
- [ ] Create `frontend/src/app/components/LazyLoadFallback.tsx` (+ `.test.tsx`)

## Step 4: Route-level code-splitting (SPLIT-1/SPLIT-2)
- [ ] Modify `frontend/src/app/App.tsx` — convert the 6 route element imports to `React.lazy`,
      wrap `<AppRoutes />` in one `<Suspense fallback={<LazyLoadFallback />}>`

## Step 5: Lazy-load recharts call sites (SPLIT-3)
- [ ] Wrap `StackedInbodyChart` at its 2 call sites (`desktop/components/InbodySection.tsx`,
      `mobile/components/InbodySectionMobile.tsx`) with `React.lazy` + local skeleton `Suspense`
- [ ] Extract `ProgressScreen.tsx`'s inline chart into `mobile/screens/ProgressChart.tsx`
      (+ `.test.tsx`), lazy-load it the same way

## Step 6: Lazy-load react-markdown call site (SPLIT-3)
- [ ] Wrap `ChatMessageContent` usage in `ChatPanel.tsx` with `React.lazy` + local Suspense
      (plain-text fallback)

## Step 7: Runtime memoization (MEMO-1/MEMO-2)
- [ ] `React.memo` on `desktop/components/SidebarRow.tsx`
- [ ] `React.memo` on `components/BookingCalendar.tsx`'s `SlotCell`
- [ ] Extract + memoize a `CustomerRow` component for `mobile/screens/CustomerListScreen.tsx`
- [ ] Leave `AdminBookings.tsx` unmodified (reuse-as-is precedent) — note as deviation

## Step 8: Verification
- [ ] `npm run test` — full suite must still pass
- [ ] `npm run build` — confirm multiple chunks, no size-warning, clean up `dist/`

## Step 9: Documentation summary
- [ ] Create `.kiro/aidlc-docs/construction/U7-performance-pwa/code/summary.md` (include the
      before/after bundle size comparison and the PWA-1 finding)

---

## Story Traceability
| Step | Story |
|---|---|
| 1, 2 | EN-4 (dead weight removal) |
| 3, 4 | EN-4 (route splitting) |
| 5, 6 | EN-4 (heavy-lib lazy load) |
| 7 | EN-5 (runtime perf) |
| (finding, no code) | EN-3 (PWA — already satisfied, documented) |
| 8, 9 | (verification/docs) |

## Notes
- No route paths, guards, or component props change — this unit is purely a bundling/memoization
  pass plus dead-code removal, per PARITY expectations carried over from prior units.
- `AdminBookings.tsx`, `InbodyCharts.tsx`'s internals, `TrainerNotificationBell.tsx` are NOT
  rewritten — consistent with the reuse-over-rewrite bias applied throughout U3-U6.

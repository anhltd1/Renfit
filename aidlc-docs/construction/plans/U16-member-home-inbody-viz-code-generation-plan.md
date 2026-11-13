# U16 Member Home & InBody Viz — Code Generation Plan

**Unit**: U16 Member Home & InBody Viz
**FRs**: FR-8 (Member home dashboard), FR-9 (Body composition ring + first-vs-latest)
**Dependencies**: U10 (density patterns)
**Backend changes**: None

---

## Step 1: BodyCompositionRing SVG component

- [ ] Create `frontend/src/app/components/BodyCompositionRing.tsx`
- [ ] Props: `smm`, `bfm`, `weight`, `size?`
- [ ] Renders an SVG donut chart: 3 segments (muscle=emerald, fat=red, rest=gray)
- [ ] Legend below with labels and percentages

**Files**: 1 new

---

## Step 2: InbodyComparison component

- [ ] Create `frontend/src/app/components/InbodyComparison.tsx`
- [ ] Props: `first: InbodyRecord`, `latest: InbodyRecord`
- [ ] Two-column layout: "Lần đầu" vs "Mới nhất" with per-metric delta arrows
- [ ] Color-coded: green for improvement (weight/BFM down or SMM up), red for regression

**Files**: 1 new

---

## Step 3: Desktop MemberHomeDashboard

- [ ] Create `frontend/src/app/desktop/components/MemberHomeDashboard.tsx`
- [ ] Replaces the link-cards in OverviewTab (or replaces OverviewScreen usage for desktop)
- [ ] Sections:
  - Next-session hero card (fetch from bookings API, show time + countdown + cancel)
  - If no upcoming booking: prominent "Đặt lịch tập" CTA
  - Progress strip: weight delta + BFM delta since first InBody
  - InBody snapshot: latest weight + BFM, tap navigates to InBody tab
  - AI Coach entry: contextual label "Hỏi AI Coach về kế hoạch tuần này"

**Files**: 1 new

---

## Step 4: Mobile MemberHomeScreen

- [ ] Modify `frontend/src/app/mobile/screens/OverviewScreen.tsx`
- [ ] Replace the 3 static link cards with the same data blocks as desktop:
  - Next-session hero card
  - Progress strip
  - InBody snapshot (tap → progress tab)
  - AI Coach contextual entry (tap → coach tab)
- [ ] Uses PullToRefresh for data refresh

**Files**: 1 modified

---

## Step 5: Wire BodyCompositionRing into progress views

- [ ] Add the ring to desktop `OverviewTab.tsx` InBody section (above or beside the chart)
- [ ] Add the ring to mobile `ProgressScreen.tsx`
- [ ] Add InbodyComparison to both progress views (shown when ≥2 records exist)

**Files**: 2 modified

---

## Step 6: Verify & test

- [ ] `npm run build` — no errors
- [ ] `npm run test` — all pass
- [ ] Clean up `dist/`

**Files**: Test files as needed

---

## Summary

- **Total steps**: 6
- **New files**: 3 (`BodyCompositionRing.tsx`, `InbodyComparison.tsx`, `MemberHomeDashboard.tsx`)
- **Modified files**: ~3 (`OverviewScreen.tsx`, `OverviewTab.tsx`, `ProgressScreen.tsx`)
- **Backend changes**: 0

# U15 Client List & Detail Improvements — Code Generation Plan

**Unit**: U15 Client List & Detail
**FRs**: FR-6 (Client list), FR-7 (Member detail layout)
**Dependencies**: U14 (archive field, edit actions already in place)
**Note**: Compact hero + edit/create buttons already done in U14. Focus here is sort/columns/keyboard + two-column layout.

---

## Step 1: Backend — Add last/next session data to customer list

- [ ] Modify `GET /api/v1/admin/customers` to include `last_session` and `next_session` fields (ISO datetime strings or null) derived from the Bookings collection
- [ ] Add these to `CustomerSummary` model

**Files**: `backend/src/api/admin.py`

---

## Step 2: Frontend — Update CustomerSummary interface

- [ ] Add `last_session?: string | null` and `next_session?: string | null` to `CustomerSummary` in `lib/api/admin.ts`

**Files**: `frontend/src/lib/api/admin.ts`

---

## Step 3: Frontend — SidebarRow shows last session

- [ ] `SidebarRow.tsx` — Add a small "Gần nhất: dd/mm" line below the phone number when `last_session` exists

**Files**: `frontend/src/app/desktop/components/SidebarRow.tsx`

---

## Step 4: Frontend — Sort modes in CustomerSidebar

- [ ] Add local `sort` state: `'alpha' | 'lastSession' | 'nextSession'`
- [ ] Add sort toggle buttons in the search area (3 small pills)
- [ ] Sort the `filtered` array according to the active sort mode:
  - `alpha`: A–Z by name (default)
  - `lastSession`: oldest first (members not seen recently at top)
  - `nextSession`: soonest upcoming first

**Files**: `frontend/src/app/desktop/components/CustomerSidebar.tsx`

---

## Step 5: Frontend — Keyboard navigation (desktop)

- [ ] `CustomerSidebar.tsx` — add keyboard listener:
  - `/` focuses the search input
  - Arrow up/down moves selection through the filtered list
  - Enter selects the highlighted item

**Files**: `frontend/src/app/desktop/components/CustomerSidebar.tsx`

---

## Step 6: Frontend — Two-column desktop detail layout

- [ ] `CustomerDetail.tsx` — Restructure into two columns:
  - Left column: hero (already compact) + info fields
  - Right column: TrainerNotes + InbodySection
  - Both columns scroll independently

**Files**: `frontend/src/app/desktop/components/CustomerDetail.tsx`

---

## Step 7: Verify & test

- [ ] `npm run build` — no errors
- [ ] `npm run test` — all pass
- [ ] Clean up `dist/`

**Files**: Test files as needed

---

## Summary

- **Total steps**: 7
- **New files**: 0
- **Modified files**: ~5 (`admin.py`, `admin.ts`, `SidebarRow.tsx`, `CustomerSidebar.tsx`, `CustomerDetail.tsx`)
- **Backend changes**: Enrich customer list response with booking-derived session dates

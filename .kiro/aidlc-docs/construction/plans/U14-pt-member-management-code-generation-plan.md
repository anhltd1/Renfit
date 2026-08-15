# U14 PT Member Management — Code Generation Plan

**Unit**: U14 PT Member Management
**FRs**: FR-5 (Create/Edit/Archive member)
**Dependencies**: U11 (tab structure)

---

## Step 1: Backend — Customer schema update (active field)

- [ ] Modify `backend/src/schema/customer.py` — add `active: bool = True` field
- [ ] Modify `backend/src/api/admin.py` — update `list_customers` to filter by `active` (default `True`), add `?active=false` query param for archived

**Files**: `customer.py`, `admin.py`

---

## Step 2: Backend — Create member endpoint

- [ ] Add `CreateCustomerRequest` model: `{ name, phone_number, age, goal?, health_note?, address?, height?, weight? }`
- [ ] Add `POST /api/v1/admin/customers` endpoint:
  - Validate name/phone uniqueness (reuse signup logic)
  - Generate random 6-char alphanumeric password
  - Hash and store
  - Return `{ ...CustomerSummary, temporary_password: str }`

**Files**: `backend/src/api/admin.py`

---

## Step 3: Backend — Edit member endpoint

- [ ] Add `EditCustomerRequest` model: `{ age?, goal?, health_note?, address?, height?, weight?, avatar? }` (no name/phone — identity locked)
- [ ] Add `PATCH /api/v1/admin/customers/{customer_id}` endpoint:
  - Verify customer exists
  - Update only provided fields (skip None)
  - Return updated `CustomerSummary`

**Files**: `backend/src/api/admin.py`

---

## Step 4: Backend — Archive/restore endpoints

- [ ] Add `POST /api/v1/admin/customers/{customer_id}/archive` — set `active: false`
- [ ] Add `POST /api/v1/admin/customers/{customer_id}/restore` — set `active: true`

**Files**: `backend/src/api/admin.py`

---

## Step 5: Backend — Verify

- [ ] Confirm `import src.main` succeeds
- [ ] Rebuild backend container

**Files**: None

---

## Step 6: Frontend API client

- [ ] Add to `lib/api/admin.ts`:
  - `createMember(data)` → `{ ...CustomerSummary, temporary_password: string }`
  - `editMember(id, data)` → `CustomerSummary`
  - `archiveMember(id)` → void
  - `restoreMember(id)` → void
  - Update `fetchCustomers` to accept optional `active` param

**Files**: `frontend/src/lib/api/admin.ts`

---

## Step 7: Frontend — MemberFormModal (desktop)

- [ ] Create `frontend/src/app/desktop/components/MemberFormModal.tsx`
- [ ] Two modes: 'create' (all fields + shows temp password on success) and 'edit' (name/phone read-only)
- [ ] Fields: age, goal (presets + custom), health_note, address, height, weight
- [ ] On create success: show temp password in a copy-able field
- [ ] Uses Modal primitive

**Files**: 1 new file

---

## Step 8: Frontend — Integrate into client list and detail

- [ ] `CustomerDetail.tsx` (desktop): add edit pencil icon + archive button in header
- [ ] `CustomerDetailScreen.tsx` (mobile): same
- [ ] `CustomerSidebar.tsx`: add "Tạo hội viên" button at bottom + "Đã nghỉ" toggle
- [ ] `CustomerListScreen.tsx` (mobile): same

**Files**: 4 modified

---

## Step 9: Verify & test

- [ ] `npm run build` — no errors
- [ ] `npm run test` — all pass
- [ ] Clean up `dist/`

**Files**: Test files as needed

---

## Summary

- **Total steps**: 9
- **New files**: 1 (`MemberFormModal.tsx` — shared between desktop modal and mobile sheet)
- **Modified files**: ~7 (`customer.py`, `admin.py`, `admin.ts`, `CustomerDetail`, `CustomerDetailScreen`, `CustomerSidebar`, `CustomerListScreen`)
- **Backend changes**: 1 schema change, 4 new endpoints, 1 modified endpoint

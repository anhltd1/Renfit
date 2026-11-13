# Application Design Plan — Admin UX & Feature Improvements (V2)

## Plan Checklist

- [x] Identify new and modified components (frontend + backend)
- [x] Define component methods/interfaces for new components
- [x] Define new/modified services (backend endpoints, frontend orchestration)
- [x] Map component dependencies and data flow
- [x] Generate consolidated application-design-v2.md

## Design Questions

Answer each by filling in the letter after `[Answer]:`.

---

### Question 1: Today Screen — Data Source
The Today screen needs today's sessions and pending requests. Should it reuse the existing `fetchBookings()` response (which already contains all bookings for 2 weeks, filterable client-side) or have a dedicated lightweight endpoint?

A) Reuse existing `fetchBookings()` — filter client-side for today + pending (no new endpoint, simpler)

B) New dedicated `GET /api/v1/admin/today` endpoint returning only today's approved sessions + all pending bookings (faster, less data over the wire)

C) Other (please describe after [Answer]: tag below)

[Answer]: B

---

### Question 2: Batch Pre-Booking — Backend Approach
The batch booking needs to create multiple bookings atomically. Should the backend:

A) Single new endpoint `POST /api/v1/admin/bookings/batch-assign` accepting `{customer_id, times[]}` — loops internally, returns per-slot results

B) Frontend sends individual `assignBooking` calls in parallel (reuse existing endpoint, simpler backend, but no atomicity)

C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 3: Block Off Slots — Where to Integrate
Blocked slots need to be visible in the admin calendar AND excluded from member availability. The integration points are `booking_service.build_availability()` and the admin calendar UI. Should blocked slots also be excluded from the AI Coach's `get_available_slots` tool?

A) Yes — exclude from AI Coach availability too (consistent: if a slot is blocked, nobody can book it through any path)

B) No — only block in the member calendar UI and admin view; AI Coach remains unaffected

C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 4: Push Notifications — Subscription Scope
Push subscriptions need to be stored. Should there be one subscription per customer (single device) or multiple (member might use phone + laptop)?

A) Multiple subscriptions per customer (array of push endpoints — covers multiple devices)

B) Single subscription per customer (last device wins — simpler, good enough for 20 members)

C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 5: Member Archive — Query Impact
Adding `active: true/false` to Customer affects every query that lists customers. Should the filter be:

A) Implicit — all existing queries default to `active: true` unless explicitly requesting archived (backend handles the default)

B) Explicit — frontend always passes `?active=true` or `?active=false` (backend returns all if not specified)

C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 6: Admin Density — Scope of Density Pass
The denser layout affects admin views. Should the member-facing `UserDashboardPage` also get a density pass, or strictly admin only?

A) Admin only — member side keeps the current generous spacing (DESIGN.md as-is)

B) Both — tighten the member side slightly too (less dramatic than admin, but reduce wasted space)

C) Other (please describe after [Answer]: tag below)

[Answer]: B

---

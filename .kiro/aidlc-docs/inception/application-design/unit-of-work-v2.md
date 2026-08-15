# Units of Work (V2) — Admin UX & Feature Improvements

Continues from U9 (previous cycle). New units numbered U10–U17.

## U10: Density & Polish Pass

**Scope**: FR-1 (Admin density), FR-1 member-side lighter density, NFR-1 (micro-interactions), FR-11 (remove "Đang hoạt động")

**Responsibilities**:
- Apply denser layout to all admin views (tighter padding, smaller radii, smaller secondary text)
- Apply lighter density to member views (reduce excessive padding without changing design language)
- Add skeleton loading patterns to all data-loading states
- Add list entrance stagger animation (40ms fade-up utility)
- Remove decorative `animate-pulse` from non-live elements
- Remove "Đang hoạt động" status from ChatPanel, AIChat, DesktopHeader
- Implement empty states with icon + encouraging text + action
- Add haptics (`navigator.vibrate`) on key interactions
- Add pull-to-refresh gesture on mobile scrollable views

**Output**: Visual refresh across entire app, no new features or data models.

---

## U11: Admin Today Screen

**Scope**: FR-2 (Admin "Today" landing screen)

**Responsibilities**:
- Backend: New `GET /api/v1/admin/today` endpoint (today's approved sessions + all pending)
- Frontend: `AdminTodayScreen` component (desktop) + `AdminTodayScreenMobile` (mobile)
- Restructure admin tabs: 3-tab layout (Hôm nay / Hội viên / Lịch đặt), default to Hôm nay
- Inline approve/reject on pending bookings in the Today view
- Auto-refresh

**Output**: PT lands on actionable Today view instead of client list.

---

## U12: Block Off Slots

**Scope**: FR-4 (Block off slots)

**Responsibilities**:
- Backend: `BlockedSlot` collection + `blocked_slot_service.py` + CRUD endpoints
- Backend: Integrate into `build_availability()` and `list_window_bookings()`
- Backend: Integrate into AI Coach's `get_available_slots`
- Backend: Assisted cancellation endpoint (cancel bookings affected by a block)
- Frontend: `BlockOffManager` component (create/delete blocks)
- Frontend: Render blocked slots with diagonal-hatch in admin calendar
- Frontend: Mark blocked slots as unselectable in member booking calendar

**Output**: PT can block hours or full days; members cannot book into blocked time.

---

## U13: Batch Pre-Booking

**Scope**: FR-3 (Batch pre-booking)

**Responsibilities**:
- Backend: `POST /api/v1/admin/bookings/batch-assign` endpoint
- Backend: Summary notification logic (1 notification for N bookings)
- Frontend: `BatchBookingMode` component (member picker, slot painting, staged-slots bar)
- Frontend: "Đặt lịch loạt" toggle in admin calendar header
- Frontend: Full-slot warning before confirm
- Frontend: Optimistic UI on staged slots

**Output**: PT can assign multiple slots to one member in one action.

---

## U14: PT Member Management

**Scope**: FR-5 (Create/Edit/Archive member)

**Responsibilities**:
- Backend: `POST /api/v1/admin/customers` (create with temp password)
- Backend: `PATCH /api/v1/admin/customers/{id}` (edit, identity locked)
- Backend: `POST /api/v1/admin/customers/{id}/archive` + `/restore`
- Backend: Add `active` field to Customer schema, implicit filter on list endpoint
- Frontend: `MemberFormModal` (desktop) / `MemberFormSheet` (mobile) for create/edit
- Frontend: Archive/restore action in member detail header
- Frontend: "Đã nghỉ" filter toggle in client list

**Output**: PT can create walk-ins, fix member data, and archive former members.

---

## U15: Client List & Member Detail Improvements

**Scope**: FR-6 (Client list), FR-7 (Member detail layout)

**Responsibilities**:
- Frontend: Add last-session and next-session columns to client list rows (derived from booking data)
- Frontend: 3 sort modes (alpha, last-session, next-session)
- Frontend: Keyboard navigation on desktop (`/` to search, arrow keys)
- Frontend: Two-column desktop member detail layout (identity left, notes+InBody right)
- Frontend: Compact hero (~120px height)
- Frontend: Edit pencil icon + create-member secondary action placement

**Output**: Client list is more informative, detail panel shows more above the fold.

---

## U16: Member Home Dashboard & InBody Visualization

**Scope**: FR-8 (Member home dashboard), FR-9 (Body composition ring + first-vs-latest)

**Responsibilities**:
- Frontend: `MemberHomeDashboard` / `MemberHomeScreen` replacing link-menu overview
- Frontend: Next-session hero card (countdown, cancel action, fallback CTA)
- Frontend: Progress strip (weight delta + BFM delta since first measurement)
- Frontend: InBody snapshot (latest weight + BFM, tap to expand)
- Frontend: Contextual AI Coach entry label
- Frontend: `BodyCompositionRing` SVG component
- Frontend: `InbodyComparison` first-vs-latest two-column component
- Backend: No new endpoints needed (reuses existing booking + inbody data)

**Output**: Member lands on a data-rich dashboard; InBody presented as a story, not just charts.

---

## U17: Web Push Notifications

**Scope**: FR-10 (Web Push replacing polling)

**Responsibilities**:
- Backend: VAPID key generation + storage (config/env)
- Backend: `PushSubscription` collection + `push_service.py`
- Backend: `POST /api/v1/push/subscribe` + `DELETE /api/v1/push/unsubscribe` endpoints
- Backend: `notification_service` calls `push_service` after DB insert
- Backend: `create_trainer_notification` calls `push_service.send_to_trainers()`
- Frontend: `usePushNotifications` hook (subscribe on login, unsubscribe on logout)
- Frontend: Remove polling intervals from `useNotifications` and `useTrainerNotifications`
- Frontend: Service worker `push` event handler → show native OS notification
- Frontend: Permission request UI on first login

**Output**: Real-time notifications via push; no more polling overhead.

---

## Unit Summary

| Unit | Name | FRs | Backend Changes | Frontend Changes |
|---|---|---|---|---|
| U10 | Density & Polish | FR-1, NFR-1, FR-11 | None | All views |
| U11 | Admin Today Screen | FR-2 | 1 new endpoint | 2 new components, tab restructure |
| U12 | Block Off Slots | FR-4 | 1 new collection, 4 endpoints, availability integration | 1 new component, calendar modifications |
| U13 | Batch Pre-Booking | FR-3 | 1 new endpoint, notification logic | 1 new component, calendar modification |
| U14 | PT Member Management | FR-5 | 4 new endpoints, schema change | 2 new components, list/detail modifications |
| U15 | Client List & Detail | FR-6, FR-7 | None (derived from existing data) | List + detail layout overhaul |
| U16 | Member Home & InBody Viz | FR-8, FR-9 | None | 4 new components, overview replacement |
| U17 | Web Push | FR-10 | 1 new collection, 1 new service, 2 endpoints | 1 new hook, SW changes, remove polling |

# Requirements — Admin UX & Feature Improvements (V2)

## Intent Analysis

- **User Request**: Improve the admin/PT experience and add UI/UX polish across both admin and member sides
- **Request Type**: Enhancement (multi-feature, UX-focused)
- **Scope**: Multiple components — admin dashboard, calendar, client list, member detail, member home, notification transport, micro-interactions
- **Complexity**: Moderate-to-Complex (new views, new data models, interaction patterns, transport change)
- **Target Users**: 1 PT managing ~20 weekly members at a private gym

---

## Functional Requirements

### FR-1: Admin Layout Density

The admin side adopts a denser layout variant of the existing design system:
- Same color palette (`#0F6B3E` emerald, `#0B0B0B` background, glassmorphism)
- Tighter padding (`p-3`–`p-4` instead of `p-6`–`p-8`)
- Smaller border radii (`rounded-xl`–`rounded-2xl` instead of `rounded-3xl`)
- Smaller text where appropriate (`text-xs`–`text-sm` for secondary info)
- Goal: more rows/cards visible per screen without scrolling

### FR-2: Admin "Today" Landing Screen

Replace the current default admin view (client list) with a **Today** screen:
- **Today's sessions** — chronological list of approved bookings for today, showing time slot, member name, and member goal
- **Pending requests** — list of bookings awaiting approval, with inline approve/reject actions
- Navigation restructured: 3 tabs — **Hôm nay** (default) / **Hội viên** / **Lịch đặt**

### FR-3: Batch Pre-Booking

PT can assign multiple time slots to one member in a single action:
- **Multi-day scope** — slots can be selected across any visible days in the 2-week calendar window
- **Interaction**: "Đặt lịch loạt" mode toggle → pick member → tap slots to stage → confirm bar with count → single submit
- Staged slots shown with a visual indicator (not yet committed)
- Already-booked slots (by same member) unselectable
- Full slots selectable but warn before confirm ("X slot đã đầy — vẫn tiếp tục?")
- Backend: new endpoint accepting `customer_id` + `times[]`, returns per-slot results
- Single summary notification to the member ("HLV đã đặt N buổi tập cho bạn"), not N individual notifications
- No trainer self-notification (PT is the actor)

### FR-4: Block Off Slots

PT can mark time as unavailable:
- **Granularity**: individual hours (specific date + hour) OR full-day block (all hours on a date)
- **New data model**: `BlockedSlot` collection (not fake bookings) with fields: date, hours (list or "all"), reason (string)
- **Effect on existing bookings**: if blocking a slot with existing approved bookings — warn, show affected bookings, offer to cancel them all in one assisted action
- **Member-facing integration**: blocked slots excluded from `build_availability` (same treatment as past slots — members cannot book into them)
- **Admin calendar visual**: render with diagonal-hatch pattern (same as Sunday "Nghỉ" treatment)

### FR-5: PT Create/Edit/Archive Member

- **Edit member**: PT can modify age, address, goal, health note, height, weight, avatar. Name and phone are locked after creation (identity fields).
- **Create member**: PT creates a new account with name, phone, age, optional fields. Generates a temporary password (displayed once). Reuses existing signup logic internally.
- **Archive member**: Soft-delete via an `active` flag on Customer. Archived members hidden from the default client list, accessible via an "Đã nghỉ" filter toggle. History preserved.
- **UI placement**: Edit = pencil icon in member detail header (infrequent action). Create = secondary action at bottom of client list. Archive = within edit view.

### FR-6: Client List Improvements

- **Row content**: Avatar, name, last session date, next upcoming session date
- **Sort options** (three, toggleable): Alphabetical (A–Z), Last session (oldest first = "haven't seen lately"), Next session (soonest first)
- **Filter**: Active (default) / Archived ("Đã nghỉ") toggle
- **Keyboard navigation**: `/` to focus search, arrows to move selection (desktop)
- Derived from booking data — no new collections needed for sort/filter

### FR-7: Member Detail Layout — Desktop

- **Two-column layout**: Left column = identity (compact hero, info fields), Right column = trainer notes + InBody charts
- **Compact hero**: shrink avatar + name from ~200px to ~120px height — the PT already knows who they clicked
- No tabs within the detail panel — everything scrolls within each column
- Mobile: single-column remains, same content order (hero → info → notes → InBody)

### FR-8: Member Home Dashboard — Member Side

Replace the current static link-menu `OverviewScreen` with a data-driven dashboard:
- **Next session hero card** — upcoming approved booking with day/time, countdown, status pill, cancel action. If none booked: prominent "Đặt lịch tập" CTA
- **Progress strip** — weight change and body fat change since first InBody measurement (two numbers with ▲/▼ arrows). Tap to navigate to full charts
- **InBody snapshot** — latest measurement's weight + BFM, displayed compactly. Tap to expand to progress tab
- **AI Coach entry** — contextual label ("Hỏi AI Coach về kế hoạch tuần này") instead of generic "Trò chuyện với AI Coach"
- Keep booking and profile entries as compact icon-row or rely on bottom tab bar

### FR-9: Body Composition Ring + First-vs-Latest Comparison

- **Body composition ring**: radial gauge showing muscle (SMM) vs. fat (BFM) vs. rest as proportions. Displayed on the member's InBody/progress view
- **First-vs-latest comparison**: two-column layout showing first InBody measurement vs. most recent, with delta arrows per metric. Rendered above or alongside the existing line charts

### FR-10: Web Push Notifications

- **Replace polling** with Web Push (VAPID-based, no third-party service)
- Backend generates VAPID keys, stores push subscriptions per customer
- Frontend requests push permission on login, subscribes to push
- Existing notification types (`booking_approved`, `session_reminder`, `inbody_added`) delivered via push instead of poll
- Trainer-facing notifications also via push (single shared subscription for admin)
- Remove polling intervals from frontend notification hooks
- Service worker handles push events and shows native OS notifications

### FR-11: Remove "Đang hoạt động" Status Indicators

Remove the green pulsing "Đang hoạt động" dot and text from:
- `ChatPanel.tsx` header
- `AIChat.tsx` section
- `DesktopHeader.tsx`
- Any other occurrence

This is not a social app — online status has no meaning here.

---

## Non-Functional Requirements

### NFR-1: Micro-Interaction Polish

- **Skeleton loading**: extend existing `ChartSkeleton` pattern to all data-loading states (client list, notes, today screen). Shape matches final layout.
- **List entrance stagger**: 40ms stagger on fade-up for booking slots, client list rows, notes. One utility class, applied in ~8 places.
- **Optimistic UI on booking**: paint the slot immediately on tap, roll back on error.
- **Pull-to-refresh on mobile**: visible refresh gesture on scrollable views (dashboard, client list, calendar).
- **Haptics**: `navigator.vibrate(10)` on booking confirm, status change, tab switch (Android only, no-op elsewhere).
- **Retire decorative `animate-pulse`**: reserve for genuinely live state only (e.g., recording indicator). Remove from clock colons, background blobs, generic status dots.
- **Empty states with voice**: every empty state gets an icon, one encouraging line in Vietnamese, and the action that fixes it (not just "Chưa có dữ liệu").

### NFR-2: Chart Library

Keep recharts. Continue lazy-loading it aggressively (current strategy from U7). No library swap — the 397kB chunk is acceptable given it's lazy-loaded and doesn't affect initial page load.

### NFR-3: Extension Configuration (unchanged)

| Extension | Enabled |
|---|---|
| Security Baseline | No |
| Resiliency Baseline | No |
| Property-Based Testing | Partial (pure functions + serialization round-trips only) |

---

## Out of Scope (explicitly excluded)

- Package/payment tracking
- Attendance marking (completed/no-show statuses)
- Streaks, momentum badges, milestones
- Monthly recap cards
- Session prep view
- Client risk signals
- Note templates / quick tags
- Bulk approve pending
- Recurring bookings (auto-repeat weekly)
- Per-member session history view
- Chart delta badges / goal target lines on charts

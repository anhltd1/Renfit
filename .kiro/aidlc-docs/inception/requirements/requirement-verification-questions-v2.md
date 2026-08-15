# Requirements Verification Questions — Admin UX & Feature Improvements (V2)

This initiative focuses on improving the PT's admin experience and adding polish to the member-facing side. Please answer each question by filling in the letter choice after the [Answer]: tag.

---

## Question 1: Admin Layout Density
The current admin views use the same generous spacing as member-facing screens (p-8, rounded-3xl). Should the admin side use a denser layout to show more information per screen?

A) Yes — denser admin layout (same colors/glass, but tighter padding, smaller radii, more rows visible without scrolling)

B) No — keep the same visual density as the member side (consistent look across the whole app)

C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 2: Admin Default Landing View
The current admin landing shows the client list. We proposed replacing it with a "Today" screen (today's sessions + pending requests). How should this work?

A) Replace the default tab entirely — "Today" becomes the landing view, client list and calendar move to separate tabs

B) Add "Today" as a new first tab but keep the client list and calendar tabs as they are (3 tabs total: Today / Hội viên / Lịch đặt)

C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 3: Batch Pre-Booking — Scope
For the batch pre-booking feature (PT selects one member, then taps multiple time slots at once), should this work across multiple days or only within a single day?

A) Multi-day — PT can select slots across any visible days in the 2-week window in one batch

B) Single-day only — PT selects slots within one day, must switch days for more

C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 4: Block Off Slots — Granularity
When the PT blocks off time (holiday, equipment maintenance, etc.), what granularity should be supported?

A) Individual hours only (e.g., block 14:00–15:00 on a specific date)

B) Full-day block (block an entire day) + individual hours

C) Date range block (block multiple consecutive days, e.g., a holiday week) + full-day + individual hours

D) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 5: Block Off — Effect on Existing Bookings
If the PT blocks a slot that already has approved bookings, what should happen?

A) Warn and require PT to manually cancel existing bookings first (strict — no silent cancellation)

B) Warn, show the affected bookings, and offer to cancel them all in one action (assisted)

C) Allow blocking without affecting existing bookings — they coexist (the block only prevents new bookings)

D) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 6: PT Create/Edit Member — Edit Scope
When the PT edits a member's profile, which fields should be editable?

A) All profile fields (name, phone, age, address, goal, health note, height, weight, avatar)

B) All except name and phone (identity fields locked after creation)

C) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 7: Member Archive
Should archived members be hidden from the main list but still accessible via a filter/toggle?

A) Yes — archived members hidden by default, accessible via an "Đã nghỉ" filter toggle

B) Yes — but move archived members to a completely separate view/tab

C) No archiving needed — just delete them (data loss acceptable for a 20-person gym)

D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 8: Client List Sorting
The client list will gain a "last session" column. Which sort options are important?

A) Alphabetical + last session date (two sort options, toggle between them)

B) Alphabetical + last session + next session (three sort options)

C) Just keep alphabetical, add the columns as read-only info

D) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 9: Member Detail Layout — Desktop
For the two-column desktop layout (identity left, notes/InBody right), should we also add tabs within that detail panel?

A) Two columns, no tabs — everything scrolls within each column

B) Two columns with tabs on the right side (Ghi chú / InBody as separate tabs)

C) Single column with tabs (Thông tin / Ghi chú / InBody)

D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 10: Home Dashboard — Member Side
For the member's home dashboard redesign (next session hero, progress strip, InBody snapshot), how much InBody data should show on the home screen?

A) Minimal — just weight change since first measurement (one number + arrow)

B) Moderate — weight and body fat change (two numbers), tap to see full charts

C) Body composition ring (muscle/fat/rest ratio visualization) + weight delta

D) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 11: Web Push Notifications
You agreed to implement Web Push. Should this replace the current polling mechanism or supplement it?

A) Replace polling entirely — only push notifications (simpler, but requires push subscription)

B) Supplement — push for real-time alerts, polling as fallback for browsers that decline push permission

C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 12: Chart Library Replacement
You agreed recharts could be swapped for something lighter. The current recharts chunk is 397kB. Candidate replacements:

A) Lightweight SVG library (e.g., Chart.js with tree-shaking, or uPlot) — prioritize bundle size

B) Custom SVG — hand-roll the 2-3 chart types we actually use (line chart, composition ring) — maximum control, zero dependency

C) Keep recharts but lazy-load it more aggressively (it's already lazy-loaded; further splitting may have diminishing returns)

D) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 13: Extension Configuration (carried forward)
Previous decisions: Security Baseline = No, Resiliency Baseline = No, Property-Based Testing = Partial (pure functions + serialization round-trips only). Should these remain the same for this initiative?

A) Yes — keep the same extension configuration

B) No — I want to change one or more (please describe after [Answer]: tag below)

[Answer]: A

---

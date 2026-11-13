# Unit of Work Plan (V2) — Admin UX & Feature Improvements

## Plan Checklist

- [x] Generate unit-of-work-v2.md with unit definitions and responsibilities
- [x] Generate unit-of-work-dependency-v2.md with dependency matrix
- [x] Generate unit-of-work-story-map-v2.md mapping FRs/NFRs to units
- [x] Validate unit boundaries and dependencies

## Decomposition Questions

---

### Question 1: Delivery Priority
Which feature area should be delivered first?

A) Admin-side first (Today screen → batch booking → block-off → member CRUD → client list → member detail layout) then member-side (home dashboard → body composition → push → polish)

B) Interleave — deliver backend data models first (blocked slots + archive + push subscription), then build all views on top

C) Start with the quick wins (density pass, remove "Đang hoạt động", micro-interactions) for immediate visual improvement, then tackle features

D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 2: Push Notifications Timing
Web Push replaces polling and touches many components. Should it be:

A) Early (its own unit near the start) — so subsequent units can build on push being available from day one

B) Late (near the end) — build everything first with polling still working, then swap to push as the last step

C) Other (please describe after [Answer]: tag below)

[Answer]: B

---

### Question 3: Density + Polish — Standalone Unit or Folded In?
The density pass (FR-1) and micro-interaction polish (NFR-1) affect many files. Should they be:

A) One dedicated unit that does the full pass across all admin + member views at once

B) Folded into each unit (each unit applies density/polish to the views it touches)

C) Split: density pass as its own early unit (sets the pattern), micro-interactions folded into each subsequent unit

D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

# Unit of Work → Requirements Map (V2)

Maps each functional requirement and NFR to its delivery unit.

## FR → Unit Mapping

| Requirement | Unit | Notes |
|---|---|---|
| FR-1: Admin Layout Density | U10 | Admin density pass |
| FR-1: Member-side density (lighter) | U10 | Same unit, lighter touch |
| FR-2: Admin Today Landing Screen | U11 | Dedicated unit |
| FR-3: Batch Pre-Booking | U13 | Dedicated unit |
| FR-4: Block Off Slots | U12 | Dedicated unit |
| FR-5: PT Create/Edit/Archive Member | U14 | Dedicated unit |
| FR-6: Client List Improvements | U15 | Combined with FR-7 |
| FR-7: Member Detail Layout | U15 | Combined with FR-6 |
| FR-8: Member Home Dashboard | U16 | Combined with FR-9 |
| FR-9: Body Composition Ring + Comparison | U16 | Combined with FR-8 |
| FR-10: Web Push Notifications | U17 | Dedicated unit (last) |
| FR-11: Remove "Đang hoạt động" | U10 | Part of polish pass |

## NFR → Unit Mapping

| Requirement | Unit | Notes |
|---|---|---|
| NFR-1: Skeleton loading | U10 | Part of polish pass |
| NFR-1: List entrance stagger | U10 | Part of polish pass |
| NFR-1: Optimistic UI on booking | U13 | Applied during batch booking implementation |
| NFR-1: Pull-to-refresh | U10 | Part of polish pass (mobile) |
| NFR-1: Haptics | U10 | Part of polish pass |
| NFR-1: Retire decorative animate-pulse | U10 | Part of polish pass |
| NFR-1: Empty states with voice | U10 | Part of polish pass |
| NFR-2: Chart library (keep recharts) | — | No action needed |
| NFR-3: Extension config unchanged | — | Carry forward, no action |

## Coverage Verification

- **All 11 FRs assigned**: ✓
- **All NFR-1 items assigned**: ✓ (7 sub-items across U10 and U13)
- **No orphan requirements**: ✓
- **No unit without requirements**: ✓ (each unit maps to at least 1 FR)

# Unit of Work Dependencies (V2)

## Dependency Matrix

| Unit | Depends On | Reason |
|---|---|---|
| U10 Density & Polish | — (none) | Pure visual pass, no data model or API changes |
| U11 Admin Today Screen | U10 | Today screen should use the new dense layout from the start |
| U12 Block Off Slots | U11 | Block-off UI lives in the calendar tab; admin tabs must be restructured first (U11) |
| U13 Batch Pre-Booking | U12 | Batch mode renders alongside blocked slots in the calendar; blocked-slot indicators must exist first |
| U14 PT Member Management | U11 | Archive filter appears in client list tab (restructured in U11); Today screen may show member names |
| U15 Client List & Detail | U14 | Sort-by-session and archive filter depend on the `active` field and CRUD endpoints from U14 |
| U16 Member Home & InBody Viz | U10 | Home dashboard uses the lighter density styling established in U10 |
| U17 Web Push | U14 | Push subscriptions reference customer_id; archive logic must be stable first. Also last unit = polling still works during development of U10–U16 |

## Execution Order (sequential)

```
U10 ─── U11 ─── U12 ─── U13
                  │
                  └── U14 ─── U15
                                    
U10 ─────────────────────────── U16

U14 ────────────────────────────────── U17
```

**Linearized delivery order:**

1. **U10** — Density & Polish (no dependencies, establishes visual baseline)
2. **U11** — Admin Today Screen (needs U10's density)
3. **U12** — Block Off Slots (needs U11's tab restructure)
4. **U13** — Batch Pre-Booking (needs U12's blocked-slot rendering)
5. **U14** — PT Member Management (needs U11's tab structure)
6. **U15** — Client List & Detail (needs U14's archive + schema)
7. **U16** — Member Home & InBody Viz (needs U10's density; independent of U11–U15)
8. **U17** — Web Push (last — swap polling to push after everything else is stable)

## Notes

- U16 could technically run in parallel with U12–U15 (only depends on U10), but linearizing avoids merge conflicts in shared files and keeps the PT-first priority from Q1.
- U17 is deliberately last so that all features are built and tested with the existing polling mechanism, and the push swap is a clean final step with minimal risk.
- Each unit is independently deployable — the app remains fully functional after each unit ships.

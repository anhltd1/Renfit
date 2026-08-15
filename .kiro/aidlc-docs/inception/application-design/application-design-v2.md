# Application Design (V2) — Consolidated

## Summary

This design adds **11 new frontend components**, **2 new backend services**, **9 new API endpoints**, **2 new MongoDB collections**, and modifies **12 existing components** to deliver the Admin UX & Feature Improvements initiative.

Key architectural decisions:
- **New dedicated `/admin/today` endpoint** for the PT's landing screen (lightweight, single-purpose)
- **Single batch-assign endpoint** for multi-slot booking (atomic, returns per-slot results)
- **Blocked slots as a separate collection** (not fake bookings) — integrated into availability at the service layer, affecting member calendar, admin calendar, and AI Coach consistently
- **Multiple push subscriptions per customer** stored in `PushSubscription` collection — replaces polling entirely
- **Implicit `active` filter** on customer queries (backend defaults to active unless explicitly requesting archived)
- **Density pass on both sides** — admin gets tighter spacing, member side gets a lighter density improvement

## Design Artifacts

| Artifact | Path |
|---|---|
| Components | `components-v2.md` |
| Component Methods | `component-methods-v2.md` |
| Services & Endpoints | `services-v2.md` |
| Dependencies & Data Flow | `component-dependency-v2.md` |

## New Data Models

### BlockedSlot
```
Collection: BlockedSlot
Fields: id, date, hours (int[]|"all"), reason, created_at, created_by
Indexes: date (for range queries), unique id
```

### PushSubscription
```
Collection: PushSubscription
Fields: id, endpoint (unique), keys {p256dh, auth}, customer_id (nullable), is_trainer, created_at
Indexes: unique endpoint, customer_id (for per-customer lookup)
```

### Customer (modified)
```
Add field: active (bool, default true)
Index: existing indexes unchanged; queries add implicit {active: {$ne: false}} filter
```

## Cross-Cutting Concerns

### Blocked Slots Integration
- `booking_service.build_availability()` → exclude blocked slots
- `services/ai/tools.py::get_available_slots` → uses same availability (auto-excluded)
- `list_window_bookings()` → include blocked-slot data for admin calendar rendering
- Admin calendar UI → diagonal-hatch pattern on blocked cells (same as Sunday "Nghỉ")

### Push Notification Integration
- `notification_service.create_notification()` → additionally calls `push_service.send_to_customer()`
- `create_trainer_notification()` → additionally calls `push_service.send_to_trainers()`
- Frontend: remove polling intervals from notification hooks
- Service worker: add `push` event listener → show native OS notification
- Subscription lifecycle: subscribe on login, unsubscribe on logout

### Density Pass
- Admin: `p-3`–`p-4`, `rounded-xl`–`rounded-2xl`, `text-xs`–`text-sm` for secondary info
- Member: lighter reduction (`p-4`–`p-6` where previously `p-6`–`p-8`), keep `rounded-3xl` on cards
- Shared primitives remain unchanged — density applied at the page/section level via Tailwind classes, not primitive modifications

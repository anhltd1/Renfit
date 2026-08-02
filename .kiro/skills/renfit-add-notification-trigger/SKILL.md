---
name: renfit-add-notification-trigger
description: Add a new event-driven notification trigger (customer-facing or trainer-facing) to the Renfit backend, following the existing idempotent insert-in-write-path pattern. Use when asked to notify users about a new event, booking change, or system occurrence.
---

# Add a Notification Trigger (Renfit backend)

Use when asked to make the app "notify" a trainee or trainer about some event. Full design
reference: `backend/docs/notifications.md`. This project is **deliberately poll-based** — do not
introduce WebSockets/SSE/push as part of this skill.

## Decide the target audience
- **Customer-facing** → `Notification` collection, `src/services/notification_service.py`
  (customer-side functions), API in `src/api/notifications.py`.
- **Trainer-facing** → `TrainerNotification` collection, same service file (trainer-side
  functions), API inline in `src/api/admin.py`. Remember: trainer notifications are **broadcast**
  (no `recipient_id` — single shared admin identity), not per-recipient.

## Steps
1. **Pick the type string** — short, snake_case, e.g. `booking_approved`, `inbody_added`. Add it
   to the relevant enum/type in `src/schema/notification.py`.
2. **Find the write path that causes the event** — the existing function in `booking_service.py`,
   `api/admin.py`, or `api/auth.py` where the underlying state change actually happens. Do not
   create a new polling/scan mechanism unless the trigger is genuinely **time-based** (like the
   session reminder) rather than tied to a specific write.
3. **Determine the idempotency key** — `(type, related_id)`. If the same entity could trigger the
   same type twice in its lifecycle (e.g. a booking that's created then later cancelled), suffix
   `related_id` to disambiguate (see notifications.md §8.3's `"{id}:cancelled"` pattern) so the two
   notifications don't collide, while a second occurrence of the *same* event still can't double-fire.
4. **Insert inline, synchronously**, right after the write that causes it — a single
   `insert_one` call via the notification service, passing the recipient id (customer) or nothing
   (trainer, broadcast), type, Vietnamese `title`/`message`, `related_id`, and a `target` string.
5. **Set the `target`** as a `"page:tab"` string (e.g. `dashboard:bookings`, `admin:clients`) that
   the frontend's click handler maps to a navigation + tab switch — not a full URL.
6. **Time-based trigger only**: if the trigger can't be tied to a single write (like "1 hour before
   session start"), follow the existing `notification_scheduler.py` pattern — an `asyncio` loop
   started via `asyncio.create_task` in `main.py`'s startup event, scanning on an interval, checking
   the idempotency key before inserting.
7. **Frontend wiring** (if the trigger needs a new UI surface): add/extend the typed client in
   `frontend/src/lib/api/notifications.ts` (customer) or `lib/api/admin.ts` (trainer), and handle
   the new `type`/`target` combination in `NotificationBell.tsx` or `TrainerNotificationBell.tsx`'s
   click-through routing switch.
8. **Update `backend/docs/notifications.md`** — add the new trigger to the relevant table (§1 or
   §8.1) and the click-through routing table (§4 or §8.4). This project keeps that doc current.
9. **Add a pytest** in `backend/test/test_notifications.py` or `test_booking_notifications.py`
   covering: the trigger fires once, the idempotency key prevents a duplicate, and (if customer-
   facing) it's scoped to the right customer.

## Verification
Run pytest for the affected test file(s) and confirm `import src.main` still succeeds.

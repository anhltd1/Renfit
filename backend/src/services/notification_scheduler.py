"""Background scheduler for time-based session-reminder notifications.

See ``backend/docs/notifications.md`` §3.2. There is no single write to hook
for "1 hour before a session starts" — it's a fact about the clock, not a
mutation — so this runs an ``asyncio`` background task (no new dependency)
that periodically scans for approved bookings starting within the next hour
and creates a reminder notification for each, once.

Idempotency is enforced by the unique ``(type, related_id)`` index on the
``Notification`` collection (see ``schema/mongo.py``) — ``create_notification``
silently no-ops on a duplicate, so running this scan repeatedly is safe.
"""

import asyncio
import logging
from datetime import datetime, timedelta

from src.schema.booking import BookingStatus
from src.services.booking_service import (
    ICT,
    _normalize_time,
    bookings_collection,
    now_ict,
)
from src.services.notification_service import notify_session_reminder

logger = logging.getLogger(__name__)

# How often the scan runs. 60s keeps the reminder close to the 1-hour mark
# without adding meaningful DB load (the query is a small, indexed range scan).
POLL_INTERVAL_SECONDS = 60

# The reminder fires once a booking is this close to starting.
REMINDER_LEAD = timedelta(hours=1)


def scan_and_create_reminders() -> int:
    """Find approved bookings starting within the next hour and notify.

    Returns the number of reminders newly created (0 if none were due or
    all were already notified). Synchronous — safe to call directly in
    tests without an event loop.
    """
    now = now_ict()
    window_end = now + REMINDER_LEAD

    coll = bookings_collection()
    created = 0

    for doc in coll.find({"status": BookingStatus.APPROVED.value}):
        key = _normalize_time(doc.get("time"))
        if not key:
            continue
        try:
            day_part, time_part = key.split("T", 1)
            year, month, day = (int(p) for p in day_part.split("-"))
            hour = int(time_part[:2])
        except (ValueError, IndexError):
            continue

        slot_dt = datetime(year, month, day, hour, tzinfo=ICT)
        if not (now < slot_dt <= window_end):
            continue

        result = notify_session_reminder(
            customer_id=doc.get("customer_id", ""),
            booking_id=doc.get("id", ""),
            time_key=key,
        )
        if result.get("success") and result.get("created"):
            created += 1

    return created


async def run_reminder_scheduler_forever() -> None:
    """Long-running task: scan every ``POLL_INTERVAL_SECONDS``.

    Intended to be started once via ``asyncio.create_task`` from the FastAPI
    lifespan (see ``main.py``) and left running for the life of the process.
    Errors are logged and swallowed per iteration so a transient DB hiccup
    never kills the scheduler.
    """
    while True:
        try:
            await asyncio.to_thread(scan_and_create_reminders)
        except Exception:  # noqa: BLE001 — never let the scheduler die
            logger.exception("Session reminder scan failed")
        await asyncio.sleep(POLL_INTERVAL_SECONDS)

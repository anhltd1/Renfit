"""Blocked-slot operations backed by MongoDB.

PTs can block individual hours or full days. Blocked slots are excluded from
member-facing availability and the AI Coach's slot recommendations.
"""

import uuid
from datetime import datetime, timezone
from typing import Any

from src.db.mongo import blocked_slots_collection, bookings_collection
from src.services.booking_service import slot_hours


def _now_iso() -> str:
    return datetime.now(tz=timezone.utc).isoformat()


def create_blocked_slot(
    *, date: str, hours: list[int] | str, reason: str, trainer_id: str
) -> dict[str, Any]:
    """Create a new blocked slot. `hours` is a list of ints or the string 'all'."""
    slot = {
        "id": str(uuid.uuid4()),
        "date": date.strip(),
        "hours": hours if hours == "all" else sorted(set(hours)),
        "reason": reason.strip(),
        "created_at": _now_iso(),
        "created_by": trainer_id,
    }
    blocked_slots_collection().insert_one(slot)
    slot.pop("_id", None)
    return slot


def list_blocked_slots(*, start_date: str, end_date: str) -> list[dict[str, Any]]:
    """Return all blocked slots within a date range (inclusive)."""
    docs = blocked_slots_collection().find(
        {"date": {"$gte": start_date, "$lte": end_date}},
        {"_id": 0},
    ).sort("date", 1)
    return list(docs)


def delete_blocked_slot(*, slot_id: str) -> dict[str, Any]:
    """Delete a blocked slot by id."""
    result = blocked_slots_collection().delete_one({"id": slot_id})
    if result.deleted_count == 0:
        return {"success": False, "message": "Không tìm thấy slot bị chặn."}
    return {"success": True}


def get_blocked_hours_for_date(date: str) -> set[int]:
    """Return the set of blocked hours for a specific date."""
    blocked: set[int] = set()
    for doc in blocked_slots_collection().find({"date": date}, {"_id": 0, "hours": 1}):
        hours = doc.get("hours")
        if hours == "all":
            blocked.update(slot_hours())
        elif isinstance(hours, list):
            blocked.update(hours)
    return blocked


def is_slot_blocked(date: str, hour: int) -> bool:
    """Check if a specific slot (date + hour) is blocked."""
    return hour in get_blocked_hours_for_date(date)


def get_affected_bookings(*, slot_id: str) -> list[dict[str, Any]]:
    """Return bookings that fall within the blocked slot's range."""
    doc = blocked_slots_collection().find_one({"id": slot_id}, {"_id": 0})
    if not doc:
        return []

    date = doc["date"]
    hours = doc["hours"]
    if hours == "all":
        hours_set = set(slot_hours())
    else:
        hours_set = set(hours)

    # Build time prefixes to match
    affected = []
    for hour in hours_set:
        time_prefix = f"{date}T{hour:02d}:00"
        for booking in bookings_collection().find(
            {"time": time_prefix, "status": {"$in": ["pending", "approved"]}},
            {"_id": 0},
        ):
            affected.append(booking)

    return affected


def cancel_affected_bookings(*, slot_id: str) -> dict[str, Any]:
    """Cancel (reject) all bookings that fall within the blocked slot."""
    bookings = get_affected_bookings(slot_id=slot_id)
    cancelled = 0
    for b in bookings:
        bookings_collection().update_one(
            {"id": b["id"]},
            {"$set": {"status": "rejected"}},
        )
        cancelled += 1
    return {"success": True, "cancelled": cancelled}

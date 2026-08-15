"""Booking operations backed by MongoDB.

Business rules
--------------
* The gym is open 08:00–20:00, in 1-hour slots (08:00 … 19:00), every day
  except Sunday.
* Each hourly slot can hold at most ``CAPACITY`` customers. A slot counts as
  occupied while a booking is ``pending`` or ``approved``; ``rejected`` (and
  cancelled/deleted) bookings free the slot again.
* Only the rolling two-week window is bookable: from Monday of the *current*
  week through Saturday of *next* week (Sundays excluded).
"""

import uuid
from datetime import date, datetime, timedelta, timezone

from src.db.mongo import bookings_collection
from src.schema.booking import Booking, BookingStatus
from src.services.customer_service import find_customer_by_name
from src.services.notification_service import (
    notify_booking_approved,
    notify_booking_cancelled,
    notify_booking_created,
    retract_session_reminder,
)

# ── Timezone ────────────────────────────────────────────────────────────────
ICT = timezone(timedelta(hours=7))   # Asia/Ho_Chi_Minh (UTC+7)


def now_ict() -> datetime:
    """Current datetime in Ho Chi Minh City time."""
    return datetime.now(tz=ICT)


def today_ict() -> date:
    """Current date in Ho Chi Minh City time."""
    return now_ict().date()

# ── Slot / capacity configuration ──────────────────────────────────────────
OPEN_HOUR = 8          # first slot starts at 08:00
CLOSE_HOUR = 20        # gym closes at 20:00 → last slot starts at 19:00
CAPACITY = 4           # max customers per hourly slot
DEFAULT_TRAINER_ID = "admin"
ACTIVE_STATUSES = (BookingStatus.PENDING.value, BookingStatus.APPROVED.value)


def slot_hours() -> list[int]:
    """Bookable start hours, e.g. [8, 9, …, 19]."""
    return list(range(OPEN_HOUR, CLOSE_HOUR))


# ── Two-week window ─────────────────────────────────────────────────────────

def current_week_monday(today: date | None = None) -> date:
    today = today or today_ict()
    return today - timedelta(days=today.weekday())


def window_days(today: date | None = None) -> list[date]:
    """Mon of current week → Sat of next week, excluding Sundays (12 days)."""
    monday = current_week_monday(today or today_ict())
    days: list[date] = []
    for offset in range(0, 13):  # day 0 (Mon this week) … day 12 (Sat next week)
        d = monday + timedelta(days=offset)
        if d.weekday() == 6:  # Sunday — gym closed
            continue
        days.append(d)
    return days


def slot_time_str(d: date, hour: int) -> str:
    """Canonical slot key, e.g. '2026-06-15T08:00'."""
    return f"{d.isoformat()}T{hour:02d}:00"


def _normalize_time(raw: datetime | str | None) -> str:
    """Normalize any stored ``time`` value to 'YYYY-MM-DDTHH:00'."""
    if raw is None:
        return ""
    if isinstance(raw, datetime):
        return f"{raw.date().isoformat()}T{raw.hour:02d}:00"
    text = str(raw).strip().replace(" ", "T")
    # Expect 'YYYY-MM-DDTHH...' → keep date + hour
    if "T" in text and len(text) >= 13:
        day_part, time_part = text.split("T", 1)
        hour = time_part[:2]
        return f"{day_part}T{hour}:00"
    return text


def _parse_slot_key(key: str) -> tuple[date, int] | None:
    try:
        day_part, time_part = key.split("T", 1)
        return date.fromisoformat(day_part), int(time_part[:2])
    except (ValueError, IndexError):
        return None


def is_valid_slot(key: str, today: date | None = None) -> bool:
    parsed = _parse_slot_key(key)
    if parsed is None:
        return False
    d, hour = parsed
    if hour not in slot_hours():
        return False
    return d in window_days(today)


# ── Counting ─────────────────────────────────────────────────────────────────

def active_counts() -> dict[str, int]:
    """Number of active (pending+approved) bookings keyed by slot."""
    counts: dict[str, int] = {}
    cursor = bookings_collection().find({"status": {"$in": list(ACTIVE_STATUSES)}})
    for doc in cursor:
        key = _normalize_time(doc.get("time"))
        if key:
            counts[key] = counts.get(key, 0) + 1
    return counts


def count_active_for_slot(key: str) -> int:
    return active_counts().get(key, 0)


# ── Availability (customer view) ──────────────────────────────────────────────

def build_availability(customer_id: str) -> dict:
    from src.services.blocked_slot_service import get_blocked_hours_for_date

    counts = active_counts()

    my_bookings: dict[str, dict] = {}
    if customer_id:
        for doc in bookings_collection().find({"customer_id": customer_id}):
            key = _normalize_time(doc.get("time"))
            if key:
                my_bookings[key] = {
                    "id": doc.get("id", ""),
                    "status": doc.get("status"),
                }

    now = now_ict()
    weekday_labels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]

    days = []
    for d in window_days():
        blocked_hours = get_blocked_hours_for_date(d.isoformat())
        slots = []
        for hour in slot_hours():
            key = slot_time_str(d, hour)
            count = counts.get(key, 0)
            mine = my_bookings.get(key)
            mine_status = mine["status"] if mine else None
            mine_active = mine_status in ACTIVE_STATUSES
            slot_dt = datetime(d.year, d.month, d.day, hour, tzinfo=ICT)
            past = slot_dt <= now
            full = count >= CAPACITY
            blocked = hour in blocked_hours
            slots.append(
                {
                    "hour": hour,
                    "time": key,
                    "count": count,
                    "remaining": max(0, CAPACITY - count),
                    "full": full,
                    "past": past,
                    "blocked": blocked,
                    "my_status": mine_status,
                    "my_booking_id": mine["id"] if mine else None,
                    # bookable only if not past, not full, not blocked, and not already mine
                    "available": (not past) and (not full) and (not blocked) and (not mine_active),
                }
            )
        days.append(
            {
                "date": d.isoformat(),
                "weekday": d.weekday(),
                "label": weekday_labels[d.weekday()],
                "slots": slots,
            }
        )

    return {"capacity": CAPACITY, "days": days}


# ── Trainer view ───────────────────────────────────────────────────────────

def list_window_bookings() -> dict:
    """All bookings inside the window grouped by day + hour (trainer view)."""
    from src.services.blocked_slot_service import get_blocked_hours_for_date

    valid_keys = {
        slot_time_str(d, h) for d in window_days() for h in slot_hours()
    }

    grouped: dict[str, list[dict]] = {}
    for doc in bookings_collection().find({}):
        key = _normalize_time(doc.get("time"))
        if key not in valid_keys:
            continue
        grouped.setdefault(key, []).append(
            {
                "id": doc.get("id", ""),
                "customer_id": doc.get("customer_id", ""),
                "status": doc.get("status", BookingStatus.PENDING.value),
                "note": doc.get("note", ""),
            }
        )

    weekday_labels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]
    days = []
    for d in window_days():
        blocked_hours = get_blocked_hours_for_date(d.isoformat())
        slots = []
        for hour in slot_hours():
            key = slot_time_str(d, hour)
            slots.append(
                {
                    "hour": hour,
                    "time": key,
                    "bookings": grouped.get(key, []),
                    "blocked": hour in blocked_hours,
                }
            )
        days.append(
            {
                "date": d.isoformat(),
                "weekday": d.weekday(),
                "label": weekday_labels[d.weekday()],
                "slots": slots,
            }
        )

    return {"capacity": CAPACITY, "days": days}


# ── Mutations ────────────────────────────────────────────────────────────────

def admin_assign_booking(
    *,
    customer_id: str,
    time: str,
    trainer_id: str = DEFAULT_TRAINER_ID,
    note: str = "",
) -> dict:
    """Admin-initiated booking: always approved, bypasses capacity limit."""
    name = customer_id.strip()
    key = _normalize_time(time)

    if not name:
        return {"success": False, "message": "customer_id is required"}
    if find_customer_by_name(name) is None:
        return {"success": False, "message": "Không tìm thấy tài khoản hội viên."}
    if not is_valid_slot(key):
        return {"success": False, "message": "Khung giờ không hợp lệ hoặc nằm ngoài lịch."}

    coll = bookings_collection()

    # Re-activate or update an existing booking for this customer + slot.
    existing = coll.find_one({"customer_id": name, "time": key})
    if existing is not None:
        coll.update_one(
            {"_id": existing["_id"]},
            {"$set": {
                "status": BookingStatus.APPROVED.value,
                "trainer_id": trainer_id.strip() or DEFAULT_TRAINER_ID,
                "note": note.strip(),
            }},
        )
        booking_id = existing.get("id", "")
    else:
        booking = Booking(
            id=str(uuid.uuid4()),
            customer_id=name,
            trainer_id=trainer_id.strip() or DEFAULT_TRAINER_ID,
            time=key,
            status=BookingStatus.APPROVED,
            note=note.strip(),
        )
        payload = booking.model_dump()
        payload["status"] = BookingStatus.APPROVED.value
        coll.insert_one(payload)
        booking_id = booking.id

    # A trainer directly assigning a slot is equivalent to approving it —
    # notify the customer the same way (see docs/notifications.md §3.1).
    notify_booking_approved(customer_id=name, booking_id=booking_id, time_key=key)

    return {
        "success": True,
        "booking_id": booking_id,
        "time": key,
        "status": BookingStatus.APPROVED.value,
        "message": "Đã đặt lịch tập thành công.",
    }


def create_customer_booking(
    *,
    customer_id: str,
    time: str,
    trainer_id: str = DEFAULT_TRAINER_ID,
    note: str = "",
) -> dict:
    name = customer_id.strip()
    key = _normalize_time(time)

    if not name:
        return {"success": False, "message": "customer_id is required"}
    if find_customer_by_name(name) is None:
        return {"success": False, "message": "Không tìm thấy tài khoản hội viên."}
    if not is_valid_slot(key):
        return {"success": False, "message": "Khung giờ không hợp lệ hoặc nằm ngoài lịch."}

    parsed = _parse_slot_key(key)
    if parsed is not None:
        d, hour = parsed
        if datetime(d.year, d.month, d.day, hour, tzinfo=ICT) <= now_ict():
            return {"success": False, "message": "Không thể đặt khung giờ đã qua."}

    coll = bookings_collection()

    # Existing booking by this customer for the same slot?
    existing = coll.find_one({"customer_id": name, "time": key})
    if existing is not None and existing.get("status") in ACTIVE_STATUSES:
        return {"success": False, "message": "Bạn đã đặt khung giờ này rồi."}

    if count_active_for_slot(key) >= CAPACITY:
        return {"success": False, "message": "Khung giờ này đã đầy."}

    # Re-activate a previously rejected booking instead of duplicating it.
    if existing is not None:
        coll.update_one(
            {"_id": existing["_id"]},
            {"$set": {
                "status": BookingStatus.PENDING.value,
                "trainer_id": trainer_id,
            }},
        )
        booking_id = existing.get("id", "")
    else:
        booking = Booking(
            id=str(uuid.uuid4()),
            customer_id=name,
            trainer_id=trainer_id.strip() or DEFAULT_TRAINER_ID,
            time=key,
            status=BookingStatus.PENDING,
            note=note.strip(),
        )
        payload = booking.model_dump()
        payload["status"] = BookingStatus.PENDING.value
        coll.insert_one(payload)
        booking_id = booking.id

    # Let trainers know a trainee just booked/re-booked a slot that needs
    # review (docs/notifications.md §1 — trainer triggers).
    notify_booking_created(customer_id=name, booking_id=booking_id, time_key=key)

    return {
        "success": True,
        "booking_id": booking_id,
        "time": key,
        "status": BookingStatus.PENDING.value,
        "message": "Đặt lịch thành công, vui lòng chờ HLV xác nhận.",
    }


def build_ai_availability(customer_id: str, date_filter: str | None = None) -> dict:
    """Compact availability view for the AI coach tool / booking artifact.

    To keep replies short, this does NOT dump the full two-week grid:

    * If ``date_filter`` (``YYYY-MM-DD``) is given, only that day's open
      hours are returned (if it falls inside the bookable window).
    * Otherwise it defaults to **today + tomorrow** only.

    Also returns the customer's own upcoming bookings (status + id, needed
    to cancel) and echoes back ``requested_date``/``date_in_range`` so the
    frontend can re-request the same filter after a book/cancel action.
    """
    counts = active_counts()
    name = customer_id.strip()

    my_bookings: list[dict] = []
    if name:
        for doc in bookings_collection().find({"customer_id": name}):
            key = _normalize_time(doc.get("time"))
            if key and doc.get("status") in ACTIVE_STATUSES:
                my_bookings.append(
                    {
                        "booking_id": doc.get("id", ""),
                        "time": key,
                        "status": doc.get("status"),
                    }
                )
    my_bookings.sort(key=lambda b: b["time"])
    my_times = {b["time"] for b in my_bookings}

    now = now_ict()
    today = today_ict()
    weekday_labels = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"]
    all_window_days = window_days()

    requested_date = (date_filter or "").strip() or None
    date_in_range = True
    if requested_date:
        try:
            target = date.fromisoformat(requested_date)
        except ValueError:
            target = None
        date_in_range = target is not None and target in all_window_days
        target_days = [d for d in all_window_days if d == target] if date_in_range else []
    else:
        target_days = [d for d in all_window_days if d in (today, today + timedelta(days=1))]

    days = []
    for d in target_days:
        open_hours = []
        for hour in slot_hours():
            key = slot_time_str(d, hour)
            slot_dt = datetime(d.year, d.month, d.day, hour, tzinfo=ICT)
            if slot_dt <= now:
                continue
            if key in my_times:
                continue
            if counts.get(key, 0) >= CAPACITY:
                continue
            open_hours.append(f"{hour:02d}:00")
        if open_hours:
            days.append(
                {
                    "date": d.isoformat(),
                    "weekday": weekday_labels[d.weekday()],
                    "open_hours": open_hours,
                }
            )

    return {
        "success": True,
        "today": today.isoformat(),
        "window_start": all_window_days[0].isoformat(),
        "window_end": all_window_days[-1].isoformat(),
        "requested_date": requested_date,
        "date_in_range": date_in_range,
        "days_with_open_slots": days,
        "my_upcoming_bookings": my_bookings,
    }


def cancel_customer_booking(*, customer_id: str, booking_id: str) -> dict:
    name = customer_id.strip()
    coll = bookings_collection()
    doc = coll.find_one({"id": booking_id, "customer_id": name})
    if doc is None:
        return {"success": False, "message": "Không tìm thấy lịch đặt."}
    coll.delete_one({"_id": doc["_id"]})
    # A cancelled slot should never remind (docs/notifications.md §3.2).
    retract_session_reminder(booking_id=booking_id)
    # Let trainers know this slot opened back up (docs/notifications.md §1).
    notify_booking_cancelled(
        customer_id=name,
        booking_id=booking_id,
        time_key=_normalize_time(doc.get("time")),
    )
    return {"success": True, "message": "Đã hủy lịch đặt."}


def set_booking_status(*, booking_id: str, status: str) -> dict:
    try:
        new_status = BookingStatus(status.strip().lower())
    except ValueError:
        return {"success": False, "message": "Trạng thái không hợp lệ."}

    coll = bookings_collection()
    doc = coll.find_one({"id": booking_id})
    if doc is None:
        return {"success": False, "message": "Không tìm thấy lịch đặt."}

    previous_status = doc.get("status")

    # Guard capacity when (re)activating a booking.
    if new_status in (BookingStatus.PENDING, BookingStatus.APPROVED):
        key = _normalize_time(doc.get("time"))
        active_others = sum(
            1
            for d in coll.find({"time": doc.get("time"), "status": {"$in": list(ACTIVE_STATUSES)}})
            if d.get("id") != booking_id
        )
        if active_others >= CAPACITY:
            return {"success": False, "message": "Khung giờ này đã đầy."}
        _ = key

    coll.update_one({"_id": doc["_id"]}, {"$set": {"status": new_status.value}})

    if (
        new_status == BookingStatus.APPROVED
        and previous_status != BookingStatus.APPROVED.value
    ):
        # pending -> approved (docs/notifications.md §3.1).
        notify_booking_approved(
            customer_id=doc.get("customer_id", ""),
            booking_id=booking_id,
            time_key=_normalize_time(doc.get("time")),
        )
    elif (
        previous_status == BookingStatus.APPROVED.value
        and new_status != BookingStatus.APPROVED
    ):
        # No longer approved (e.g. reset to pending/rejected) — an unfired
        # reminder for this slot is now stale.
        retract_session_reminder(booking_id=booking_id)

    return {
        "success": True,
        "booking_id": booking_id,
        "status": new_status.value,
        "message": "Đã cập nhật trạng thái.",
    }




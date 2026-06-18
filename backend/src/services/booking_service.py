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
from datetime import date, datetime, timedelta

from src.config.settings import Settings
from src.constants import MVP_DEFAULT_TRAINER_LABEL
from src.db.mongo import bookings_collection
from src.schema.booking import Booking, BookingStatus
from src.services.customer_service import find_customer_by_name

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
    today = today or date.today()
    return today - timedelta(days=today.weekday())


def window_days(today: date | None = None) -> list[date]:
    """Mon of current week → Sat of next week, excluding Sundays (12 days)."""
    monday = current_week_monday(today)
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
    counts = active_counts()

    my_bookings: dict[str, dict] = {}
    if customer_id:
        for doc in bookings_collection().find({"customer_id": customer_id}):
            key = _normalize_time(doc.get("time"))
            if key:
                my_bookings[key] = {"id": doc.get("id", ""), "status": doc.get("status")}

    now = datetime.now()
    weekday_labels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]

    days = []
    for d in window_days():
        slots = []
        for hour in slot_hours():
            key = slot_time_str(d, hour)
            count = counts.get(key, 0)
            mine = my_bookings.get(key)
            mine_status = mine["status"] if mine else None
            mine_active = mine_status in ACTIVE_STATUSES
            past = datetime(d.year, d.month, d.day, hour) <= now
            full = count >= CAPACITY
            slots.append(
                {
                    "hour": hour,
                    "time": key,
                    "count": count,
                    "remaining": max(0, CAPACITY - count),
                    "full": full,
                    "past": past,
                    "my_status": mine_status,
                    "my_booking_id": mine["id"] if mine else None,
                    # bookable only if not past, not full and not already mine
                    "available": (not past) and (not full) and (not mine_active),
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
        slots = []
        for hour in slot_hours():
            key = slot_time_str(d, hour)
            slots.append(
                {
                    "hour": hour,
                    "time": key,
                    "bookings": grouped.get(key, []),
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
        if datetime(d.year, d.month, d.day, hour) <= datetime.now():
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
            {"$set": {"status": BookingStatus.PENDING.value, "trainer_id": trainer_id}},
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

    return {
        "success": True,
        "booking_id": booking_id,
        "time": key,
        "status": BookingStatus.PENDING.value,
        "message": "Đặt lịch thành công, vui lòng chờ HLV xác nhận.",
    }


def cancel_customer_booking(*, customer_id: str, booking_id: str) -> dict:
    name = customer_id.strip()
    coll = bookings_collection()
    doc = coll.find_one({"id": booking_id, "customer_id": name})
    if doc is None:
        return {"success": False, "message": "Không tìm thấy lịch đặt."}
    coll.delete_one({"_id": doc["_id"]})
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
    return {
        "success": True,
        "booking_id": booking_id,
        "status": new_status.value,
        "message": "Đã cập nhật trạng thái.",
    }


# ── AI-chat compatibility (legacy upsert used by the coach agent) ─────────────

def _combine_time(date_str: str, time_str: str) -> str:
    d, t = date_str.strip(), time_str.strip()
    if d and t:
        return f"{d}T{t}" if "T" not in t else f"{d} {t}"
    return d or t


def _parse_status(status: str) -> BookingStatus:
    raw = status.strip().lower() or "pending"
    legacy = {
        "confirmed": BookingStatus.APPROVED,
        "accepted": BookingStatus.APPROVED,
        "cancelled": BookingStatus.REJECTED,
        "no_show": BookingStatus.REJECTED,
    }
    if raw in legacy:
        return legacy[raw]
    try:
        return BookingStatus(raw)
    except ValueError:
        return BookingStatus.PENDING


def upsert_booking(
    *,
    customer_name: str,
    trainer: str,
    date: str,
    time: str,
    status: str = "pending",
    note: str = "",
    settings: Settings | None = None,
) -> dict:
    """Legacy create/update used by the AI coach tools."""
    name = customer_name.strip()
    if not name:
        return {"success": False, "message": "customer_name is required"}

    _ = settings
    if find_customer_by_name(name) is None:
        return {
            "success": False,
            "requires_customer_info": True,
            "message": "Customer information must be saved before booking",
        }

    if not date.strip() or not time.strip():
        return {
            "success": False,
            "requires_booking_info": True,
            "message": "date and time are required",
        }

    trainer_id = trainer.strip() or MVP_DEFAULT_TRAINER_LABEL
    slot_key = _normalize_time(_combine_time(date, time))
    booking_status = _parse_status(status)
    coll = bookings_collection()

    existing = coll.find_one({"customer_id": name, "time": slot_key})
    booking = Booking(
        id=(existing.get("id") if existing else None) or str(uuid.uuid4()),
        customer_id=name,
        trainer_id=trainer_id,
        time=slot_key,
        status=booking_status,
        note=note.strip(),
    )
    payload = booking.model_dump()
    payload["status"] = booking_status.value

    if existing is not None:
        coll.replace_one({"_id": existing["_id"]}, payload)
        created = False
    else:
        coll.insert_one(payload)
        created = True

    return {
        "success": True,
        "upserted": True,
        "created": created,
        "updated": not created,
        "message": "Booking created successfully" if created else "Booking updated successfully",
        "customer_name": name,
        "date": date.strip(),
        "time": time.strip(),
    }


def create_booking(
    *,
    customer_name: str,
    trainer: str,
    date: str,
    time: str,
    status: str = "pending",
    note: str = "",
    settings: Settings | None = None,
) -> dict:
    return upsert_booking(
        customer_name=customer_name,
        trainer=trainer,
        date=date,
        time=time,
        status=status,
        note=note,
        settings=settings,
    )

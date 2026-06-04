"""Booking operations backed by MongoDB."""

from src.config.settings import Settings, get_settings
from src.constants import MVP_DEFAULT_TRAINER_LABEL
from src.db.mongo import bookings_collection
from src.schema.booking import Booking, BookingStatus
from src.services.customer_service import find_customer_by_name


def _combine_time(date: str, time: str) -> str:
    d, t = date.strip(), time.strip()
    if d and t:
        return f"{d}T{t}" if "T" not in t else f"{d} {t}"
    return d or t


def _parse_status(status: str) -> BookingStatus:
    raw = status.strip().lower() or "pending"
    legacy = {
        "confirmed": BookingStatus.APPROVED,
        "cancelled": BookingStatus.REJECTED,
        "no_show": BookingStatus.REJECTED,
    }
    if raw in legacy:
        return legacy[raw]
    try:
        return BookingStatus(raw)
    except ValueError:
        return BookingStatus.PENDING


def _find_booking(customer_id: str, trainer_id: str) -> dict | None:
    return bookings_collection().find_one(
        {"customer_id": customer_id, "trainer_id": trainer_id}
    )


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

    customer_id = name
    trainer_id = trainer.strip() or MVP_DEFAULT_TRAINER_LABEL
    slot_time = _combine_time(date, time)
    booking_status = _parse_status(status)
    coll = bookings_collection()

    existing_doc = _find_booking(customer_id, trainer_id)
    booking = Booking(
        customer_id=customer_id,
        trainer_id=trainer_id,
        time=slot_time,
        status=booking_status,
        note=note.strip(),
    )
    payload = booking.model_dump()
    payload["status"] = booking_status.value

    if existing_doc is not None:
        coll.replace_one(
            {"_id": existing_doc["_id"]},
            payload,
        )
        return {
            "success": True,
            "upserted": True,
            "created": False,
            "updated": True,
            "message": "Booking updated successfully",
            "customer_name": customer_id,
            "date": date.strip(),
            "time": time.strip(),
        }

    coll.insert_one(payload)
    return {
        "success": True,
        "upserted": True,
        "created": True,
        "updated": False,
        "message": "Booking created successfully",
        "customer_name": customer_id,
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

"""Booking operations backed by Google Sheets."""

from src.config.settings import Settings, get_settings
from src.constants import MVP_DEFAULT_TRAINER_LABEL
from src.models.booking import Booking, BookingStatus
from src.services.customer_service import _normalize_name, find_customer_by_name
from src.services.sheets.bookings import get_bookings_repository


def _normalize_slot(date: str, time: str) -> tuple[str, str]:
    return date.strip(), time.strip()


def find_booking_by_customer_name(
    customer_name: str,
    settings: Settings | None = None,
) -> Booking | None:
    """First booking row matching customer name (case-insensitive)."""
    settings = settings or get_settings()
    target = _normalize_name(customer_name)
    if not target:
        return None
    repo = get_bookings_repository(settings)
    for booking in repo.list_all():
        if _normalize_name(booking.customer_name) == target:
            return booking
    return None


def _find_booking_row_index(
    customer_name: str,
    date: str,
    time: str,
    settings: Settings,
) -> int | None:
    repo = get_bookings_repository(settings)
    target_name = _normalize_name(customer_name)
    slot_date, slot_time = _normalize_slot(date, time)

    def matches(record: Booking) -> bool:
        return (
            _normalize_name(record.customer_name) == target_name
            and record.date.strip() == slot_date
            and record.time.strip() == slot_time
        )

    return repo.find_row_index(matches)


def _find_booking_row_by_name_only(
    customer_name: str,
    settings: Settings,
) -> int | None:
    repo = get_bookings_repository(settings)
    target_name = _normalize_name(customer_name)

    def matches(record: Booking) -> bool:
        return _normalize_name(record.customer_name) == target_name

    return repo.find_row_index(matches)


def _merge_booking(
    existing: Booking | None,
    *,
    customer_name: str,
    trainer: str,
    date: str,
    time: str,
    status: BookingStatus,
    note: str,
) -> Booking:
    base = existing or Booking(
        customer_name=customer_name,
        trainer=trainer,
        date=date,
        time=time,
        status=status,
        note=note,
    )
    trainer_name = trainer.strip() or (
        base.trainer.strip() or MVP_DEFAULT_TRAINER_LABEL
    )
    return Booking(
        customer_name=customer_name,
        trainer=trainer_name,
        date=date.strip() or base.date,
        time=time.strip() or base.time,
        status=status,
        note=note.strip() if note.strip() else base.note,
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
    """
    Create or update booking by customer name.
    If date+time match an existing row for that name → update that row.
    Else if any row exists for that name → update the first match.
    Else append a new row (customer must exist in Customers sheet).
    """
    name = customer_name.strip()
    if not name:
        return {"success": False, "message": "customer_name is required"}

    settings = settings or get_settings()
    customer = find_customer_by_name(name, settings)
    if customer is None:
        return {
            "success": False,
            "requires_customer_info": True,
            "message": "Customer information must be saved before booking",
        }

    try:
        booking_status = BookingStatus(status.strip().lower() or "pending")
    except ValueError:
        booking_status = BookingStatus.PENDING

    if not date.strip() or not time.strip():
        return {
            "success": False,
            "requires_booking_info": True,
            "message": "date and time are required",
        }

    trainer_name = trainer.strip() or MVP_DEFAULT_TRAINER_LABEL
    repo = get_bookings_repository(settings)

    row_index = _find_booking_row_index(name, date, time, settings)
    if row_index is None:
        row_index = _find_booking_row_by_name_only(name, settings)

    existing: Booking | None = None
    if row_index is not None:
        data_index = row_index - 2
        all_bookings = repo.list_all()
        if 0 <= data_index < len(all_bookings):
            existing = all_bookings[data_index]

    booking = _merge_booking(
        existing,
        customer_name=name,
        trainer=trainer_name,
        date=date,
        time=time,
        status=booking_status,
        note=note,
    )

    if row_index is not None:
        repo.update_row(row_index, booking)
        return {
            "success": True,
            "upserted": True,
            "created": False,
            "updated": True,
            "message": "Booking updated successfully",
            "customer_name": name,
            "date": booking.date,
            "time": booking.time,
        }

    repo.append(booking)
    return {
        "success": True,
        "upserted": True,
        "created": True,
        "updated": False,
        "message": "Booking created successfully",
        "customer_name": name,
        "date": booking.date,
        "time": booking.time,
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
    """Alias for upsert_booking."""
    return upsert_booking(
        customer_name=customer_name,
        trainer=trainer,
        date=date,
        time=time,
        status=status,
        note=note,
        settings=settings,
    )

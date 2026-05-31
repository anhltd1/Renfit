"""Integration tests: read/write Bookings Google Sheet."""

from src.models.booking import Booking, BookingStatus
from src.services.sheets.bookings import get_bookings_repository


def test_bookings_read_sheet(settings):
    repo = get_bookings_repository(settings)
    bookings = repo.list_all()
    assert isinstance(bookings, list)


def test_bookings_write_and_delete(settings, test_run_id):
    repo = get_bookings_repository(settings)

    customer_name = f"Test Booking {test_run_id}"
    booking = Booking(
        customer_name=customer_name,
        trainer="Test Trainer",
        date="2026-06-01",
        time="09:00",
        status=BookingStatus.PENDING,
        note="pytest auto cleanup",
    )

    row_index = repo.append(booking)
    assert row_index >= 2

    found_index = repo.find_row_index(lambda b: b.customer_name == customer_name)
    assert found_index == row_index

    rows = repo.list_all()
    match = next(b for b in rows if b.customer_name == customer_name)
    assert match.status == BookingStatus.PENDING
    assert match.trainer == "Test Trainer"

    repo.delete_row(row_index)

    assert repo.find_row_index(lambda b: b.customer_name == customer_name) is None

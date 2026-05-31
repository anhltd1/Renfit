from src.config.settings import Settings
from src.models.booking import Booking
from src.services.sheets.client import SheetsClient
from src.services.sheets.repository import SheetRepository

BOOKING_FIELDS = [
    "customer_name",
    "trainer",
    "date",
    "time",
    "status",
    "note",
]


def get_bookings_repository(settings: Settings) -> SheetRepository[Booking]:
    client = SheetsClient(
        settings,
        settings.google_bookings_sheet_url,
        settings.google_bookings_sheet_tab,
    )
    return SheetRepository(client, BOOKING_FIELDS, Booking)

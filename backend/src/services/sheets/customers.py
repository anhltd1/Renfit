from src.config.settings import Settings
from src.models.customer import Customer
from src.services.sheets.client import SheetsClient
from src.services.sheets.repository import SheetRepository

CUSTOMER_FIELDS = [
    "customer_name",
    "phone",
    "goal",
    "trainer",
    "health_note",
    "note",
    "height",
    "weight",
]


def get_customers_repository(settings: Settings) -> SheetRepository[Customer]:
    client = SheetsClient(
        settings,
        settings.google_customers_sheet_url,
        settings.google_customers_sheet_tab,
    )
    return SheetRepository(client, CUSTOMER_FIELDS, Customer)

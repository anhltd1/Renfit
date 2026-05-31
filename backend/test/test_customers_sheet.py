"""Integration tests: read/write Customers Google Sheet."""

from src.models.customer import Customer
from src.services.sheets.customers import get_customers_repository


def test_customers_read_sheet(settings):
    repo = get_customers_repository(settings)
    customers = repo.list_all()
    assert isinstance(customers, list)


def test_customers_write_and_delete(settings, test_run_id):
    repo = get_customers_repository(settings)

    phone = f"TEST_{test_run_id}"
    customer = Customer(
        customer_name=f"Test User {test_run_id}",
        phone=phone,
        goal="weight loss",
        trainer="Test Trainer",
        health_note="none",
        note="pytest auto cleanup",
    )

    row_index = repo.append(customer)
    assert row_index >= 2

    found_index = repo.find_row_index(lambda c: c.phone == phone)
    assert found_index == row_index

    rows = repo.list_all()
    assert any(c.phone == phone for c in rows)

    repo.delete_row(row_index)

    assert repo.find_row_index(lambda c: c.phone == phone) is None

"""Unit tests for customer/booking business rules (mocked sheets)."""

from unittest.mock import MagicMock, patch

import pytest

from src.models.customer import Customer
from src.services.ai.tools import execute_tool
from src.services.booking_service import create_booking, upsert_booking
from src.models.booking import Booking
from src.services.customer_service import (
    find_customer_by_name,
    save_customer_info,
    update_customer_info,
    upsert_customer_info,
)


def test_request_booking_intake_tool():
    result = execute_tool("request_booking_intake", {"reason": "missing_info"})
    assert result["success"] is True
    assert result["show_form"] is True
    assert result["form"] == "intake"


def test_upsert_customer_info_tool():
    with patch(
        "src.services.ai.tools.upsert_customer_info",
        return_value={"success": True, "upserted": True},
    ) as mock_upsert:
        result = execute_tool(
            "upsert_customer_info",
            {"customer_name": "A", "phone": "1", "goal": "muscle"},
        )
        assert result["success"] is True
        mock_upsert.assert_called_once()


def test_request_customer_profile_tool():
    result = execute_tool(
        "request_customer_profile", {"customer_name": "Nguyen Van A"}
    )
    assert result["success"] is True
    assert result["form"] == "customer_profile"
    assert result["customer_name"] == "Nguyen Van A"


@pytest.fixture
def mock_settings():
    return MagicMock(sheets_configured=True)


@patch("src.services.customer_service.get_customers_repository")
def test_save_customer_info_requires_fields(mock_repo, mock_settings):
    result = save_customer_info(
        customer_name="",
        phone="0901234567",
        settings=mock_settings,
    )
    assert result["success"] is False
    mock_repo.assert_not_called()


@patch("src.services.customer_service.get_customers_repository")
def test_save_customer_info_success(mock_repo, mock_settings):
    repo = MagicMock()
    mock_repo.return_value = repo

    result = save_customer_info(
        customer_name="Nguyen Van A",
        phone="0901234567",
        goal="weight loss",
        settings=mock_settings,
    )

    assert result["success"] is True
    repo.append.assert_called_once()
    saved = repo.append.call_args[0][0]
    assert saved.customer_name == "Nguyen Van A"
    assert saved.phone == "0901234567"


@patch("src.services.customer_service.get_customers_repository")
def test_save_customer_info_upserts_existing(mock_repo, mock_settings):
    repo = MagicMock()
    mock_repo.return_value = repo
    existing = Customer(
        customer_name="Nguyen Van A",
        phone="0901111111",
        goal="",
    )
    repo.list_all.return_value = [existing]
    repo.find_row_index.return_value = 2

    result = save_customer_info(
        customer_name="Nguyen Van A",
        phone="0902222222",
        settings=mock_settings,
    )

    assert result["success"] is True
    assert result.get("updated") is True
    repo.append.assert_not_called()
    repo.update_row.assert_called_once()


@patch("src.services.customer_service.get_customers_repository")
def test_update_customer_info_by_name(mock_repo, mock_settings):
    repo = MagicMock()
    mock_repo.return_value = repo
    existing = Customer(
        customer_name="Nguyen Van A",
        phone="0901234567",
        goal="",
        height="",
        weight="",
    )
    repo.list_all.return_value = [existing]
    repo.find_row_index.return_value = 2

    result = update_customer_info(
        customer_name="Nguyen Van A",
        height="170",
        weight="65",
        goal="muscle gain",
        settings=mock_settings,
    )

    assert result["success"] is True
    updated = repo.update_row.call_args[0][1]
    assert updated.height == "170"
    assert updated.weight == "65"
    assert updated.goal == "muscle gain"


@patch("src.services.customer_service.get_customers_repository")
def test_update_customer_creates_when_missing_with_phone(mock_repo, mock_settings):
    repo = MagicMock()
    mock_repo.return_value = repo
    repo.list_all.return_value = []

    result = update_customer_info(
        customer_name="New User",
        phone="0909999999",
        goal="weight loss",
        settings=mock_settings,
    )

    assert result["success"] is True
    assert result.get("created") is True
    repo.append.assert_called_once()


@patch("src.services.booking_service.get_bookings_repository")
@patch("src.services.booking_service.find_customer_by_name")
def test_upsert_booking_updates_existing_by_name(
    mock_find, mock_bookings_repo, mock_settings
):
    mock_find.return_value = Customer(
        customer_name="Nguyen Van A",
        phone="0901234567",
        goal="",
    )
    repo = MagicMock()
    mock_bookings_repo.return_value = repo
    existing = Booking(
        customer_name="Nguyen Van A",
        trainer="Old",
        date="2026-06-01",
        time="19:00",
        status="pending",
        note="",
    )
    repo.list_all.return_value = [existing]
    repo.find_row_index.return_value = 2

    result = upsert_booking(
        customer_name="Nguyen Van A",
        trainer="",
        date="2026-06-01",
        time="19:00",
        note="Updated note",
        settings=mock_settings,
    )

    assert result["success"] is True
    assert result.get("updated") is True
    repo.append.assert_not_called()
    repo.update_row.assert_called_once()


@patch("src.services.booking_service.get_bookings_repository")
@patch("src.services.booking_service.find_customer_by_name")
def test_create_booking_requires_existing_customer(
    mock_find, mock_bookings_repo, mock_settings
):
    mock_find.return_value = None

    result = create_booking(
        customer_name="Unknown User",
        trainer="PT Huy",
        date="2026-06-01",
        time="19:00",
        settings=mock_settings,
    )

    assert result["success"] is False
    assert result["requires_customer_info"] is True
    mock_bookings_repo.assert_not_called()


@patch("src.services.booking_service.get_bookings_repository")
@patch("src.services.booking_service.find_customer_by_name")
def test_create_booking_success(mock_find, mock_bookings_repo, mock_settings):
    mock_find.return_value = Customer(
        customer_name="Nguyen Van A",
        phone="0901234567",
        goal="muscle gain",
    )
    repo = MagicMock()
    mock_bookings_repo.return_value = repo
    repo.list_all.return_value = []
    repo.find_row_index.return_value = None

    result = create_booking(
        customer_name="Nguyen Van A",
        trainer="PT Huy",
        date="2026-06-01",
        time="19:00",
        settings=mock_settings,
    )

    assert result["success"] is True
    assert result.get("created") is True
    repo.append.assert_called_once()
    booking = repo.append.call_args[0][0]
    assert booking.status.value == "pending"


@patch("src.services.booking_service.get_bookings_repository")
@patch("src.services.booking_service.find_customer_by_name")
def test_create_booking_without_trainer_uses_default(
    mock_find, mock_bookings_repo, mock_settings
):
    mock_find.return_value = Customer(
        customer_name="Nguyen Van A",
        phone="0901234567",
        goal="",
    )
    repo = MagicMock()
    mock_bookings_repo.return_value = repo
    repo.list_all.return_value = []
    repo.find_row_index.return_value = None

    result = create_booking(
        customer_name="Nguyen Van A",
        trainer="",
        date="2026-06-01",
        time="19:00",
        settings=mock_settings,
    )

    assert result["success"] is True
    booking = repo.append.call_args[0][0]
    assert booking.trainer == "Chưa chỉ định"


@patch("src.services.customer_service.get_customers_repository")
def test_find_customer_by_name(mock_repo, mock_settings):
    mock_repo.return_value.list_all.return_value = [
        Customer(customer_name="  Nguyen Van A ", phone="1", goal=""),
        Customer(customer_name="Other", phone="2", goal=""),
    ]

    found = find_customer_by_name("nguyen van a", mock_settings)
    assert found is not None
    assert found.phone == "1"

"""Unit tests for customer/booking business rules (mocked MongoDB)."""

from unittest.mock import MagicMock, patch

import pytest

from src.schema.booking import BookingStatus
from src.schema.customer import Customer
from src.services.ai.tools import execute_tool
from src.services.booking_service import create_booking, upsert_booking
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


@pytest.fixture
def mock_settings():
    return MagicMock()


@patch("src.services.customer_service.customers_collection")
def test_save_customer_info_requires_fields(mock_coll, mock_settings):
    result = save_customer_info(
        customer_name="",
        phone="0901234567",
        settings=mock_settings,
    )
    assert result["success"] is False
    mock_coll.assert_not_called()


@patch("src.services.customer_service.customers_collection")
def test_save_customer_info_success(mock_coll, mock_settings):
    coll = MagicMock()
    mock_coll.return_value = coll
    coll.find_one.return_value = None

    result = save_customer_info(
        customer_name="Nguyen Van A",
        phone="0901234567",
        goal="weight loss",
        settings=mock_settings,
    )

    assert result["success"] is True
    coll.insert_one.assert_called_once()
    saved = coll.insert_one.call_args[0][0]
    assert saved["id"] == "Nguyen Van A"
    assert saved["phone_number"] == "0901234567"


@patch("src.services.customer_service.customers_collection")
def test_save_customer_info_upserts_existing(mock_coll, mock_settings):
    coll = MagicMock()
    mock_coll.return_value = coll
    existing = Customer(
        id="Nguyen Van A",
        phone_number="0901111111",
        health_note="",
        goal="",
        address="",
        password="",
    )
    coll.find_one.return_value = {**existing.model_dump(), "_id": "oid1"}

    result = save_customer_info(
        customer_name="Nguyen Van A",
        phone="0902222222",
        settings=mock_settings,
    )

    assert result["success"] is True
    assert result.get("updated") is True
    coll.insert_one.assert_not_called()
    coll.replace_one.assert_called_once()


@patch("src.services.customer_service.customers_collection")
def test_update_customer_info_by_name(mock_coll, mock_settings):
    coll = MagicMock()
    mock_coll.return_value = coll
    existing = Customer(
        id="Nguyen Van A",
        phone_number="0901234567",
        health_note="",
        goal="",
        address="",
        password="",
        height="",
        weight="",
    )
    coll.find_one.return_value = {**existing.model_dump(), "_id": "oid1"}

    result = update_customer_info(
        customer_name="Nguyen Van A",
        height="170",
        weight="65",
        goal="muscle gain",
        settings=mock_settings,
    )

    assert result["success"] is True
    updated = coll.replace_one.call_args[0][1]
    assert updated["height"] == "170"
    assert updated["weight"] == "65"
    assert updated["goal"] == "muscle gain"


@patch("src.services.customer_service.customers_collection")
def test_update_customer_creates_when_missing_with_phone(mock_coll, mock_settings):
    coll = MagicMock()
    mock_coll.return_value = coll
    coll.find_one.return_value = None

    result = update_customer_info(
        customer_name="New User",
        phone="0909999999",
        goal="weight loss",
        settings=mock_settings,
    )

    assert result["success"] is True
    assert result.get("created") is True
    coll.insert_one.assert_called_once()


@patch("src.services.booking_service.bookings_collection")
@patch("src.services.booking_service.find_customer_by_name")
def test_upsert_booking_updates_existing_by_name(
    mock_find, mock_bookings_coll, mock_settings
):
    mock_find.return_value = Customer(
        id="Nguyen Van A",
        phone_number="0901234567",
        health_note="",
        goal="",
        address="",
        password="",
    )
    coll = MagicMock()
    mock_bookings_coll.return_value = coll
    coll.find_one.return_value = {
        "_id": "oid2",
        "customer_id": "Nguyen Van A",
        "trainer_id": "Chưa chỉ định",
        "time": "2026-06-01T19:00",
        "status": "pending",
        "note": "",
    }

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
    coll.insert_one.assert_not_called()
    coll.replace_one.assert_called_once()


@patch("src.services.booking_service.bookings_collection")
@patch("src.services.booking_service.find_customer_by_name")
def test_create_booking_requires_existing_customer(
    mock_find, mock_bookings_coll, mock_settings
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
    mock_bookings_coll.assert_not_called()


@patch("src.services.booking_service.bookings_collection")
@patch("src.services.booking_service.find_customer_by_name")
def test_create_booking_success(mock_find, mock_bookings_coll, mock_settings):
    mock_find.return_value = Customer(
        id="Nguyen Van A",
        phone_number="0901234567",
        health_note="",
        goal="muscle gain",
        address="",
        password="",
    )
    coll = MagicMock()
    mock_bookings_coll.return_value = coll
    coll.find_one.return_value = None

    result = create_booking(
        customer_name="Nguyen Van A",
        trainer="PT Huy",
        date="2026-06-01",
        time="19:00",
        settings=mock_settings,
    )

    assert result["success"] is True
    assert result.get("created") is True
    coll.insert_one.assert_called_once()
    booking = coll.insert_one.call_args[0][0]
    assert booking["status"] == BookingStatus.PENDING.value


@patch("src.services.booking_service.bookings_collection")
@patch("src.services.booking_service.find_customer_by_name")
def test_create_booking_without_trainer_uses_default(
    mock_find, mock_bookings_coll, mock_settings
):
    mock_find.return_value = Customer(
        id="Nguyen Van A",
        phone_number="0901234567",
        health_note="",
        goal="",
        address="",
        password="",
    )
    coll = MagicMock()
    mock_bookings_coll.return_value = coll
    coll.find_one.return_value = None

    result = create_booking(
        customer_name="Nguyen Van A",
        trainer="",
        date="2026-06-01",
        time="19:00",
        settings=mock_settings,
    )

    assert result["success"] is True
    booking = coll.insert_one.call_args[0][0]
    assert booking["trainer_id"] == "Chưa chỉ định"


@patch("src.services.customer_service.customers_collection")
def test_find_customer_by_name(mock_coll, mock_settings):
    coll = MagicMock()
    mock_coll.return_value = coll
    coll.find_one.return_value = {
        "id": "Nguyen Van A",
        "phone_number": "1",
        "health_note": "",
        "goal": "",
        "address": "",
        "password": "",
    }

    found = find_customer_by_name("nguyen van a", mock_settings)
    assert found is not None
    assert found.phone_number == "1"

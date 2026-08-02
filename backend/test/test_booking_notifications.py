"""Tests that booking mutations trigger the right notification side-effects
(docs/notifications.md §3.1/§3.2), with MongoDB fully mocked."""

from unittest.mock import MagicMock, patch

from src.schema.customer import Customer


@patch("src.services.booking_service.notify_booking_approved")
@patch("src.services.booking_service.retract_session_reminder")
@patch("src.services.booking_service.bookings_collection")
@patch("src.services.booking_service.find_customer_by_name")
def test_admin_assign_booking_notifies_customer(
    mock_find, mock_bookings_coll, mock_retract, mock_notify_approved
):
    from src.services.booking_service import admin_assign_booking

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
    coll.find_one.return_value = None  # no existing booking for this slot

    result = admin_assign_booking(customer_id="Nguyen Van A", time="2026-07-16T08:00")

    assert result["success"] is True
    mock_notify_approved.assert_called_once()
    _, kwargs = mock_notify_approved.call_args
    assert kwargs["customer_id"] == "Nguyen Van A"
    assert kwargs["time_key"] == "2026-07-16T08:00"


@patch("src.services.booking_service.notify_booking_approved")
@patch("src.services.booking_service.retract_session_reminder")
@patch("src.services.booking_service.bookings_collection")
def test_set_booking_status_pending_to_approved_notifies(
    mock_bookings_coll, mock_retract, mock_notify_approved
):
    from src.services.booking_service import set_booking_status

    coll = MagicMock()
    mock_bookings_coll.return_value = coll
    coll.find_one.return_value = {
        "_id": "oid1",
        "id": "b1",
        "customer_id": "Nguyen Van A",
        "time": "2026-07-16T08:00",
        "status": "pending",
    }
    coll.find.return_value = []  # no other active bookings for capacity check

    result = set_booking_status(booking_id="b1", status="approved")

    assert result["success"] is True
    mock_notify_approved.assert_called_once_with(
        customer_id="Nguyen Van A", booking_id="b1", time_key="2026-07-16T08:00"
    )
    mock_retract.assert_not_called()


@patch("src.services.booking_service.notify_booking_approved")
@patch("src.services.booking_service.retract_session_reminder")
@patch("src.services.booking_service.bookings_collection")
def test_set_booking_status_approved_to_rejected_retracts_reminder(
    mock_bookings_coll, mock_retract, mock_notify_approved
):
    from src.services.booking_service import set_booking_status

    coll = MagicMock()
    mock_bookings_coll.return_value = coll
    coll.find_one.return_value = {
        "_id": "oid1",
        "id": "b1",
        "customer_id": "Nguyen Van A",
        "time": "2026-07-16T08:00",
        "status": "approved",
    }

    result = set_booking_status(booking_id="b1", status="rejected")

    assert result["success"] is True
    mock_notify_approved.assert_not_called()
    mock_retract.assert_called_once_with(booking_id="b1")


@patch("src.services.booking_service.notify_booking_approved")
@patch("src.services.booking_service.retract_session_reminder")
@patch("src.services.booking_service.bookings_collection")
def test_set_booking_status_already_approved_does_not_renotify(
    mock_bookings_coll, mock_retract, mock_notify_approved
):
    """Re-saving an already-approved booking (e.g. idempotent re-PATCH)
    must not fire a duplicate approval notification."""
    from src.services.booking_service import set_booking_status

    coll = MagicMock()
    mock_bookings_coll.return_value = coll
    coll.find_one.return_value = {
        "_id": "oid1",
        "id": "b1",
        "customer_id": "Nguyen Van A",
        "time": "2026-07-16T08:00",
        "status": "approved",
    }
    coll.find.return_value = []

    result = set_booking_status(booking_id="b1", status="approved")

    assert result["success"] is True
    mock_notify_approved.assert_not_called()
    mock_retract.assert_not_called()


@patch("src.services.booking_service.notify_booking_cancelled")
@patch("src.services.booking_service.retract_session_reminder")
@patch("src.services.booking_service.bookings_collection")
def test_cancel_customer_booking_retracts_reminder(
    mock_bookings_coll, mock_retract, mock_notify_cancelled
):
    from src.services.booking_service import cancel_customer_booking

    coll = MagicMock()
    mock_bookings_coll.return_value = coll
    coll.find_one.return_value = {
        "_id": "oid1",
        "id": "b1",
        "customer_id": "A",
        "time": "2026-07-16T08:00",
    }

    result = cancel_customer_booking(customer_id="A", booking_id="b1")

    assert result["success"] is True
    mock_retract.assert_called_once_with(booking_id="b1")
    mock_notify_cancelled.assert_called_once_with(
        customer_id="A", booking_id="b1", time_key="2026-07-16T08:00"
    )


@patch("src.services.booking_service.notify_booking_created")
@patch("src.services.booking_service.bookings_collection")
@patch("src.services.booking_service.find_customer_by_name")
def test_create_customer_booking_notifies_trainers(
    mock_find, mock_bookings_coll, mock_notify_created
):
    from src.services.booking_service import create_customer_booking

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
    coll.find.return_value = []

    result = create_customer_booking(
        customer_id="Nguyen Van A", time="2026-07-16T08:00"
    )

    assert result["success"] is True
    mock_notify_created.assert_called_once_with(
        customer_id="Nguyen Van A", booking_id=result["booking_id"], time_key="2026-07-16T08:00"
    )

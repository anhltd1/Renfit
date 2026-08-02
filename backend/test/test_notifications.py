"""Unit tests for notification generation, idempotency, and read state
(mocked MongoDB — see backend/docs/notifications.md for the design)."""

from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock, patch

from pymongo.errors import DuplicateKeyError

from src.schema.notification import NotificationType, TrainerNotificationType
from src.services.notification_service import (
    create_notification,
    create_trainer_notification,
    list_notifications,
    list_trainer_notifications,
    mark_all_read,
    mark_all_trainer_notifications_read,
    mark_read,
    mark_trainer_notification_read,
    notify_booking_approved,
    notify_booking_cancelled,
    notify_booking_created,
    notify_inbody_added,
    notify_session_reminder,
    notify_trainee_registered,
    retract_session_reminder,
    trainer_unread_count,
    unread_count,
)


@patch("src.services.notification_service.notifications_collection")
def test_create_notification_requires_customer_id(mock_coll):
    result = create_notification(
        customer_id="",
        type=NotificationType.BOOKING_APPROVED,
        related_id="b1",
        message="msg",
    )
    assert result["success"] is False
    mock_coll.assert_not_called()


@patch("src.services.notification_service.notifications_collection")
def test_create_notification_requires_related_id(mock_coll):
    result = create_notification(
        customer_id="A",
        type=NotificationType.BOOKING_APPROVED,
        related_id="",
        message="msg",
    )
    assert result["success"] is False
    mock_coll.assert_not_called()


@patch("src.services.notification_service.notifications_collection")
def test_create_notification_success_uses_default_title_and_target(mock_coll):
    coll = MagicMock()
    mock_coll.return_value = coll

    result = create_notification(
        customer_id="Nguyen Van A",
        type=NotificationType.BOOKING_APPROVED,
        related_id="booking-1",
        message="Buổi tập 08:00 16/07 đã được HLV xác nhận.",
    )

    assert result["success"] is True
    assert result["created"] is True
    coll.insert_one.assert_called_once()
    saved = coll.insert_one.call_args[0][0]
    assert saved["customer_id"] == "Nguyen Van A"
    assert saved["type"] == "booking_approved"
    assert saved["related_id"] == "booking-1"
    assert saved["target"] == "dashboard:bookings"
    assert saved["read"] is False
    assert saved["title"]  # non-empty default title filled in


@patch("src.services.notification_service.notifications_collection")
def test_create_notification_is_idempotent_on_duplicate(mock_coll):
    coll = MagicMock()
    mock_coll.return_value = coll
    coll.insert_one.side_effect = DuplicateKeyError("dup")

    result = create_notification(
        customer_id="A",
        type=NotificationType.SESSION_REMINDER,
        related_id="booking-1",
        message="msg",
    )

    assert result["success"] is True
    assert result["created"] is False


@patch("src.services.notification_service.notifications_collection")
def test_notify_booking_approved_targets_bookings_tab(mock_coll):
    coll = MagicMock()
    mock_coll.return_value = coll

    notify_booking_approved(
        customer_id="A", booking_id="b1", time_key="2026-07-16T08:00"
    )

    saved = coll.insert_one.call_args[0][0]
    assert saved["type"] == "booking_approved"
    assert saved["target"] == "dashboard:bookings"
    assert "08:00" in saved["message"]
    assert "16/07" in saved["message"]


@patch("src.services.notification_service.notifications_collection")
def test_notify_session_reminder_message_mentions_one_hour(mock_coll):
    coll = MagicMock()
    mock_coll.return_value = coll

    notify_session_reminder(
        customer_id="A", booking_id="b1", time_key="2026-07-16T08:00"
    )

    saved = coll.insert_one.call_args[0][0]
    assert saved["type"] == "session_reminder"
    assert "1 giờ" in saved["message"]


@patch("src.services.notification_service.notifications_collection")
def test_notify_inbody_added_targets_overview_tab(mock_coll):
    coll = MagicMock()
    mock_coll.return_value = coll

    notify_inbody_added(
        customer_id="A", inbody_id="i1", date_recorded="2026-07-16"
    )

    saved = coll.insert_one.call_args[0][0]
    assert saved["type"] == "inbody_added"
    assert saved["target"] == "dashboard:overview"
    assert saved["related_id"] == "i1"


@patch("src.services.notification_service.notifications_collection")
def test_retract_session_reminder_deletes_matching_notification(mock_coll):
    coll = MagicMock()
    mock_coll.return_value = coll
    coll.delete_one.return_value = MagicMock(deleted_count=1)

    result = retract_session_reminder(booking_id="b1")

    assert result == {"success": True, "deleted": True}
    coll.delete_one.assert_called_once_with(
        {"type": "session_reminder", "related_id": "b1"}
    )


@patch("src.services.notification_service.notifications_collection")
def test_list_notifications_filters_by_customer_and_unread(mock_coll):
    coll = MagicMock()
    mock_coll.return_value = coll
    cursor = MagicMock()
    coll.find.return_value = cursor
    cursor.sort.return_value = cursor
    cursor.limit.return_value = [
        {
            "id": "n1",
            "customer_id": "A",
            "type": "booking_approved",
            "title": "t",
            "message": "m",
            "target": "dashboard:bookings",
            "related_id": "b1",
            "read": False,
            "created_at": datetime(2026, 7, 16, tzinfo=timezone.utc),
            "read_at": None,
        }
    ]

    result = list_notifications(customer_id="A", unread_only=True)

    coll.find.assert_called_once_with(
        {"customer_id": "A", "read": False}, {"_id": 0}
    )
    assert len(result) == 1
    assert result[0]["id"] == "n1"
    assert result[0]["read"] is False


@patch("src.services.notification_service.notifications_collection")
def test_list_notifications_empty_customer_id_short_circuits(mock_coll):
    result = list_notifications(customer_id="")
    assert result == []
    mock_coll.assert_not_called()


@patch("src.services.notification_service.notifications_collection")
def test_unread_count(mock_coll):
    coll = MagicMock()
    mock_coll.return_value = coll
    coll.count_documents.return_value = 3

    assert unread_count(customer_id="A") == 3
    coll.count_documents.assert_called_once_with({"customer_id": "A", "read": False})


@patch("src.services.notification_service.notifications_collection")
def test_mark_read_not_found(mock_coll):
    coll = MagicMock()
    mock_coll.return_value = coll
    coll.find_one.return_value = None

    result = mark_read(notification_id="n1", customer_id="A")
    assert result["success"] is False


@patch("src.services.notification_service.notifications_collection")
def test_mark_read_success(mock_coll):
    coll = MagicMock()
    mock_coll.return_value = coll
    coll.find_one.return_value = {"_id": "oid1", "id": "n1", "customer_id": "A"}

    result = mark_read(notification_id="n1", customer_id="A")

    assert result["success"] is True
    coll.update_one.assert_called_once()
    set_fields = coll.update_one.call_args[0][1]["$set"]
    assert set_fields["read"] is True
    assert "read_at" in set_fields


@patch("src.services.notification_service.notifications_collection")
def test_mark_all_read(mock_coll):
    coll = MagicMock()
    mock_coll.return_value = coll
    coll.update_many.return_value = MagicMock(modified_count=5)

    result = mark_all_read(customer_id="A")

    assert result == {"success": True, "updated": 5}
    coll.update_many.assert_called_once()
    query, update = coll.update_many.call_args[0]
    assert query == {"customer_id": "A", "read": False}
    assert update["$set"]["read"] is True
    assert "read_at" in update["$set"]


# ── Scheduler (time-based session_reminder scan) ────────────────────────────


@patch("src.services.notification_scheduler.notify_session_reminder")
@patch("src.services.notification_scheduler.bookings_collection")
@patch("src.services.notification_scheduler.now_ict")
def test_scan_creates_reminder_for_booking_within_one_hour(
    mock_now, mock_bookings_coll, mock_notify
):
    from src.services.notification_scheduler import scan_and_create_reminders

    fixed_now = datetime(2026, 7, 16, 7, 30, tzinfo=timezone(timedelta(hours=7)))
    mock_now.return_value = fixed_now

    coll = MagicMock()
    mock_bookings_coll.return_value = coll
    coll.find.return_value = [
        {
            "id": "b1",
            "customer_id": "A",
            "time": "2026-07-16T08:00",  # 30 min away — within the 1h window
            "status": "approved",
        }
    ]
    mock_notify.return_value = {"success": True, "created": True}

    created = scan_and_create_reminders()

    assert created == 1
    mock_notify.assert_called_once_with(
        customer_id="A", booking_id="b1", time_key="2026-07-16T08:00"
    )


@patch("src.services.notification_scheduler.notify_session_reminder")
@patch("src.services.notification_scheduler.bookings_collection")
@patch("src.services.notification_scheduler.now_ict")
def test_scan_skips_booking_more_than_one_hour_away(
    mock_now, mock_bookings_coll, mock_notify
):
    from src.services.notification_scheduler import scan_and_create_reminders

    fixed_now = datetime(2026, 7, 16, 6, 0, tzinfo=timezone(timedelta(hours=7)))
    mock_now.return_value = fixed_now

    coll = MagicMock()
    mock_bookings_coll.return_value = coll
    coll.find.return_value = [
        {
            "id": "b1",
            "customer_id": "A",
            "time": "2026-07-16T08:00",  # 2h away
            "status": "approved",
        }
    ]

    created = scan_and_create_reminders()

    assert created == 0
    mock_notify.assert_not_called()


@patch("src.services.notification_scheduler.notify_session_reminder")
@patch("src.services.notification_scheduler.bookings_collection")
@patch("src.services.notification_scheduler.now_ict")
def test_scan_skips_booking_already_in_the_past(
    mock_now, mock_bookings_coll, mock_notify
):
    from src.services.notification_scheduler import scan_and_create_reminders

    fixed_now = datetime(2026, 7, 16, 9, 0, tzinfo=timezone(timedelta(hours=7)))
    mock_now.return_value = fixed_now

    coll = MagicMock()
    mock_bookings_coll.return_value = coll
    coll.find.return_value = [
        {
            "id": "b1",
            "customer_id": "A",
            "time": "2026-07-16T08:00",  # already started
            "status": "approved",
        }
    ]

    created = scan_and_create_reminders()

    assert created == 0
    mock_notify.assert_not_called()



# ── Trainer-facing notifications (broadcast — docs/notifications.md §1) ────


@patch("src.services.notification_service.trainer_notifications_collection")
def test_create_trainer_notification_requires_related_id(mock_coll):
    result = create_trainer_notification(
        type=TrainerNotificationType.BOOKING_CREATED,
        related_id="",
        message="msg",
    )
    assert result["success"] is False
    mock_coll.assert_not_called()


@patch("src.services.notification_service.trainer_notifications_collection")
def test_create_trainer_notification_success_uses_default_title_and_target(mock_coll):
    coll = MagicMock()
    mock_coll.return_value = coll

    result = create_trainer_notification(
        type=TrainerNotificationType.BOOKING_CREATED,
        related_id="b1",
        message="Nguyen Van A vừa đặt lịch tập 08:00 16/07.",
    )

    assert result["success"] is True
    assert result["created"] is True
    saved = coll.insert_one.call_args[0][0]
    assert saved["type"] == "booking_created"
    assert saved["related_id"] == "b1"
    assert saved["target"] == "admin:bookings"
    assert saved["read"] is False
    # No customer_id field — trainer notifications are broadcast, not per-recipient.
    assert "customer_id" not in saved


@patch("src.services.notification_service.trainer_notifications_collection")
def test_create_trainer_notification_is_idempotent_on_duplicate(mock_coll):
    coll = MagicMock()
    mock_coll.return_value = coll
    coll.insert_one.side_effect = DuplicateKeyError("dup")

    result = create_trainer_notification(
        type=TrainerNotificationType.BOOKING_CREATED,
        related_id="b1",
        message="msg",
    )

    assert result["success"] is True
    assert result["created"] is False


@patch("src.services.notification_service.trainer_notifications_collection")
def test_notify_booking_created_targets_admin_bookings(mock_coll):
    coll = MagicMock()
    mock_coll.return_value = coll

    notify_booking_created(
        customer_id="Nguyen Van A", booking_id="b1", time_key="2026-07-16T08:00"
    )

    saved = coll.insert_one.call_args[0][0]
    assert saved["type"] == "booking_created"
    assert saved["target"] == "admin:bookings"
    assert "Nguyen Van A" in saved["message"]
    assert "08:00" in saved["message"]


@patch("src.services.notification_service.trainer_notifications_collection")
def test_notify_booking_cancelled_uses_distinct_related_id_from_created(mock_coll):
    """booking_created and booking_cancelled for the SAME booking must not
    collide under the (type, related_id) unique index — cancelled uses a
    suffixed related_id so both can coexist for one booking's lifecycle."""
    coll = MagicMock()
    mock_coll.return_value = coll

    notify_booking_cancelled(
        customer_id="Nguyen Van A", booking_id="b1", time_key="2026-07-16T08:00"
    )

    saved = coll.insert_one.call_args[0][0]
    assert saved["type"] == "booking_cancelled"
    assert saved["related_id"] == "b1:cancelled"
    assert saved["target"] == "admin:bookings"


@patch("src.services.notification_service.trainer_notifications_collection")
def test_notify_trainee_registered_targets_admin_clients(mock_coll):
    coll = MagicMock()
    mock_coll.return_value = coll

    notify_trainee_registered(customer_id="Nguyen Van A")

    saved = coll.insert_one.call_args[0][0]
    assert saved["type"] == "trainee_registered"
    assert saved["related_id"] == "Nguyen Van A"
    assert saved["target"] == "admin:clients"


@patch("src.services.notification_service.trainer_notifications_collection")
def test_list_trainer_notifications_filters_unread(mock_coll):
    coll = MagicMock()
    mock_coll.return_value = coll
    cursor = MagicMock()
    coll.find.return_value = cursor
    cursor.sort.return_value = cursor
    cursor.limit.return_value = [
        {
            "id": "n1",
            "type": "booking_created",
            "title": "t",
            "message": "m",
            "target": "admin:bookings",
            "related_id": "b1",
            "read": False,
            "created_at": datetime(2026, 7, 16, tzinfo=timezone.utc),
            "read_at": None,
        }
    ]

    result = list_trainer_notifications(unread_only=True)

    coll.find.assert_called_once_with({"read": False}, {"_id": 0})
    assert len(result) == 1
    assert result[0]["id"] == "n1"


@patch("src.services.notification_service.trainer_notifications_collection")
def test_trainer_unread_count(mock_coll):
    coll = MagicMock()
    mock_coll.return_value = coll
    coll.count_documents.return_value = 4

    assert trainer_unread_count() == 4
    coll.count_documents.assert_called_once_with({"read": False})


@patch("src.services.notification_service.trainer_notifications_collection")
def test_mark_trainer_notification_read_not_found(mock_coll):
    coll = MagicMock()
    mock_coll.return_value = coll
    coll.find_one.return_value = None

    result = mark_trainer_notification_read(notification_id="n1")
    assert result["success"] is False


@patch("src.services.notification_service.trainer_notifications_collection")
def test_mark_trainer_notification_read_success(mock_coll):
    coll = MagicMock()
    mock_coll.return_value = coll
    coll.find_one.return_value = {"_id": "oid1", "id": "n1"}

    result = mark_trainer_notification_read(notification_id="n1")

    assert result["success"] is True
    set_fields = coll.update_one.call_args[0][1]["$set"]
    assert set_fields["read"] is True


@patch("src.services.notification_service.trainer_notifications_collection")
def test_mark_all_trainer_notifications_read(mock_coll):
    coll = MagicMock()
    mock_coll.return_value = coll
    coll.update_many.return_value = MagicMock(modified_count=7)

    result = mark_all_trainer_notifications_read()

    assert result == {"success": True, "updated": 7}
    coll.update_many.assert_called_once()
    query = coll.update_many.call_args[0][0]
    assert query == {"read": False}


@patch("src.services.notification_scheduler.notify_session_reminder")
@patch("src.services.notification_scheduler.bookings_collection")
@patch("src.services.notification_scheduler.now_ict")
def test_scan_does_not_double_count_when_already_notified(
    mock_now, mock_bookings_coll, mock_notify
):
    """create_notification is idempotent — scan_and_create_reminders relies
    on notify_session_reminder's ``created`` flag to report 0 on repeat runs."""
    from src.services.notification_scheduler import scan_and_create_reminders

    fixed_now = datetime(2026, 7, 16, 7, 30, tzinfo=timezone(timedelta(hours=7)))
    mock_now.return_value = fixed_now

    coll = MagicMock()
    mock_bookings_coll.return_value = coll
    coll.find.return_value = [
        {
            "id": "b1",
            "customer_id": "A",
            "time": "2026-07-16T08:00",
            "status": "approved",
        }
    ]
    mock_notify.return_value = {"success": True, "created": False}

    created = scan_and_create_reminders()

    assert created == 0

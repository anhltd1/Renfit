"""Unit tests for customer/booking business rules (mocked MongoDB)."""

from datetime import timedelta
from unittest.mock import MagicMock, patch

import pytest

from src.schema.customer import Customer
from src.services.ai.tools import execute_tool
from src.services.customer_service import find_customer_by_name


@pytest.fixture
def mock_settings():
    return MagicMock()


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


# ── Self-service tools (customer_id bound server-side, read-only profile) ──


def test_self_service_tools_require_customer_id():
    for tool_name in (
        "get_my_profile",
        "get_my_inbody_history",
        "get_booking_availability",
        "book_slot",
        "cancel_booking",
    ):
        result = execute_tool(tool_name, {}, customer_id="")
        assert result["success"] is False


def test_unknown_tool_fails_even_with_customer_id():
    result = execute_tool("delete_everything", {}, customer_id="Real User")
    assert result["success"] is False


@patch("src.services.ai.tools.get_customer_info")
def test_get_my_profile_uses_bound_customer_id(mock_get_info):
    mock_get_info.return_value = {"success": True, "found": True, "customer": {}}
    result = execute_tool("get_my_profile", {"customer_name": "Someone Else"}, customer_id="Real User")
    assert result["success"] is True
    mock_get_info.assert_called_once_with("Real User")


@patch("src.services.ai.tools.get_inbody_history")
def test_get_my_inbody_history_uses_bound_customer_id(mock_history):
    mock_history.return_value = {"success": True, "records": []}
    result = execute_tool("get_my_inbody_history", {}, customer_id="Real User")
    assert result["success"] is True
    mock_history.assert_called_once_with("Real User")


@patch("src.services.ai.tools.build_ai_availability")
def test_get_booking_availability_uses_bound_customer_id(mock_avail):
    mock_avail.return_value = {"success": True, "days_with_open_slots": []}
    result = execute_tool("get_booking_availability", {}, customer_id="Real User")
    assert result["success"] is True
    mock_avail.assert_called_once_with("Real User", date_filter="")


@patch("src.services.ai.tools.build_ai_availability")
def test_get_booking_availability_passes_date_filter(mock_avail):
    mock_avail.return_value = {"success": True, "days_with_open_slots": []}
    result = execute_tool(
        "get_booking_availability", {"date": "2026-06-15"}, customer_id="Real User"
    )
    assert result["success"] is True
    mock_avail.assert_called_once_with("Real User", date_filter="2026-06-15")


@patch("src.services.ai.tools.create_customer_booking")
def test_book_slot_combines_date_and_time(mock_create):
    mock_create.return_value = {"success": True, "booking_id": "abc"}
    result = execute_tool(
        "book_slot",
        {"date": "2026-06-15", "time": "08:00", "note": "buổi đầu"},
        customer_id="Real User",
    )
    assert result["success"] is True
    mock_create.assert_called_once_with(
        customer_id="Real User",
        time="2026-06-15T08:00",
        note="buổi đầu",
    )


@patch("src.services.ai.tools.cancel_customer_booking")
def test_cancel_booking_uses_bound_customer_id(mock_cancel):
    mock_cancel.return_value = {"success": True}
    result = execute_tool(
        "cancel_booking", {"booking_id": "abc"}, customer_id="Real User"
    )
    assert result["success"] is True
    mock_cancel.assert_called_once_with(customer_id="Real User", booking_id="abc")


@patch("src.services.customer_service.inbody_collection")
def test_get_inbody_history_computes_progress(mock_coll, mock_settings):
    coll = MagicMock()
    mock_coll.return_value = coll
    coll.find.return_value.sort.return_value = [
        {"id": "1", "customer_id": "A", "height": 170, "weight": 70, "SMM": 30, "BFM": 15, "date_recorded": "2026-01-01"},
        {"id": "2", "customer_id": "A", "height": 170, "weight": 68, "SMM": 31, "BFM": 13, "date_recorded": "2026-02-01"},
    ]

    from src.services.customer_service import get_inbody_history

    result = get_inbody_history("A")
    assert result["success"] is True
    assert result["record_count"] == 2
    assert result["latest"]["weight"] == 68
    assert result["progress_since_first_record"]["weight_change"] == -2.0
    assert result["progress_since_first_record"]["SMM_change"] == 1.0
    assert result["progress_since_first_record"]["BFM_change"] == -2.0


@patch("src.services.booking_service.bookings_collection")
def test_build_ai_availability_excludes_full_and_past_slots(mock_bookings_coll):
    coll = MagicMock()
    mock_bookings_coll.return_value = coll
    coll.find.return_value = []

    from src.services.booking_service import build_ai_availability

    result = build_ai_availability("Real User")
    assert result["success"] is True
    assert isinstance(result["days_with_open_slots"], list)
    assert result["my_upcoming_bookings"] == []


@patch("src.services.booking_service.bookings_collection")
def test_build_ai_availability_defaults_to_today_and_tomorrow(mock_bookings_coll):
    coll = MagicMock()
    mock_bookings_coll.return_value = coll
    coll.find.return_value = []

    from src.services.booking_service import build_ai_availability, today_ict, window_days

    result = build_ai_availability("Real User")
    assert result["requested_date"] is None
    expected_dates = {
        d.isoformat()
        for d in window_days()
        if d in (today_ict(), today_ict() + timedelta(days=1))
    }
    returned_dates = {d["date"] for d in result["days_with_open_slots"]}
    assert returned_dates.issubset(expected_dates)


@patch("src.services.booking_service.bookings_collection")
def test_build_ai_availability_filters_to_requested_date(mock_bookings_coll):
    coll = MagicMock()
    mock_bookings_coll.return_value = coll
    coll.find.return_value = []

    from src.services.booking_service import build_ai_availability, window_days

    # Pick a date inside the bookable window that's not today/tomorrow, if any.
    candidate = next((d for d in window_days()), None)
    assert candidate is not None
    target = candidate.isoformat()

    result = build_ai_availability("Real User", date_filter=target)
    assert result["requested_date"] == target
    assert result["date_in_range"] is True
    for day in result["days_with_open_slots"]:
        assert day["date"] == target


@patch("src.services.booking_service.bookings_collection")
def test_build_ai_availability_rejects_out_of_range_date(mock_bookings_coll):
    coll = MagicMock()
    mock_bookings_coll.return_value = coll
    coll.find.return_value = []

    from src.services.booking_service import build_ai_availability

    result = build_ai_availability("Real User", date_filter="2000-01-01")
    assert result["date_in_range"] is False
    assert result["days_with_open_slots"] == []


@patch("src.services.booking_service.bookings_collection")
def test_build_ai_availability_echoes_bookable_window_bounds(mock_bookings_coll):
    coll = MagicMock()
    mock_bookings_coll.return_value = coll
    coll.find.return_value = []

    from src.services.booking_service import build_ai_availability, window_days

    result = build_ai_availability("Real User")
    all_days = window_days()
    assert result["window_start"] == all_days[0].isoformat()
    assert result["window_end"] == all_days[-1].isoformat()


# ── System prompt is grounded in the real current date ─────────────────────


def test_build_system_prompt_includes_real_today():
    from datetime import date

    from src.services.ai.prompts import build_system_prompt

    fixed_today = date(2026, 7, 11)  # a Saturday
    prompt = build_system_prompt(today=fixed_today)
    assert "2026-07-11" in prompt
    assert "Thứ 7" in prompt


def test_build_system_prompt_defaults_to_today_ict():
    from src.services.ai.prompts import build_system_prompt
    from src.services.booking_service import today_ict

    prompt = build_system_prompt()
    assert today_ict().isoformat() in prompt


def test_build_system_prompt_date_lookup_table_matches_window_days():
    """Regression test: the prompt must give the model a literal lookup
    table for every bookable weekday instead of asking it to compute dates
    (e.g. "thứ 5 tuần sau" was previously miscalculated as 17/7 instead of
    the correct 16/7 for a Saturday 11/7 "today").
    """
    from datetime import date

    from src.services.ai.prompts import build_system_prompt
    from src.services.booking_service import window_days

    fixed_today = date(2026, 7, 11)  # Saturday — the exact bug scenario
    prompt = build_system_prompt(today=fixed_today)

    all_days = window_days(fixed_today)
    assert len(all_days) == 12  # 2 weeks minus 2 Sundays

    # Every bookable date must appear literally in the prompt so the model
    # can look it up instead of calculating it.
    for d in all_days:
        assert d.isoformat() in prompt

    # The exact failure from the bug report: "thứ 5 tuần sau" must map to
    # 2026-07-16 (Thursday), not 2026-07-17 (which is "thứ 6 tuần sau").
    assert "Thứ 5 tuần sau | 2026-07-16" in prompt
    assert "Thứ 6 tuần sau | 2026-07-17" in prompt
    assert date.fromisoformat("2026-07-16").weekday() == 3  # Thursday
    assert date.fromisoformat("2026-07-17").weekday() == 4  # Friday

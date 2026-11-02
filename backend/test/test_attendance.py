"""U22 attendance tracking: booking statuses `completed` / `no_show`.

MongoDB is replaced by a tiny in-memory fake collection (no mongomock
dependency). All dates are computed relative to "now" in ICT so the suite
never goes stale.
"""
import re
from datetime import timedelta
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from src.services import booking_service as bs


# ── In-memory fake collection ──────────────────────────────────────────────


def _matches(doc: dict, query: dict) -> bool:
    for field, cond in query.items():
        value = doc.get(field)
        if isinstance(cond, dict):
            if "$in" in cond and value not in cond["$in"]:
                return False
            if "$ne" in cond and value == cond["$ne"]:
                return False
            if "$regex" in cond and not re.search(cond["$regex"], str(value or "")):
                return False
        elif value != cond:
            return False
    return True


class _Cursor(list):
    def sort(self, key, direction=1):
        return _Cursor(sorted(self, key=lambda d: str(d.get(key, "")), reverse=direction < 0))


class FakeCollection:
    def __init__(self, docs=None):
        self.docs: list[dict] = []
        for d in docs or []:
            self.insert_one(dict(d))

    def insert_one(self, doc):
        doc.setdefault("_id", f"oid-{len(self.docs)}-{doc.get('id')}")
        self.docs.append(doc)

    def find(self, query=None, projection=None):
        return _Cursor(dict(d) for d in self.docs if _matches(d, query or {}))

    def find_one(self, query=None, projection=None):
        found = self.find(query)
        return found[0] if found else None

    def count_documents(self, query):
        return len(self.find(query))

    def update_one(self, query, update):
        for d in self.docs:
            if _matches(d, query):
                d.update(update.get("$set", {}))
                return

    def delete_one(self, query):
        self.docs = [d for d in self.docs if not _matches(d, query)]


def _booking(bid, time_key, status, customer="Member A"):
    return {
        "id": bid,
        "customer_id": customer,
        "trainer_id": "admin",
        "time": time_key,
        "status": status,
        "note": "",
    }


def _key(dt) -> str:
    return f"{dt.date().isoformat()}T{dt.hour:02d}:00"


PAST_KEY = _key(bs.now_ict() - timedelta(days=1, hours=2))
FUTURE_KEY = _key(bs.now_ict() + timedelta(days=2))


@pytest.fixture
def coll():
    fake = FakeCollection()
    with patch("src.services.booking_service.bookings_collection", return_value=fake), patch(
        "src.services.blocked_slot_service.bookings_collection", return_value=fake
    ), patch("src.api.admin.bookings_collection", return_value=fake):
        yield fake


@pytest.fixture
def notify():
    with patch("src.services.booking_service.notify_booking_approved") as approved, patch(
        "src.services.booking_service.retract_session_reminder"
    ) as retract:
        yield approved, retract


# ── Transitions ────────────────────────────────────────────────────────────


@pytest.mark.parametrize(
    "start,target",
    [
        ("approved", "completed"),
        ("approved", "no_show"),
        ("completed", "no_show"),
        ("no_show", "completed"),
        ("completed", "approved"),
        ("no_show", "approved"),
        ("pending", "approved"),
        ("pending", "rejected"),
        ("approved", "pending"),
        ("approved", "rejected"),
        ("rejected", "pending"),
        ("rejected", "approved"),
    ],
)
def test_valid_transitions_on_started_session(coll, notify, start, target):
    coll.insert_one(_booking("b1", PAST_KEY, start))
    result = bs.set_booking_status(booking_id="b1", status=target)
    assert result["success"] is True, result
    assert result["status"] == target
    assert coll.find_one({"id": "b1"})["status"] == target


@pytest.mark.parametrize(
    "start,target",
    [
        ("pending", "completed"),
        ("pending", "no_show"),
        ("rejected", "completed"),
        ("rejected", "no_show"),
        ("completed", "pending"),
        ("completed", "rejected"),
        ("no_show", "pending"),
        ("no_show", "rejected"),
    ],
)
def test_invalid_transitions_rejected(coll, notify, start, target):
    coll.insert_one(_booking("b1", PAST_KEY, start))
    result = bs.set_booking_status(booking_id="b1", status=target)
    assert result == {"success": False, "message": "Không thể chuyển trạng thái này."}
    assert coll.find_one({"id": "b1"})["status"] == start


@pytest.mark.parametrize("target", ["completed", "no_show"])
def test_attendance_on_future_session_rejected(coll, notify, target):
    coll.insert_one(_booking("b1", FUTURE_KEY, "approved"))
    result = bs.set_booking_status(booking_id="b1", status=target)
    assert result == {"success": False, "message": "Buổi tập chưa bắt đầu."}
    assert coll.find_one({"id": "b1"})["status"] == "approved"


def test_future_completed_to_no_show_also_needs_started(coll, notify):
    coll.insert_one(_booking("b1", FUTURE_KEY, "completed"))
    result = bs.set_booking_status(booking_id="b1", status="no_show")
    assert result["success"] is False
    assert result["message"] == "Buổi tập chưa bắt đầu."
    # Undo back to approved is always allowed.
    assert bs.set_booking_status(booking_id="b1", status="approved")["success"] is True


@pytest.mark.parametrize("status", ["completed", "no_show", "approved", "pending"])
def test_same_status_is_noop(coll, notify, status):
    coll.insert_one(_booking("b1", FUTURE_KEY, status))
    result = bs.set_booking_status(booking_id="b1", status=status)
    assert result["success"] is True
    assert result["status"] == status
    approved, retract = notify
    approved.assert_not_called()
    retract.assert_not_called()


def test_unknown_status_value(coll, notify):
    coll.insert_one(_booking("b1", PAST_KEY, "approved"))
    result = bs.set_booking_status(booking_id="b1", status="cancelled")
    assert result == {"success": False, "message": "Trạng thái không hợp lệ."}


# ── Notifications ──────────────────────────────────────────────────────────


@pytest.mark.parametrize(
    "start,target",
    [
        ("approved", "completed"),
        ("approved", "no_show"),
        ("completed", "no_show"),
        ("no_show", "completed"),
        ("completed", "approved"),
        ("no_show", "approved"),
    ],
)
def test_attendance_changes_send_and_retract_nothing(coll, notify, start, target):
    coll.insert_one(_booking("b1", PAST_KEY, start))
    assert bs.set_booking_status(booking_id="b1", status=target)["success"] is True
    approved, retract = notify
    approved.assert_not_called()
    retract.assert_not_called()


def test_old_transitions_keep_notifications(coll, notify):
    approved, retract = notify
    coll.insert_one(_booking("b1", FUTURE_KEY, "pending"))
    bs.set_booking_status(booking_id="b1", status="approved")
    approved.assert_called_once()
    bs.set_booking_status(booking_id="b1", status="rejected")
    retract.assert_called_once_with(booking_id="b1")


# ── Capacity ───────────────────────────────────────────────────────────────


def test_attendance_statuses_consume_capacity(coll, notify):
    for i, st in enumerate(["completed", "completed", "no_show", "approved"]):
        coll.insert_one(_booking(f"x{i}", PAST_KEY, st, customer=f"M{i}"))
    coll.insert_one(_booking("r1", PAST_KEY, "rejected", customer="Late"))
    assert bs.active_counts()[PAST_KEY] == 4
    result = bs.set_booking_status(booking_id="r1", status="approved")
    assert result == {"success": False, "message": "Khung giờ này đã đầy."}


def test_moving_between_active_statuses_skips_capacity(coll, notify):
    # Over-full slot (admin assign bypasses capacity): attendance still works.
    for i in range(5):
        coll.insert_one(_booking(f"x{i}", PAST_KEY, "approved", customer=f"M{i}"))
    assert bs.set_booking_status(booking_id="x0", status="completed")["success"] is True
    assert bs.set_booking_status(booking_id="x0", status="approved")["success"] is True


def _future_window_day():
    today = bs.today_ict()
    return next(d for d in bs.window_days() if d > today)


def test_availability_counts_attendance_and_never_bookable(coll, notify):
    day = _future_window_day()
    key = bs.slot_time_str(day, 10)
    coll.insert_one(_booking("mine", key, "completed", customer="Member A"))
    for i, st in enumerate(["completed", "no_show", "no_show"]):
        coll.insert_one(_booking(f"o{i}", key, st, customer=f"O{i}"))
    with patch("src.services.blocked_slot_service.get_blocked_hours_for_date", return_value=set()):
        grid = bs.build_availability("Member A")
        other = bs.build_availability("Someone Else")
    slot = next(s for d in grid["days"] for s in d["slots"] if s["time"] == key)
    assert slot["count"] == 4
    assert slot["full"] is True
    assert slot["available"] is False
    assert slot["my_status"] == "completed"
    assert slot["my_booking_id"] == "mine"
    other_slot = next(s for d in other["days"] for s in d["slots"] if s["time"] == key)
    assert other_slot["available"] is False


def test_ai_availability_excludes_full_attendance_slot_and_history(coll, notify):
    day = _future_window_day()
    key = bs.slot_time_str(day, 11)
    for i in range(4):
        coll.insert_one(_booking(f"c{i}", key, "completed", customer=f"C{i}"))
    coll.insert_one(_booking("h1", PAST_KEY, "completed", customer="Member A"))
    result = bs.build_ai_availability("Member A", date_filter=day.isoformat())
    open_hours = [h for d in result["days_with_open_slots"] for h in d["open_hours"]]
    assert "11:00" not in open_hours
    assert all(b["status"] in ("pending", "approved") for b in result["my_upcoming_bookings"])


def test_create_booking_blocked_by_attendance_capacity(coll, notify):
    day = _future_window_day()
    key = bs.slot_time_str(day, 12)
    for i in range(4):
        coll.insert_one(_booking(f"c{i}", key, "no_show", customer=f"C{i}"))
    with patch("src.services.booking_service.find_customer_by_name", return_value=object()), patch(
        "src.services.booking_service.notify_booking_created"
    ):
        result = bs.create_customer_booking(customer_id="Member A", time=key)
    assert result == {"success": False, "message": "Khung giờ này đã đầy."}


def test_member_cannot_cancel_marked_session(coll, notify):
    coll.insert_one(_booking("b1", PAST_KEY, "completed"))
    with patch("src.services.booking_service.notify_booking_cancelled"):
        result = bs.cancel_customer_booking(customer_id="Member A", booking_id="b1")
    assert result["success"] is False
    assert coll.find_one({"id": "b1"}) is not None


def test_blocked_slot_cancellation_skips_marked_sessions(coll, notify):
    from src.services import blocked_slot_service as bss

    day, hour = PAST_KEY.split("T")[0], int(PAST_KEY[11:13])
    coll.insert_one(_booking("a", PAST_KEY, "approved", customer="A"))
    coll.insert_one(_booking("c", PAST_KEY, "completed", customer="C"))
    coll.insert_one(_booking("n", PAST_KEY, "no_show", customer="N"))
    blocks = FakeCollection([{"id": "blk", "date": day, "hours": [hour]}])
    with patch("src.services.blocked_slot_service.blocked_slots_collection", return_value=blocks):
        result = bss.cancel_affected_bookings(slot_id="blk")
    assert result["cancelled"] == 1
    assert coll.find_one({"id": "a"})["status"] == "rejected"
    assert coll.find_one({"id": "c"})["status"] == "completed"
    assert coll.find_one({"id": "n"})["status"] == "no_show"


# ── Attendance summary ─────────────────────────────────────────────────────


def test_attendance_summary_counts(coll):
    for i, st in enumerate(["completed", "completed", "no_show", "approved", "rejected"]):
        coll.insert_one(_booking(f"b{i}", PAST_KEY, st, customer="Member A"))
    coll.insert_one(_booking("z", PAST_KEY, "completed", customer="Other"))
    assert bs.attendance_summary("Member A") == {"completed": 2, "no_show": 1}
    assert bs.attendance_summary("Nobody") == {"completed": 0, "no_show": 0}


# ── Admin endpoints ────────────────────────────────────────────────────────


@pytest.fixture
def client(coll):
    from src.api.admin import _require_admin
    from src.main import app

    customers = FakeCollection([{"id": "Member A", "goal": "Giảm mỡ"}])
    app.dependency_overrides[_require_admin] = lambda: "admin"
    with patch("src.api.admin.customers_collection", return_value=customers):
        yield TestClient(app)
    app.dependency_overrides.pop(_require_admin, None)


def test_today_payload_has_ids_statuses_and_unmarked_count(client, coll):
    today = bs.today_ict().isoformat()
    now_hour = bs.now_ict().hour
    rows = [
        ("t0", 0, "approved"),
        ("t1", 1, "completed"),
        ("t2", 2, "no_show"),
        ("t3", 23, "approved"),
        ("t4", 3, "rejected"),
    ]
    for bid, hour, st in rows:
        coll.insert_one(_booking(bid, f"{today}T{hour:02d}:00", st))
    coll.insert_one(_booking("p1", FUTURE_KEY, "pending"))

    res = client.get("/api/v1/admin/today")
    assert res.status_code == 200
    body = res.json()
    sessions = body["sessions"]
    assert [s["id"] for s in sessions] == ["t0", "t1", "t2", "t3"]
    assert [s["status"] for s in sessions] == ["approved", "completed", "no_show", "approved"]
    assert sessions[0]["customer_goal"] == "Giảm mỡ"
    expected_unmarked = sum(1 for _, h, st in rows if st == "approved" and h <= now_hour)
    assert body["unmarked_count"] == expected_unmarked
    assert [p["id"] for p in body["pending"]] == ["p1"]


def test_attendance_endpoint(client, coll):
    coll.insert_one(_booking("b1", PAST_KEY, "completed"))
    coll.insert_one(_booking("b2", PAST_KEY, "no_show", customer="Member A"))
    res = client.get("/api/v1/admin/customers/Member A/attendance")
    assert res.status_code == 200
    assert res.json() == {"customer_id": "Member A", "completed": 1, "no_show": 1}


def test_patch_attendance_future_returns_400(client, coll):
    coll.insert_one(_booking("b1", FUTURE_KEY, "approved"))
    with patch("src.services.booking_service.notify_booking_approved"), patch(
        "src.services.booking_service.retract_session_reminder"
    ):
        res = client.patch("/api/v1/admin/bookings/b1", json={"status": "completed"})
    assert res.status_code == 400
    assert res.json()["detail"] == "Buổi tập chưa bắt đầu."


def test_attendance_endpoint_requires_admin():
    from src.main import app

    res = TestClient(app).get("/api/v1/admin/customers/Member A/attendance")
    assert res.status_code == 401

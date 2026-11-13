"""Session-token auth (src/services/session_service.py + src/api/deps.py).

Regression coverage for the pre-deployment audit: the admin token used to be
the trainer id (literally "admin"), and member endpoints trusted a
client-supplied ``customer_id``. MongoDB is replaced by a tiny in-memory fake.
"""

from datetime import datetime, timedelta, timezone
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from passlib.context import CryptContext

_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


class FakeCollection:
    def __init__(self, docs=None):
        self.docs = [dict(d) for d in (docs or [])]

    @staticmethod
    def _match(doc, query):
        return all(doc.get(k) == v for k, v in query.items())

    def find_one(self, query, projection=None):
        for doc in self.docs:
            if self._match(doc, query):
                return dict(doc)
        return None

    def find(self, query, projection=None):
        return FakeCursor([dict(d) for d in self.docs if self._match(d, query)])

    def insert_one(self, doc):
        self.docs.append(dict(doc))

    def update_one(self, query, update):
        for doc in self.docs:
            if self._match(doc, query):
                doc.update(update.get("$set", {}))
                return type("R", (), {"matched_count": 1})()
        return type("R", (), {"matched_count": 0})()

    def delete_one(self, query):
        for i, doc in enumerate(self.docs):
            if self._match(doc, query):
                del self.docs[i]
                return

    def delete_many(self, query):
        self.docs = [d for d in self.docs if not self._match(d, query)]


class FakeCursor(list):
    def sort(self, *_args, **_kwargs):
        return self


@pytest.fixture
def db():
    sessions = FakeCollection()
    trainers = FakeCollection([{"id": "admin", "name": "coach", "password": _pwd.hash("coach-pass")}])
    customers = FakeCollection(
        [
            {"id": "Member A", "phone_number": "0900000001", "password": _pwd.hash("pass-a"), "age": 30},
            {"id": "Member B", "phone_number": "0900000002", "password": _pwd.hash("pass-b"), "age": 30},
        ]
    )
    inbody = FakeCollection(
        [
            {"id": "ia", "customer_id": "Member A", "height": 170, "weight": 70, "SMM": 30, "BFM": 15},
            {"id": "ib", "customer_id": "Member B", "height": 160, "weight": 55, "SMM": 25, "BFM": 12},
        ]
    )
    with (
        patch("src.services.session_service.auth_sessions_collection", return_value=sessions),
        patch("src.api.deps.personal_trainers_collection", return_value=trainers),
        patch("src.api.deps.customers_collection", return_value=customers),
        patch("src.api.admin.personal_trainers_collection", return_value=trainers),
        patch("src.api.admin.customers_collection", return_value=customers),
        patch("src.api.auth.customers_collection", return_value=customers),
        patch("src.api.profile.inbody_collection", return_value=inbody),
        patch("src.api.push.personal_trainers_collection", return_value=trainers),
        patch("src.api.push.customers_collection", return_value=customers),
    ):
        yield {"sessions": sessions, "customers": customers}


@pytest.fixture
def client(db):
    from src.main import app

    return TestClient(app)


def _member_token(client, phone="0900000001", password="pass-a"):
    res = client.post("/api/v1/auth/login", json={"phone_number": phone, "password": password})
    assert res.status_code == 200, res.text
    return res.json()["token"]


def _admin_token(client):
    res = client.post("/api/v1/admin/login", json={"username": "coach", "password": "coach-pass"})
    assert res.status_code == 200, res.text
    return res.json()["token"]


def _auth(token):
    return {"Authorization": f"Bearer {token}"}


# ── Admin ──────────────────────────────────────────────────────────────────


def test_trainer_id_is_no_longer_a_valid_admin_token(client):
    res = client.get("/api/v1/admin/customers", headers=_auth("admin"))
    assert res.status_code == 401


def test_admin_login_issues_random_token_that_works(client):
    token = _admin_token(client)
    assert token != "admin" and len(token) >= 40
    res = client.post("/api/v1/admin/customers/Member A/restore", headers=_auth(token))
    assert res.status_code == 200


def test_admin_logout_revokes_token(client):
    token = _admin_token(client)
    assert client.post("/api/v1/admin/logout", headers=_auth(token)).status_code == 204
    assert client.get("/api/v1/admin/customers", headers=_auth(token)).status_code == 401


def test_member_token_cannot_call_admin_endpoints(client):
    token = _member_token(client)
    assert client.get("/api/v1/admin/customers", headers=_auth(token)).status_code == 401


def test_only_the_token_hash_is_stored(client, db):
    token = _admin_token(client)
    stored = db["sessions"].docs[0]
    assert token not in stored.values()
    assert stored["kind"] == "trainer" and stored["subject_id"] == "admin"


# ── Members ────────────────────────────────────────────────────────────────


def test_member_endpoints_require_a_token(client):
    assert client.get("/api/v1/profile/inbody?customer_id=Member A").status_code == 401
    assert client.get("/api/v1/notifications?customer_id=Member A").status_code == 401
    assert client.post("/api/v1/bookings", json={"time": "2026-06-15T08:00"}).status_code == 401


def test_availability_is_public_for_the_landing_page(client):
    """Anonymous visitors (landing-page TodayBoard) get counts only; a forged
    customer_id or an invalid token never personalises the grid."""
    with patch("src.api.bookings.build_availability", return_value={"days": []}) as build:
        assert client.get("/api/v1/bookings/availability?customer_id=Member B").status_code == 200
        assert build.call_args.args == ("",)
        res = client.get("/api/v1/bookings/availability", headers=_auth("garbage"))
        assert res.status_code == 200 and build.call_args.args == ("",)
        token = _member_token(client)
        assert client.get("/api/v1/bookings/availability", headers=_auth(token)).status_code == 200
        assert build.call_args.args == ("Member A",)


def test_client_supplied_customer_id_is_ignored(client):
    token = _member_token(client)  # Member A
    res = client.get("/api/v1/profile/inbody?customer_id=Member B", headers=_auth(token))
    assert res.status_code == 200
    assert {r["customer_id"] for r in res.json()} == {"Member A"}


def test_expired_session_is_rejected(client, db):
    token = _member_token(client)
    db["sessions"].docs[0]["expires_at"] = datetime.now(timezone.utc) - timedelta(seconds=1)
    assert client.get("/api/v1/profile/inbody", headers=_auth(token)).status_code == 401


def test_member_logout_revokes_token(client):
    token = _member_token(client)
    assert client.post("/api/v1/auth/logout", headers=_auth(token)).status_code == 204
    assert client.get("/api/v1/profile/inbody", headers=_auth(token)).status_code == 401


def test_archiving_signs_member_out_and_blocks_login(client):
    member = _member_token(client)
    admin = _admin_token(client)
    assert client.post("/api/v1/admin/customers/Member A/archive", headers=_auth(admin)).status_code == 200
    assert client.get("/api/v1/profile/inbody", headers=_auth(member)).status_code == 401
    res = client.post("/api/v1/auth/login", json={"phone_number": "0900000001", "password": "pass-a"})
    assert res.status_code == 403


# ── Push ───────────────────────────────────────────────────────────────────


def test_member_token_cannot_subscribe_to_trainer_push(client):
    token = _member_token(client)
    body = {"endpoint": "https://push.example/x", "keys": {"p256dh": "k", "auth": "a"}, "is_trainer": True}
    assert client.post("/api/v1/push/subscribe", json=body, headers=_auth(token)).status_code == 401


def test_push_subscription_is_bound_to_token_account(client):
    token = _member_token(client)  # Member A
    body = {
        "endpoint": "https://push.example/y",
        "keys": {"p256dh": "k", "auth": "a"},
        "customer_id": "Member B",
    }
    with patch("src.api.push.subscribe", return_value={"success": True}) as sub:
        assert client.post("/api/v1/push/subscribe", json=body, headers=_auth(token)).status_code == 200
    assert sub.call_args.kwargs["customer_id"] == "Member A"

"""Coach (admin) account seeding from ADMIN_USERNAME / ADMIN_PASSWORD."""

import pytest
from passlib.context import CryptContext

import src.db.mongo as mongo
from src.config.settings import get_settings
from src.init_db import seed

_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


class FakeCollection:
    """Just enough of a PyMongo collection for the seeder."""

    def __init__(self, docs=None):
        self.docs = list(docs or [])

    def find_one(self, query):
        return next((d for d in self.docs if all(d.get(k) == v for k, v in query.items())), None)

    def insert_one(self, doc):
        self.docs.append(dict(doc))

    def update_one(self, query, update):
        doc = self.find_one(query)
        if doc is not None:
            doc.update(update["$set"])


@pytest.fixture
def coll(monkeypatch):
    fake = FakeCollection()
    monkeypatch.setattr(mongo, "personal_trainers_collection", lambda: fake)
    return fake


@pytest.fixture
def env(monkeypatch):
    def _set(username: str, password: str):
        monkeypatch.setenv("ADMIN_USERNAME", username)
        monkeypatch.setenv("ADMIN_PASSWORD", password)
        get_settings.cache_clear()

    yield _set
    get_settings.cache_clear()


def test_skips_when_credentials_are_not_configured(coll, env):
    env("", "")
    assert seed.seed_admin_trainer() == "skipped"
    assert coll.docs == []


def test_creates_the_account_from_env_with_a_hashed_password(coll, env):
    env("coach.minh", "s3cure-pass")
    assert seed.seed_admin_trainer() == "created"
    (doc,) = coll.docs
    assert doc["id"] == seed.ADMIN_TRAINER_ID
    assert doc["name"] == "coach.minh"
    assert doc["password"] != "s3cure-pass"
    assert _pwd.verify("s3cure-pass", doc["password"])


def test_replaces_the_old_hardcoded_login_and_keeps_the_internal_id(coll, env):
    coll.docs.append({"id": "admin", "name": "admin", "password": _pwd.hash("123"), "age": 30})
    env("coach.minh", "s3cure-pass")
    assert seed.seed_admin_trainer() == "updated"
    (doc,) = coll.docs
    assert doc["id"] == "admin"
    assert doc["name"] == "coach.minh"
    assert _pwd.verify("s3cure-pass", doc["password"])
    assert not _pwd.verify("123", doc["password"])
    assert doc["age"] == 30  # other fields untouched


def test_is_idempotent_when_env_and_db_already_agree(coll, env):
    env("coach.minh", "s3cure-pass")
    seed.seed_admin_trainer()
    stored = coll.docs[0]["password"]
    assert seed.seed_admin_trainer() == "unchanged"
    assert coll.docs[0]["password"] == stored  # no needless re-hash

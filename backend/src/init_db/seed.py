"""Seed baseline records (idempotent).

The coach (admin) account is configured from the environment, not hardcoded:

    ADMIN_USERNAME=...   # login name (Personal_Trainer.name)
    ADMIN_PASSWORD=...   # plain text in backend/env/.env; stored bcrypt-hashed

On every startup the account is created if missing and brought in line with
those values (name + password), so the env file is the single source of truth
and changing it then restarting the container is how the credentials rotate.
The record keeps the stable internal id ``admin`` so existing references to it
(trainer notes, CMS ``updated_by``) stay valid when the login name changes.
"""

import logging

from passlib.context import CryptContext

from src.config.settings import get_settings

logger = logging.getLogger(__name__)

_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Stable internal key of the coach account — not a credential. The login name
# and password come from ADMIN_USERNAME / ADMIN_PASSWORD.
ADMIN_TRAINER_ID = "admin"
MIN_ADMIN_PASSWORD_LENGTH = 8


def _password_matches(plain: str, stored_hash: str) -> bool:
    try:
        return bool(stored_hash) and _pwd.verify(plain, stored_hash)
    except ValueError:  # unknown / corrupt hash
        return False


def seed_admin_trainer() -> str:
    """Create or sync the coach account from ADMIN_USERNAME / ADMIN_PASSWORD.

    Returns what happened: ``"skipped"`` (env not set), ``"created"``,
    ``"updated"`` or ``"unchanged"``. Never raises for missing config — it logs
    and leaves the database as it is, so the API still boots.
    """
    settings = get_settings()
    username = settings.admin_username.strip()
    password = settings.admin_password

    if not username or not password:
        logger.warning(
            "ADMIN_USERNAME / ADMIN_PASSWORD are not set in backend/env/.env — "
            "the coach account was not created or updated."
        )
        return "skipped"
    if len(password) < MIN_ADMIN_PASSWORD_LENGTH:
        logger.warning(
            "ADMIN_PASSWORD is shorter than %d characters — consider a longer one.",
            MIN_ADMIN_PASSWORD_LENGTH,
        )

    # Imported lazily to avoid a circular import during package initialization
    # (src.db.mongo → src.init_db → reset_database → seed).
    from src.db.mongo import personal_trainers_collection

    coll = personal_trainers_collection()
    existing = coll.find_one({"id": ADMIN_TRAINER_ID})

    if existing is None:
        coll.insert_one(
            {
                "id": ADMIN_TRAINER_ID,
                "name": username,
                "age": 30,
                "address": "Renfit Gym",
                "phone_number": "0000000000",
                "password": _pwd.hash(password),
            }
        )
        logger.info("Coach account '%s' created from environment.", username)
        return "created"

    changes: dict = {}
    if existing.get("name") != username:
        changes["name"] = username
    if not _password_matches(password, existing.get("password", "")):
        changes["password"] = _pwd.hash(password)
    if not changes:
        return "unchanged"

    coll.update_one({"id": ADMIN_TRAINER_ID}, {"$set": changes})
    logger.info(
        "Coach account synced from environment (%s).",
        ", ".join("password" if k == "password" else f"name → '{username}'" for k in changes),
    )
    return "updated"

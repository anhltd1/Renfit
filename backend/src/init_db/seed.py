"""Seed baseline records (idempotent)."""

from passlib.context import CryptContext

_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Default coach account used during the testing phase.
# Login uses `name` as the username and the bcrypt-hashed password below.
ADMIN_TRAINER_ID = "admin"
ADMIN_TRAINER_NAME = "admin"
ADMIN_TRAINER_PASSWORD = "123"


def seed_admin_trainer() -> None:
    """Insert the default admin coach into Personal_Trainer if missing.

    Idempotent: only creates the record when it does not already exist so an
    existing (possibly password-changed) account is never overwritten.
    """
    # Imported lazily to avoid a circular import during package initialization
    # (src.db.mongo → src.init_db → reset_database → seed).
    from src.db.mongo import personal_trainers_collection

    coll = personal_trainers_collection()
    if coll.find_one({"id": ADMIN_TRAINER_ID}) is not None:
        return

    coll.insert_one(
        {
            "id": ADMIN_TRAINER_ID,
            "name": ADMIN_TRAINER_NAME,
            "age": 30,
            "address": "Renfit Gym",
            "phone_number": "0000000000",
            "password": _pwd.hash(ADMIN_TRAINER_PASSWORD),
        }
    )

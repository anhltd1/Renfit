"""Collection accessors for the Renfit MongoDB database."""

from pymongo.collection import Collection

from src.init_db.database import get_renfit_database
from src.schema import collections as col


def customers_collection() -> Collection:
    return get_renfit_database()[col.CUSTOMER]


def bookings_collection() -> Collection:
    return get_renfit_database()[col.BOOKINGS]


def personal_trainers_collection() -> Collection:
    return get_renfit_database()[col.PERSONAL_TRAINER]


def inbody_collection() -> Collection:
    return get_renfit_database()[col.INBODY]


def notifications_collection() -> Collection:
    return get_renfit_database()[col.NOTIFICATION]


def trainer_notifications_collection() -> Collection:
    return get_renfit_database()[col.TRAINER_NOTIFICATION]


def trainer_notes_collection() -> Collection:
    return get_renfit_database()[col.TRAINER_NOTE]


def blocked_slots_collection() -> Collection:
    return get_renfit_database()[col.BLOCKED_SLOT]


def push_subscriptions_collection() -> Collection:
    return get_renfit_database()[col.PUSH_SUBSCRIPTION]


def site_content_collection() -> Collection:
    return get_renfit_database()[col.SITE_CONTENT]


def inbody_photos_collection() -> Collection:
    return get_renfit_database()[col.INBODY_PHOTO]


def auth_sessions_collection() -> Collection:
    return get_renfit_database()[col.AUTH_SESSION]

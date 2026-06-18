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

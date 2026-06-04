"""Connect to the Renfit MongoDB database (uses backend/env/.env)."""

from pymongo import MongoClient
from pymongo.database import Database

from src.config.settings import get_settings

DEFAULT_DB_NAME = "renfit"


def get_mongo_client() -> MongoClient:
    settings = get_settings()
    uri = settings.mongodb_uri.strip()
    if not uri:
        raise RuntimeError(
            "MONGODB_URI is not set. Add it to backend/env/.env before connecting."
        )
    return MongoClient(uri)


def get_renfit_database(client: MongoClient | None = None) -> Database:
    """Return the Renfit database handle (default name: renfit)."""
    settings = get_settings()
    db_name = settings.db_name.strip() or DEFAULT_DB_NAME
    if client is None:
        client = get_mongo_client()
    return client[db_name]

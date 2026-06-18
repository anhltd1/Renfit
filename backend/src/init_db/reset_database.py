"""
Drop the Renfit database and recreate all collections with validators and indexes.

Run from backend/:
    python -m src.init_db.reset_database
"""

from pymongo import MongoClient
from pymongo.errors import PyMongoError

from src.config.settings import get_settings
from src.init_db.database import DEFAULT_DB_NAME, get_mongo_client
from src.init_db.seed import seed_admin_trainer
from src.schema.mongo import COLLECTION_SPECS, VALIDATION_OPTIONS


def drop_and_create_collections(client: MongoClient, db_name: str) -> None:
    print(f'Dropping database "{db_name}" (if it exists)...')
    client.drop_database(db_name)
    print("  drop_database completed.\n")

    db = client[db_name]

    for spec in COLLECTION_SPECS:
        name = spec["name"]
        print(f'Creating collection "{name}" with JSON Schema validation...')
        db.create_collection(
            name,
            validator=spec["validator"],
            **VALIDATION_OPTIONS,
        )
        print(f'  Collection "{name}" created.')

        collection = db[name]
        print(f'  Creating indexes for "{name}"...')
        for index in spec["indexes"]:
            keys = index["keys"]
            opts = {k: v for k, v in index.items() if k != "keys"}
            index_name = collection.create_index(keys, **opts)
            print(f'    Index "{index_name}" on {dict(keys)}')
        print()


def reset_database() -> None:
    settings = get_settings()
    db_name = settings.db_name.strip() or DEFAULT_DB_NAME

    client = get_mongo_client()
    try:
        print("Connecting to MongoDB...")
        client.admin.command("ping")
        print("Connected.\n")

        drop_and_create_collections(client, db_name)

        print('Seeding default admin coach into "Personal_Trainer"...')
        seed_admin_trainer()
        print("  admin coach seeded (username: admin / password: 123).\n")

        print("SUCCESS: Renfit database initialized.")
        print(f"  Database: {db_name}")
        print(
            "  Collections: "
            + ", ".join(s["name"] for s in COLLECTION_SPECS)
        )
    finally:
        client.close()
        print("\nMongoDB connection closed.")


def main() -> None:
    try:
        reset_database()
    except (PyMongoError, RuntimeError) as exc:
        print(f"\nFAILED: {exc}")
        raise SystemExit(1) from exc


if __name__ == "__main__":
    main()

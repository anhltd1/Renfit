"""MongoDB JSON Schema validators and index definitions."""

from typing import Any

from src.schema import collections as col

NUMBER_BSON = ["int", "long", "double", "decimal"]
DATE_OR_STRING = ["date", "string"]

VALIDATION_OPTIONS: dict[str, str] = {
    "validationLevel": "strict",
    "validationAction": "error",
}

CollectionSpec = dict[str, Any]


def _spec(
    name: str,
    validator: dict[str, Any],
    indexes: list[dict[str, Any]],
) -> CollectionSpec:
    return {"name": name, "validator": validator, "indexes": indexes}


# Also ensured on every startup (main.py) so databases created before the
# InbodyPhoto collection existed get the indexes without a reset.
INBODY_PHOTO_INDEXES: list[dict[str, Any]] = [
    {"keys": [("id", 1)], "unique": True, "name": "inbody_photo_id_unique"},
    {"keys": [("inbody_id", 1)], "name": "inbody_photo_inbody"},
]

COLLECTION_SPECS: list[CollectionSpec] = [
    _spec(
        col.CUSTOMER,
        {
            "$jsonSchema": {
                "bsonType": "object",
                "required": [
                    "id",
                    "phone_number",
                    "health_note",
                    "goal",
                    "address",
                    "password",
                ],
                "properties": {
                    "id": {"bsonType": "string"},
                    "phone_number": {"bsonType": "string"},
                    "health_note": {"bsonType": "string"},
                    "goal": {"bsonType": "string"},
                    "address": {"bsonType": "string"},
                    "height": {"bsonType": "string"},
                    "weight": {"bsonType": "string"},
                    "avatar": {"bsonType": "string"},
                    "password": {"bsonType": "string"},
                    "age": {"bsonType": NUMBER_BSON},
                },
            }
        },
        [
            {"keys": [("id", 1)], "unique": True, "name": "customer_id_unique"},
            {
                "keys": [("phone_number", 1)],
                "unique": True,
                "name": "customer_phone_unique",
            },
        ],
    ),
    _spec(
        col.PERSONAL_TRAINER,
        {
            "$jsonSchema": {
                "bsonType": "object",
                "required": [
                    "id",
                    "name",
                    "age",
                    "address",
                    "phone_number",
                    "password",
                ],
                "properties": {
                    "id": {"bsonType": "string"},
                    "name": {"bsonType": "string"},
                    "age": {"bsonType": NUMBER_BSON},
                    "address": {"bsonType": "string"},
                    "phone_number": {"bsonType": "string"},
                    "password": {"bsonType": "string"},
                },
            }
        },
        [{"keys": [("id", 1)], "unique": True, "name": "trainer_id_unique"}],
    ),
    _spec(
        col.BOOKINGS,
        {
            "$jsonSchema": {
                "bsonType": "object",
                "required": [
                    "id",
                    "customer_id",
                    "trainer_id",
                    "time",
                    "status",
                    "note",
                ],
                "properties": {
                    "id": {"bsonType": "string"},
                    "customer_id": {"bsonType": "string"},
                    "trainer_id": {"bsonType": "string"},
                    "time": {"bsonType": DATE_OR_STRING},
                    "status": {
                        "enum": ["pending", "approved", "rejected", "completed", "no_show"]
                    },
                    "note": {"bsonType": "string"},
                },
            }
        },
        [
            {"keys": [("id", 1)], "unique": True, "name": "booking_id_unique"},
            {"keys": [("time", 1)], "name": "booking_time"},
            {
                "keys": [("customer_id", 1), ("time", 1)],
                "name": "booking_customer_time",
            },
        ],
    ),
    _spec(
        col.INBODY,
        {
            "$jsonSchema": {
                "bsonType": "object",
                "required": [
                    "id",
                    "customer_id",
                    "height",
                    "weight",
                    "date_recorded",
                    "SMM",
                    "BFM",
                ],
                "properties": {
                    "id": {"bsonType": "string"},
                    "customer_id": {"bsonType": "string"},
                    "height": {"bsonType": NUMBER_BSON},
                    "weight": {"bsonType": NUMBER_BSON},
                    "date_recorded": {"bsonType": DATE_OR_STRING},
                    "SMM": {"bsonType": NUMBER_BSON},
                    "BFM": {"bsonType": NUMBER_BSON},
                    "photo_ids": {"bsonType": "array", "items": {"bsonType": "string"}},
                },
            }
        },
        [{"keys": [("id", 1)], "unique": True, "name": "inbody_id_unique"}],
    ),
    _spec(
        col.INBODY_PHOTO,
        {
            "$jsonSchema": {
                "bsonType": "object",
                "required": ["id", "inbody_id", "customer_id", "content_type", "data", "created_at"],
                "properties": {
                    "id": {"bsonType": "string"},
                    "inbody_id": {"bsonType": "string"},
                    "customer_id": {"bsonType": "string"},
                    "content_type": {"enum": ["image/jpeg", "image/png", "image/webp"]},
                    "data": {"bsonType": "binData"},
                    "created_at": {"bsonType": DATE_OR_STRING},
                },
            }
        },
        INBODY_PHOTO_INDEXES,
    ),
    _spec(
        col.CHAT_SESSION,
        {
            "$jsonSchema": {
                "bsonType": "object",
                "required": [
                    "id",
                    "participant_type",
                    "participant_id",
                    "agent_type",
                    "status",
                    "created_at",
                    "updated_at",
                ],
                "properties": {
                    "id": {"bsonType": "string"},
                    "participant_type": {"enum": ["customer", "trainer"]},
                    "participant_id": {"bsonType": "string"},
                    "agent_type": {
                        "enum": ["customer_coach", "trainer_coach"],
                    },
                    "title": {"bsonType": "string"},
                    "status": {"enum": ["active", "archived"]},
                    "created_at": {"bsonType": DATE_OR_STRING},
                    "updated_at": {"bsonType": DATE_OR_STRING},
                },
            }
        },
        [
            {"keys": [("id", 1)], "unique": True, "name": "chat_session_id_unique"},
            {
                "keys": [
                    ("participant_type", 1),
                    ("participant_id", 1),
                    ("updated_at", -1),
                ],
                "name": "chat_session_participant_updated",
            },
            {
                "keys": [("participant_id", 1), ("agent_type", 1)],
                "name": "chat_session_participant_agent",
            },
        ],
    ),
    _spec(
        col.CHAT_MESSAGE,
        {
            "$jsonSchema": {
                "bsonType": "object",
                "required": [
                    "id",
                    "session_id",
                    "role",
                    "content",
                    "sequence",
                    "created_at",
                ],
                "properties": {
                    "id": {"bsonType": "string"},
                    "session_id": {"bsonType": "string"},
                    "role": {"enum": ["user", "assistant", "system"]},
                    "content": {
                        "bsonType": ["string", "object", "array"],
                        "description": "Text or structured message payload",
                    },
                    "sequence": {"bsonType": NUMBER_BSON},
                    "created_at": {"bsonType": DATE_OR_STRING},
                },
            }
        },
        [
            {"keys": [("id", 1)], "unique": True, "name": "chat_message_id_unique"},
            {
                "keys": [("session_id", 1), ("sequence", 1)],
                "unique": True,
                "name": "chat_message_session_sequence_unique",
            },
            {
                "keys": [("session_id", 1), ("created_at", 1)],
                "name": "chat_message_session_created",
            },
        ],
    ),
    _spec(
        col.NOTIFICATION,
        {
            "$jsonSchema": {
                "bsonType": "object",
                "required": [
                    "id",
                    "customer_id",
                    "type",
                    "title",
                    "message",
                    "target",
                    "related_id",
                    "read",
                    "created_at",
                ],
                "properties": {
                    "id": {"bsonType": "string"},
                    "customer_id": {"bsonType": "string"},
                    "type": {
                        "enum": [
                            "booking_approved",
                            "session_reminder",
                            "inbody_added",
                        ],
                    },
                    "title": {"bsonType": "string"},
                    "message": {"bsonType": "string"},
                    "target": {"bsonType": "string"},
                    "related_id": {"bsonType": "string"},
                    "read": {"bsonType": "bool"},
                    "created_at": {"bsonType": DATE_OR_STRING},
                    "read_at": {"bsonType": [*DATE_OR_STRING, "null"]},
                },
            }
        },
        [
            {"keys": [("id", 1)], "unique": True, "name": "notification_id_unique"},
            {
                "keys": [("customer_id", 1), ("created_at", -1)],
                "name": "notification_customer_created",
            },
            {
                "keys": [("customer_id", 1), ("read", 1)],
                "name": "notification_customer_read",
            },
            # Idempotency: never insert a second notification of the same
            # type for the same related record (booking/inbody).
            {
                "keys": [("type", 1), ("related_id", 1)],
                "unique": True,
                "name": "notification_type_related_unique",
            },
        ],
    ),
    _spec(
        col.TRAINER_NOTIFICATION,
        {
            "$jsonSchema": {
                "bsonType": "object",
                "required": [
                    "id",
                    "type",
                    "title",
                    "message",
                    "target",
                    "related_id",
                    "read",
                    "created_at",
                ],
                "properties": {
                    "id": {"bsonType": "string"},
                    "type": {
                        "enum": [
                            "booking_created",
                            "booking_cancelled",
                            "trainee_registered",
                        ],
                    },
                    "title": {"bsonType": "string"},
                    "message": {"bsonType": "string"},
                    "target": {"bsonType": "string"},
                    "related_id": {"bsonType": "string"},
                    "read": {"bsonType": "bool"},
                    "created_at": {"bsonType": DATE_OR_STRING},
                    "read_at": {"bsonType": [*DATE_OR_STRING, "null"]},
                },
            }
        },
        [
            {
                "keys": [("id", 1)],
                "unique": True,
                "name": "trainer_notification_id_unique",
            },
            {
                "keys": [("created_at", -1)],
                "name": "trainer_notification_created",
            },
            {
                "keys": [("read", 1)],
                "name": "trainer_notification_read",
            },
            # Idempotency: never insert a second notification of the same
            # type for the same related record (booking/customer).
            {
                "keys": [("type", 1), ("related_id", 1)],
                "unique": True,
                "name": "trainer_notification_type_related_unique",
            },
        ],
    ),
]

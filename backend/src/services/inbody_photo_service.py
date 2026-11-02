"""InBody progress photos — validation, storage and lookup.

Photos arrive from the trainer's browser as base64 data-URLs (the project has no
multipart upload stack; images are compressed client-side first, same as avatars).
Each photo is decoded and stored as raw bytes in its own `InbodyPhoto` document so
that listing InBody records never drags megabytes of image data along. Clients get
a URL per photo (`photo_url`) and the browser fetches/caches each one individually.
"""

import base64
import binascii
import re
import uuid
from datetime import datetime, timezone

from bson.binary import Binary

from src.db.mongo import inbody_photos_collection
from src.schema.inbody import InbodyPhoto

MAX_PHOTOS_PER_RECORD = 6
MAX_PHOTO_BYTES = 2 * 1024 * 1024  # decoded size, per photo
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
PHOTO_URL_PREFIX = "/api/v1/inbody/photos/"

_DATA_URL_RE = re.compile(r"^data:(image/[a-zA-Z0-9.+-]+);base64,(.+)$", re.DOTALL)


class InvalidPhotoError(ValueError):
    """Raised with a Vietnamese, user-facing message when a photo is rejected."""


def parse_data_url(data_url: str) -> tuple[str, bytes]:
    """Decode a `data:image/...;base64,...` string into (content_type, bytes)."""
    match = _DATA_URL_RE.match((data_url or "").strip())
    if not match:
        raise InvalidPhotoError("Ảnh không hợp lệ. Vui lòng chọn lại ảnh.")
    content_type = match.group(1).lower()
    if content_type == "image/jpg":
        content_type = "image/jpeg"
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise InvalidPhotoError("Định dạng ảnh không được hỗ trợ. Chấp nhận: JPEG, PNG, WebP.")
    try:
        raw = base64.b64decode(match.group(2), validate=True)
    except (binascii.Error, ValueError) as exc:
        raise InvalidPhotoError("Ảnh không hợp lệ. Vui lòng chọn lại ảnh.") from exc
    if not raw:
        raise InvalidPhotoError("Ảnh không hợp lệ. Vui lòng chọn lại ảnh.")
    if len(raw) > MAX_PHOTO_BYTES:
        raise InvalidPhotoError("Mỗi ảnh tối đa 2MB.")
    return content_type, raw


def validate_photos(data_urls: list[str]) -> list[tuple[str, bytes]]:
    """Validate the whole batch up front so a bad photo never leaves partial writes."""
    if len(data_urls) > MAX_PHOTOS_PER_RECORD:
        raise InvalidPhotoError(f"Tối đa {MAX_PHOTOS_PER_RECORD} ảnh cho mỗi lần đo.")
    return [parse_data_url(u) for u in data_urls]


def save_photos(
    *, inbody_id: str, customer_id: str, photos: list[tuple[str, bytes]]
) -> list[str]:
    """Insert already-validated photos and return their ids in order."""
    if not photos:
        return []
    now = datetime.now(timezone.utc)
    docs = []
    ids: list[str] = []
    for content_type, raw in photos:
        photo = InbodyPhoto(
            id=str(uuid.uuid4()),
            inbody_id=inbody_id,
            customer_id=customer_id,
            content_type=content_type,
            data=raw,
            created_at=now,
        )
        doc = photo.model_dump()
        doc["data"] = Binary(raw)
        docs.append(doc)
        ids.append(photo.id)
    inbody_photos_collection().insert_many(docs)
    return ids


def get_photo(photo_id: str) -> tuple[str, bytes] | None:
    """Return (content_type, bytes) for a photo id, or None if it doesn't exist."""
    doc = inbody_photos_collection().find_one(
        {"id": photo_id}, {"_id": 0, "content_type": 1, "data": 1}
    )
    if doc is None:
        return None
    return str(doc.get("content_type", "image/jpeg")), bytes(doc.get("data", b""))


def photo_urls(photo_ids: list[str] | None) -> list[str]:
    """Map stored photo ids to the URLs clients should load."""
    return [f"{PHOTO_URL_PREFIX}{pid}" for pid in (photo_ids or []) if pid]

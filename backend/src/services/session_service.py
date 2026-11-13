"""Opaque bearer-token sessions for trainers and customers.

Replaces the old MVP posture where the "token" was the account id itself
(guessable — the seeded coach id is literally "admin"). Login now issues a
random 256-bit token; only its SHA-256 hash is stored, so a database leak
does not leak usable sessions. Sessions expire after ``SESSION_TTL`` and
MongoDB's TTL index removes them (see ``AUTH_SESSION_INDEXES``).
"""

import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Literal

from src.db.mongo import auth_sessions_collection

SessionKind = Literal["trainer", "customer"]

SESSION_TTL = timedelta(days=30)


def _hash(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_session(kind: SessionKind, subject_id: str) -> str:
    """Create a session for ``subject_id`` and return the raw token (shown once)."""
    token = secrets.token_urlsafe(32)
    now = datetime.now(timezone.utc)
    auth_sessions_collection().insert_one(
        {
            "token_hash": _hash(token),
            "kind": kind,
            "subject_id": subject_id,
            "created_at": now,
            "expires_at": now + SESSION_TTL,
        }
    )
    return token


def resolve_session(token: str | None, kind: SessionKind) -> str | None:
    """Return the subject id for a valid, unexpired token of ``kind``, else None."""
    if not token:
        return None
    doc = auth_sessions_collection().find_one(
        {"token_hash": _hash(token), "kind": kind},
        {"_id": 0, "subject_id": 1, "expires_at": 1},
    )
    if not doc:
        return None
    expires = doc.get("expires_at")
    if isinstance(expires, datetime):
        if expires.tzinfo is None:  # PyMongo returns naive UTC by default
            expires = expires.replace(tzinfo=timezone.utc)
        if expires <= datetime.now(timezone.utc):
            return None  # TTL monitor runs ~every 60s; don't trust the gap
    return str(doc.get("subject_id", "")) or None


def revoke_session(token: str | None) -> None:
    """Delete the session for ``token`` (no-op if unknown)."""
    if token:
        auth_sessions_collection().delete_one({"token_hash": _hash(token)})


def revoke_all_for_subject(kind: SessionKind, subject_id: str) -> None:
    """Delete every session of one account (e.g. when a member is archived)."""
    auth_sessions_collection().delete_many({"kind": kind, "subject_id": subject_id})

"""Web Push notification delivery service.

Uses VAPID-based Web Push (pywebpush) to send notifications to subscribed
browsers/devices. Fire-and-forget: errors are logged but never fail the caller.
"""

import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Any

from src.config.settings import get_settings
from src.db.mongo import push_subscriptions_collection

logger = logging.getLogger(__name__)


def subscribe(
    *, endpoint: str, keys: dict, customer_id: str | None, is_trainer: bool
) -> dict[str, Any]:
    """Store or update a push subscription (upsert by endpoint)."""
    coll = push_subscriptions_collection()
    existing = coll.find_one({"endpoint": endpoint})
    if existing:
        # Update keys and association
        coll.update_one(
            {"endpoint": endpoint},
            {"$set": {"keys": keys, "customer_id": customer_id, "is_trainer": is_trainer}},
        )
        return {"success": True, "created": False}

    doc = {
        "id": str(uuid.uuid4()),
        "endpoint": endpoint,
        "keys": keys,
        "customer_id": customer_id,
        "is_trainer": is_trainer,
        "created_at": datetime.now(tz=timezone.utc).isoformat(),
    }
    coll.insert_one(doc)
    return {"success": True, "created": True}


def unsubscribe(*, endpoint: str) -> dict[str, Any]:
    """Remove a push subscription by endpoint."""
    result = push_subscriptions_collection().delete_one({"endpoint": endpoint})
    return {"success": True, "deleted": result.deleted_count > 0}


def _send_push(subscription_info: dict, payload: str) -> bool:
    """Send a single push notification. Returns True on success."""
    try:
        from pywebpush import webpush, WebPushException

        settings = get_settings()
        if not settings.vapid_private_key or not settings.vapid_public_key:
            logger.warning("VAPID keys not configured — skipping push delivery")
            return False

        webpush(
            subscription_info=subscription_info,
            data=payload,
            vapid_private_key=settings.vapid_private_key,
            vapid_claims={"sub": settings.vapid_contact_email},
        )
        return True
    except Exception as exc:
        logger.debug("Push delivery failed for %s: %s", subscription_info.get("endpoint", "?"), exc)
        # Remove invalid subscriptions (410 Gone = unsubscribed)
        status = getattr(exc, 'response', None)
        if status and hasattr(status, 'status_code') and status.status_code in (404, 410):
            push_subscriptions_collection().delete_one({"endpoint": subscription_info.get("endpoint")})
        return False


def send_to_customer(
    *, customer_id: str, title: str, body: str, url: str | None = None
) -> dict[str, Any]:
    """Send push to all subscriptions for a customer. Best-effort."""
    coll = push_subscriptions_collection()
    subs = list(coll.find({"customer_id": customer_id}, {"_id": 0}))
    if not subs:
        return {"sent": 0, "total": 0}

    payload = json.dumps({"title": title, "body": body, "url": url or "/"})
    sent = 0
    for sub in subs:
        info = {"endpoint": sub["endpoint"], "keys": sub.get("keys", {})}
        if _send_push(info, payload):
            sent += 1

    return {"sent": sent, "total": len(subs)}


def send_to_trainers(
    *, title: str, body: str, url: str | None = None
) -> dict[str, Any]:
    """Send push to all trainer subscriptions. Best-effort."""
    coll = push_subscriptions_collection()
    subs = list(coll.find({"is_trainer": True}, {"_id": 0}))
    if not subs:
        return {"sent": 0, "total": 0}

    payload = json.dumps({"title": title, "body": body, "url": url or "/admin/dashboard"})
    sent = 0
    for sub in subs:
        info = {"endpoint": sub["endpoint"], "keys": sub.get("keys", {})}
        if _send_push(info, payload):
            sent += 1

    return {"sent": sent, "total": len(subs)}

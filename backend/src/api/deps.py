"""Shared FastAPI auth dependencies.

Every authenticated request carries ``Authorization: Bearer <token>`` where the
token was issued at login (src/services/session_service.py). Identity always
comes from the token — never from a client-supplied ``customer_id``.
"""

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from src.db.mongo import customers_collection, personal_trainers_collection
from src.services.session_service import resolve_session

bearer = HTTPBearer(auto_error=False)

UNAUTHORIZED = "Không có quyền truy cập."
SESSION_EXPIRED = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."


def bearer_token(creds: HTTPAuthorizationCredentials | None = Depends(bearer)) -> str | None:
    return creds.credentials if creds else None


def require_trainer(token: str | None = Depends(bearer_token)) -> str:
    """Return the trainer id for a valid trainer session, else 401."""
    trainer_id = resolve_session(token, "trainer")
    if not trainer_id or personal_trainers_collection().find_one({"id": trainer_id}) is None:
        raise HTTPException(status_code=401, detail=UNAUTHORIZED)
    return trainer_id


def optional_customer(token: str | None = Depends(bearer_token)) -> str:
    """Customer id for a valid session, else "" — for public endpoints (the landing
    page) that add personal detail when logged in. Never raises: an expired token
    is treated as anonymous so public pages keep working."""
    customer_id = resolve_session(token, "customer")
    if not customer_id:
        return ""
    doc = customers_collection().find_one({"id": customer_id}, {"_id": 0, "active": 1})
    if doc is None or doc.get("active") is False:
        return ""
    return customer_id


def require_customer(token: str | None = Depends(bearer_token)) -> str:
    """Return the customer id for a valid session of an active member, else 401."""
    customer_id = resolve_session(token, "customer")
    if not customer_id:
        raise HTTPException(status_code=401, detail=SESSION_EXPIRED)
    doc = customers_collection().find_one({"id": customer_id}, {"_id": 0, "active": 1})
    if doc is None or doc.get("active") is False:
        raise HTTPException(status_code=401, detail=SESSION_EXPIRED)
    return customer_id

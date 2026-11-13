"""Push notification subscription endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from src.api.deps import UNAUTHORIZED, bearer_token
from src.config import get_settings
from src.db.mongo import customers_collection, personal_trainers_collection
from src.services.session_service import resolve_session
from src.services.push_service import subscribe, unsubscribe

router = APIRouter(prefix="/api/v1/push", tags=["push"])


class SubscribeRequest(BaseModel):
    endpoint: str = Field(..., description="Push service URL")
    keys: dict = Field(..., description="{ p256dh: str, auth: str }")
    customer_id: str | None = None
    is_trainer: bool = False


class UnsubscribeRequest(BaseModel):
    endpoint: str = Field(..., description="Push service URL to remove")


@router.get("/vapid-public-key")
def get_vapid_public_key() -> dict:
    """Return the VAPID public key for frontend push subscription."""
    settings = get_settings()
    return {"public_key": settings.vapid_public_key}


@router.post("/subscribe")
def push_subscribe(body: SubscribeRequest, token: str | None = Depends(bearer_token)) -> dict:
    """Register a push subscription for the session's trainer or customer.

    ``is_trainer`` picks which session kind the token must be; the body's
    ``customer_id`` is ignored — the subscription is bound to the token's
    account so nobody can receive another person's notifications.
    """
    if body.is_trainer:
        trainer_id = resolve_session(token, "trainer")
        if not trainer_id or personal_trainers_collection().find_one({"id": trainer_id}) is None:
            raise HTTPException(status_code=401, detail=UNAUTHORIZED)
        customer_id = None
    else:
        customer_id = resolve_session(token, "customer")
        if not customer_id or customers_collection().find_one({"id": customer_id}) is None:
            raise HTTPException(status_code=401, detail=UNAUTHORIZED)
    return subscribe(
        endpoint=body.endpoint,
        keys=body.keys,
        customer_id=customer_id,
        is_trainer=body.is_trainer,
    )


@router.post("/unsubscribe")
def push_unsubscribe(body: UnsubscribeRequest) -> dict:
    """Remove a push subscription."""
    return unsubscribe(endpoint=body.endpoint)

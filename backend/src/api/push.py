"""Push notification subscription endpoints."""

from fastapi import APIRouter
from pydantic import BaseModel, Field

from src.config import get_settings
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
def push_subscribe(body: SubscribeRequest) -> dict:
    """Register a push subscription."""
    return subscribe(
        endpoint=body.endpoint,
        keys=body.keys,
        customer_id=body.customer_id,
        is_trainer=body.is_trainer,
    )


@router.post("/unsubscribe")
def push_unsubscribe(body: UnsubscribeRequest) -> dict:
    """Remove a push subscription."""
    return unsubscribe(endpoint=body.endpoint)

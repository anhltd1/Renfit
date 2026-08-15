"""PushSubscription collection document model."""

from pydantic import BaseModel, Field


class PushSubscription(BaseModel):
    """Maps to MongoDB collection `PushSubscription`.

    Stores Web Push subscription endpoints for push notification delivery.
    Multiple subscriptions per customer (multi-device support).
    """

    id: str = Field(..., description="Unique subscription id (app-generated string)")
    endpoint: str = Field(..., description="Push service URL (unique per subscription)")
    keys: dict = Field(..., description="{ p256dh: str, auth: str }")
    customer_id: str | None = Field(None, description="Customer.id — null for trainer subscriptions")
    is_trainer: bool = False
    created_at: str = Field(..., description="ISO datetime of creation")

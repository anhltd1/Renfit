"""Customer-facing notification endpoints.

Authentication mirrors the existing profile/booking endpoints (MVP, no JWT):
the customer id is supplied by the client. See ``backend/docs/notifications.md``
for the full design.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from src.services.notification_service import (
    list_notifications,
    mark_all_read,
    mark_read,
    unread_count,
)

router = APIRouter(prefix="/api/v1/notifications", tags=["notifications"])


class NotificationOut(BaseModel):
    id: str
    customer_id: str
    type: str
    title: str
    message: str
    target: str
    related_id: str
    read: bool
    created_at: str
    read_at: str | None = None


class MarkAllReadRequest(BaseModel):
    customer_id: str = Field(..., description="Customer.id")


@router.get("", response_model=list[NotificationOut])
def get_notifications(customer_id: str = "", unread_only: bool = False) -> list[NotificationOut]:
    if not customer_id.strip():
        raise HTTPException(status_code=400, detail="customer_id is required.")
    docs = list_notifications(customer_id=customer_id, unread_only=unread_only)
    return [NotificationOut(**doc) for doc in docs]


@router.get("/unread-count")
def get_unread_count(customer_id: str = "") -> dict:
    if not customer_id.strip():
        raise HTTPException(status_code=400, detail="customer_id is required.")
    return {"count": unread_count(customer_id=customer_id)}


@router.post("/{notification_id}/read")
def mark_notification_read(notification_id: str, customer_id: str) -> dict:
    if not customer_id.strip():
        raise HTTPException(status_code=400, detail="customer_id is required.")
    result = mark_read(notification_id=notification_id, customer_id=customer_id)
    if not result.get("success"):
        raise HTTPException(status_code=404, detail=result.get("message", "Không tìm thấy thông báo."))
    return result


@router.post("/read-all")
def mark_all_notifications_read(body: MarkAllReadRequest) -> dict:
    result = mark_all_read(customer_id=body.customer_id)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("message", "Không thể cập nhật."))
    return result

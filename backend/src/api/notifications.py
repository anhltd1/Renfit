"""Customer-facing notification endpoints.

The customer is identified by their session token (``require_customer``);
any client-supplied ``customer_id`` is ignored. See ``backend/docs/notifications.md``
for the full design.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from src.api.deps import require_customer

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


@router.get("", response_model=list[NotificationOut])
def get_notifications(
    unread_only: bool = False, customer_id: str = Depends(require_customer)
) -> list[NotificationOut]:
    docs = list_notifications(customer_id=customer_id, unread_only=unread_only)
    return [NotificationOut(**doc) for doc in docs]


@router.get("/unread-count")
def get_unread_count(customer_id: str = Depends(require_customer)) -> dict:
    return {"count": unread_count(customer_id=customer_id)}


@router.post("/{notification_id}/read")
def mark_notification_read(
    notification_id: str, customer_id: str = Depends(require_customer)
) -> dict:
    result = mark_read(notification_id=notification_id, customer_id=customer_id)
    if not result.get("success"):
        raise HTTPException(status_code=404, detail=result.get("message", "Không tìm thấy thông báo."))
    return result


@router.post("/read-all")
def mark_all_notifications_read(customer_id: str = Depends(require_customer)) -> dict:
    result = mark_all_read(customer_id=customer_id)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("message", "Không thể cập nhật."))
    return result

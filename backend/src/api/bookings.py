"""Customer-facing booking endpoints.

The customer is identified by their session token (``require_customer``);
any client-supplied ``customer_id`` is ignored.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from src.api.deps import optional_customer, require_customer

from src.services.booking_service import (
    build_availability,
    cancel_customer_booking,
    create_customer_booking,
)

router = APIRouter(prefix="/api/v1/bookings", tags=["bookings"])


class CreateBookingRequest(BaseModel):
    time: str = Field(..., description="Slot key, e.g. '2026-06-15T08:00'")
    note: str = ""


class CancelBookingRequest(BaseModel):
    booking_id: str


@router.get("/availability")
def get_availability(customer_id: str = Depends(optional_customer)) -> dict:
    """Return the two-week booking grid with per-slot availability.

    Public: the landing page's TodayBoard shows anonymous visitors the open
    places (counts only, no names). With a valid member token the grid also
    carries that member's own ``my_status`` / ``my_booking_id``.
    """
    return build_availability(customer_id)


@router.post("", status_code=201)
def create_booking(
    body: CreateBookingRequest, customer_id: str = Depends(require_customer)
) -> dict:
    result = create_customer_booking(
        customer_id=customer_id,
        time=body.time,
        note=body.note,
    )
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("message", "Đặt lịch thất bại."))
    return result


@router.post("/cancel")
def cancel_booking(
    body: CancelBookingRequest, customer_id: str = Depends(require_customer)
) -> dict:
    result = cancel_customer_booking(
        customer_id=customer_id,
        booking_id=body.booking_id,
    )
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("message", "Hủy lịch thất bại."))
    return result

"""Customer-facing booking endpoints.

Authentication mirrors the existing profile endpoints (MVP, no JWT): the
customer id (their name) is supplied by the client.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from src.services.booking_service import (
    build_availability,
    cancel_customer_booking,
    create_customer_booking,
)

router = APIRouter(prefix="/api/v1/bookings", tags=["bookings"])


class CreateBookingRequest(BaseModel):
    customer_id: str = Field(..., description="Customer.id (name)")
    time: str = Field(..., description="Slot key, e.g. '2026-06-15T08:00'")
    note: str = ""


class CancelBookingRequest(BaseModel):
    customer_id: str
    booking_id: str


@router.get("/availability")
def get_availability(customer_id: str = "") -> dict:
    """Return the two-week booking grid with per-slot availability."""
    return build_availability(customer_id.strip())


@router.post("", status_code=201)
def create_booking(body: CreateBookingRequest) -> dict:
    result = create_customer_booking(
        customer_id=body.customer_id,
        time=body.time,
        note=body.note,
    )
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("message", "Đặt lịch thất bại."))
    return result


@router.post("/cancel")
def cancel_booking(body: CancelBookingRequest) -> dict:
    result = cancel_customer_booking(
        customer_id=body.customer_id,
        booking_id=body.booking_id,
    )
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("message", "Hủy lịch thất bại."))
    return result

"""Booking record — maps to Google Sheet 2 (Bookings)."""

from enum import Enum

from pydantic import BaseModel, Field


class BookingStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"


class Booking(BaseModel):
    """Training session booking stored in the Bookings spreadsheet."""

    customer_name: str = Field(..., description="Customer who booked the session")
    trainer: str = Field(..., description="Personal trainer for the session")
    date: str = Field(..., description="Training date (sheet: Date format)")
    time: str = Field(..., description="Training start time (sheet: Time format)")
    status: BookingStatus = Field(
        default=BookingStatus.PENDING,
        description="pending | confirmed | cancelled | no_show",
    )
    note: str = Field(default="", description="Additional booking notes")

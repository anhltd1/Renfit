"""Bookings collection document model."""

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class BookingStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"   # trainer accepted the booking
    REJECTED = "rejected"
    COMPLETED = "completed"  # attendance: member attended ("Đã tập")
    NO_SHOW = "no_show"      # attendance: member did not show up ("Vắng")


class Booking(BaseModel):
    """Maps to MongoDB collection `Bookings`."""

    id: str = Field(..., description="Unique booking id (app-generated string)")
    customer_id: str = Field(..., description="References Customer.id")
    trainer_id: str = Field(..., description="References Personal_Trainer.id")
    time: datetime | str
    status: BookingStatus
    note: str = ""

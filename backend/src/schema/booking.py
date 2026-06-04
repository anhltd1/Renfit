"""Bookings collection document model."""

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class BookingStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class Booking(BaseModel):
    """Maps to MongoDB collection `Bookings`."""

    customer_id: str = Field(..., description="References Customer.id")
    trainer_id: str = Field(..., description="References Personal_Trainer.id")
    time: datetime | str
    status: BookingStatus
    note: str = ""

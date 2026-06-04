"""Inbody measurement collection document model."""

from datetime import datetime

from pydantic import BaseModel, Field


class Inbody(BaseModel):
    """Maps to MongoDB collection `Inbody`."""

    id: str = Field(..., description="Unique record id (app-generated string)")
    customer_id: str = Field(..., description="References Customer.id")
    height: float
    weight: float
    date_recorded: datetime | str
    SMM: float = Field(..., description="Skeletal muscle mass")
    BFM: float = Field(..., description="Body fat mass")

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
    photo_ids: list[str] = Field(
        default_factory=list,
        description="Ordered InbodyPhoto.id list (first = cover). Binary lives in InbodyPhoto.",
    )


class InbodyPhoto(BaseModel):
    """Maps to MongoDB collection `InbodyPhoto` — one progress photo per document.

    Kept out of the `Inbody` document so listing records stays light; photos are
    streamed individually via `GET /api/v1/inbody/photos/{id}`.
    """

    id: str = Field(..., description="Unique photo id (uuid4, also the URL key)")
    inbody_id: str = Field(..., description="References Inbody.id")
    customer_id: str = Field(..., description="References Customer.id")
    content_type: str = Field(..., description="image/jpeg | image/png | image/webp")
    data: bytes = Field(..., description="Raw image bytes (stored as BSON binary)")
    created_at: datetime

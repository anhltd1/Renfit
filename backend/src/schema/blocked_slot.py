"""BlockedSlot collection document model."""

from pydantic import BaseModel, Field


class BlockedSlot(BaseModel):
    """Maps to MongoDB collection `BlockedSlot`.

    Represents a time range the PT has blocked off (gym closed, holiday,
    equipment maintenance). Individual hours or a full day.
    """

    id: str = Field(..., description="Unique blocked-slot id (app-generated string)")
    date: str = Field(..., description="ISO date, e.g. '2026-08-05'")
    hours: list[int] | str = Field(
        ...,
        description="List of blocked hours (e.g. [8,9,10]) or 'all' for full-day block",
    )
    reason: str = ""
    created_at: str = Field(..., description="ISO datetime of creation")
    created_by: str = Field(..., description="Trainer id who created the block")

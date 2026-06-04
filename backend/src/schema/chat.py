"""Chat API request/response models."""

from typing import Any, Literal

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    conversation_id: str | None = None
    form_data: dict[str, Any] = Field(default_factory=dict)


class ChatResponse(BaseModel):
    conversation_id: str
    type: Literal["text", "form_request", "booking_success", "customer_saved"]
    message: str
    form: str | None = None
    fields: list[str] | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)

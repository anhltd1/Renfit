"""Chat API request/response models."""

from typing import Any, Literal

from pydantic import BaseModel, Field

ArtifactKind = Literal[
    "profile",
    "inbody_progress",
    "booking_availability",
    "booking_confirmation",
    "booking_cancelled",
]


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    conversation_id: str | None = None
    customer_id: str | None = Field(
        default=None,
        description="Logged-in Customer.id — binds AI tools to this customer's own data.",
    )


class ChatArtifact(BaseModel):
    """A structured, renderable UI panel derived from the latest tool result.

    Artifacts are generated server-side from deterministic tool output — the
    model cannot fabricate one. They are always either a read-only display
    (profile, InBody progress, booking availability) or an action
    confirmation (booking made/cancelled). They are NEVER a data-entry form
    for personal information — profile edits happen on the Profile page,
    not in chat.
    """

    kind: ArtifactKind
    title: str
    data: dict[str, Any] = Field(default_factory=dict)


class ChatResponse(BaseModel):
    conversation_id: str
    message: str
    artifact: ChatArtifact | None = None
    suggestions: list[str] = Field(
        default_factory=list,
        description=(
            "Always exactly 3 clickable follow-up prompts for the chat input. "
            "See services/ai/suggestions.py for how they're generated."
        ),
    )
    metadata: dict[str, Any] = Field(default_factory=dict)

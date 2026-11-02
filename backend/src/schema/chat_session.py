"""Chat session and message models for customer vs trainer AI agents."""

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class ChatParticipantType(str, Enum):
    """Who owns this chat session."""

    CUSTOMER = "customer"
    TRAINER = "trainer"


class ChatAgentType(str, Enum):
    """Which agent/tooling profile powers the session."""

    CUSTOMER_COACH = "customer_coach"
    TRAINER_COACH = "trainer_coach"


class ChatSessionStatus(str, Enum):
    ACTIVE = "active"
    ARCHIVED = "archived"


class ChatMessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class ChatSession(BaseModel):
    """
    One conversation thread (customer AI coach or trainer AI assistant).

    `participant_id` is Customer.id or Personal_Trainer.id depending on
    `participant_type`. `agent_type` selects tools/prompts for that role.
    """

    id: str = Field(..., description="Unique session id (app-generated string)")
    participant_type: ChatParticipantType
    participant_id: str = Field(
        ...,
        description="Customer.id or Personal_Trainer.id",
    )
    agent_type: ChatAgentType = Field(
        ...,
        description="customer_coach | trainer_coach — different tools per role",
    )
    title: str = ""
    status: ChatSessionStatus = ChatSessionStatus.ACTIVE
    created_at: datetime | str
    updated_at: datetime | str


class ChatMessage(BaseModel):
    """Single turn in a chat session (ordered by created_at / sequence)."""

    id: str = Field(..., description="Unique message id (app-generated string)")
    session_id: str = Field(..., description="References ChatSession.id")
    role: ChatMessageRole
    content: str | dict | list = Field(
        ...,
        description="Plain text or structured blocks (e.g. OpenAI message content)",
    )
    sequence: int = Field(
        ...,
        ge=0,
        description="Monotonic order within the session (0-based)",
    )
    created_at: datetime | str

"""Schemas for Renfit — MongoDB documents and API models."""

from src.schema.booking import Booking, BookingStatus
from src.schema.chat import ChatRequest, ChatResponse
from src.schema.chat_session import (
    ChatAgentType,
    ChatMessage,
    ChatMessageRole,
    ChatParticipantType,
    ChatSession,
    ChatSessionStatus,
)
from src.schema.collections import (
    ALL_COLLECTIONS,
    BOOKINGS,
    CHAT_MESSAGE,
    CHAT_SESSION,
    CUSTOMER,
    INBODY,
    PERSONAL_TRAINER,
)
from src.schema.customer import Customer
from src.schema.inbody import Inbody
from src.schema.mongo import COLLECTION_SPECS, VALIDATION_OPTIONS
from src.schema.personal_trainer import PersonalTrainer

__all__ = [
    "ChatRequest",
    "ChatResponse",
    "ALL_COLLECTIONS",
    "BOOKINGS",
    "CHAT_MESSAGE",
    "CHAT_SESSION",
    "COLLECTION_SPECS",
    "CUSTOMER",
    "INBODY",
    "PERSONAL_TRAINER",
    "VALIDATION_OPTIONS",
    "Booking",
    "BookingStatus",
    "ChatAgentType",
    "ChatMessage",
    "ChatMessageRole",
    "ChatParticipantType",
    "ChatSession",
    "ChatSessionStatus",
    "Customer",
    "Inbody",
    "PersonalTrainer",
]

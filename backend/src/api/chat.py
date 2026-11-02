"""Chat API routes."""

import openai
from fastapi import APIRouter, HTTPException

from src.schema.chat import ChatRequest, ChatResponse
from src.services.ai.agent import ChatAgent

router = APIRouter(tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
@router.post("/api/v1/chat", response_model=ChatResponse)
def post_chat(body: ChatRequest) -> ChatResponse:
    """
    Main AI chatbot endpoint.
    Processes message with tools (save customer, create booking) when needed.
    """
    try:
        agent = ChatAgent()
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    try:
        return agent.chat(
            message=body.message.strip(),
            conversation_id=body.conversation_id,
            customer_id=body.customer_id,
        )
    except openai.APIError as exc:
        raise HTTPException(
            status_code=502,
            detail="AI service error. Please try again later.",
        ) from exc

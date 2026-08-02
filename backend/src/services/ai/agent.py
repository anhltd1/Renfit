"""Anthropic agent with tool use, conversation memory, and artifact rendering.

The chat endpoint is only reachable by a logged-in customer (see
``AuthGuard`` on the frontend and ``ChatRequest.customer_id``). Every tool is
scoped server-side to that customer — the agent can only ever read that
customer's own profile/InBody/bookings, and it has no tool to write personal
info. Instead of ad-hoc inline forms, tool results are rendered as
structured **artifacts** (read-only panels or action confirmations) that the
frontend displays next to the reply.
"""

import uuid
from typing import Any

import anthropic

from src.config.settings import Settings, get_settings
from src.schema.chat import ChatArtifact, ChatResponse
from src.services.ai.memory import get_conversation_memory
from src.services.ai.prompts import build_system_prompt
from src.services.ai.suggestions import build_suggestions
from src.services.ai.tools import ANTHROPIC_TOOLS, execute_tool, tool_result_content

# Tool name -> artifact kind, in priority order (last matching tool call wins).
_ARTIFACT_KIND_BY_TOOL = {
    "get_my_profile": "profile",
    "get_my_inbody_history": "inbody_progress",
    "get_booking_availability": "booking_availability",
    "book_slot": "booking_confirmation",
    "cancel_booking": "booking_cancelled",
}

_ARTIFACT_TITLE = {
    "profile": "Hồ sơ của bạn",
    "inbody_progress": "Tiến độ InBody",
    "booking_availability": "Lịch tập còn trống",
    "booking_confirmation": "Đã đặt lịch tập",
    "booking_cancelled": "Đã hủy lịch tập",
}


class ChatAgent:
    def __init__(self, settings: Settings | None = None):
        self.settings = settings or get_settings()
        if not self.settings.anthropic_api_key:
            raise RuntimeError("ANTHROPIC_API_KEY is not set in env/.env")
        self.client = anthropic.Anthropic(api_key=self.settings.anthropic_api_key)
        self.memory = get_conversation_memory()

    def _extract_text(self, content_blocks: list[Any]) -> str:
        parts: list[str] = []
        for block in content_blocks:
            if getattr(block, "type", None) == "text":
                parts.append(block.text)
        return "\n".join(parts).strip()

    def _run_tool_loop(
        self,
        messages: list[dict[str, Any]],
        customer_id: str,
    ) -> tuple[str, list[dict[str, Any]]]:
        tool_results_log: list[dict[str, Any]] = []
        max_iterations = 8
        # Built once per chat() call (not per tool-loop iteration) so "today"
        # stays consistent within a single turn, but is always fresh for
        # each new request — never a stale value baked in at import time.
        system_prompt = build_system_prompt()

        for _ in range(max_iterations):
            response = self.client.messages.create(
                model=self.settings.anthropic_model,
                max_tokens=self.settings.anthropic_max_tokens,
                system=system_prompt,
                messages=messages,
                tools=ANTHROPIC_TOOLS,
            )

            assistant_content = response.content
            messages.append({"role": "assistant", "content": assistant_content})

            if response.stop_reason != "tool_use":
                text = self._extract_text(assistant_content)
                return text or "Xin lỗi, tôi chưa có phản hồi. Bạn thử hỏi lại nhé.", tool_results_log

            tool_use_blocks = [b for b in assistant_content if b.type == "tool_use"]
            result_blocks: list[dict[str, Any]] = []

            for block in tool_use_blocks:
                result = execute_tool(block.name, block.input, customer_id=customer_id)
                tool_results_log.append({"tool": block.name, "result": result})
                result_blocks.append(
                    {
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": tool_result_content(result),
                    }
                )

            messages.append({"role": "user", "content": result_blocks})

        return (
            "Xin lỗi, hệ thống xử lý quá nhiều bước. Vui lòng thử lại.",
            tool_results_log,
        )

    def _build_artifact(
        self, tool_results_log: list[dict[str, Any]]
    ) -> ChatArtifact | None:
        """Turn the last relevant, successful tool call into a UI artifact."""
        for entry in reversed(tool_results_log):
            kind = _ARTIFACT_KIND_BY_TOOL.get(entry["tool"])
            if kind is None:
                continue
            result = entry["result"]
            if not result.get("success"):
                continue
            return ChatArtifact(kind=kind, title=_ARTIFACT_TITLE[kind], data=result)
        return None

    def chat(
        self,
        message: str,
        conversation_id: str | None = None,
        customer_id: str | None = None,
    ) -> ChatResponse:
        conversation_id = conversation_id or str(uuid.uuid4())
        customer_id = (customer_id or "").strip()

        if not customer_id:
            return ChatResponse(
                conversation_id=conversation_id,
                message="Bạn cần đăng nhập để trò chuyện với Renfit AI Coach.",
                suggestions=build_suggestions(is_first_turn=True, tool_results_log=[]),
            )

        history = self.memory.get(conversation_id)
        is_first_turn = len(history) == 0
        messages = history + [{"role": "user", "content": message}]

        assistant_text, tool_results_log = self._run_tool_loop(
            messages, customer_id=customer_id
        )
        self.memory.extend(conversation_id, messages[len(history) :])

        return ChatResponse(
            conversation_id=conversation_id,
            message=assistant_text,
            artifact=self._build_artifact(tool_results_log),
            suggestions=build_suggestions(
                is_first_turn=is_first_turn, tool_results_log=tool_results_log
            ),
        )

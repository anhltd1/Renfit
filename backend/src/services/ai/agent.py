"""OpenAI agent with tool use, conversation memory, and artifact rendering.

The chat endpoint is only reachable by a logged-in customer (see
``AuthGuard`` on the frontend and ``ChatRequest.customer_id``). Every tool is
scoped server-side to that customer — the agent can only ever read that
customer's own profile/InBody/bookings, and it has no tool to write personal
info. Instead of ad-hoc inline forms, tool results are rendered as
structured **artifacts** (read-only panels or action confirmations) that the
frontend displays next to the reply.
"""

import json
import uuid
from typing import Any

import openai

from src.config.settings import Settings, get_settings
from src.schema.chat import ChatArtifact, ChatResponse
from src.services.ai.memory import get_conversation_memory
from src.services.ai.prompts import build_system_prompt
from src.services.ai.suggestions import build_suggestions
from src.services.ai.tools import OPENAI_TOOLS, execute_tool, tool_result_content

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
        if not self.settings.openai_api_key:
            raise RuntimeError("OPENAI_API_KEY is not set in env/.env")
        self.client = openai.OpenAI(api_key=self.settings.openai_api_key)
        self.memory = get_conversation_memory()

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

        # Prepend the system message for this request
        request_messages = [{"role": "system", "content": system_prompt}] + messages

        for _ in range(max_iterations):
            response = self.client.chat.completions.create(
                model=self.settings.openai_model,
                max_completion_tokens=self.settings.openai_max_tokens,
                messages=request_messages,
                tools=OPENAI_TOOLS,
                reasoning_effort="none",
            )

            choice = response.choices[0]
            assistant_message = choice.message

            # Build the assistant message dict to append to history
            assistant_msg_dict: dict[str, Any] = {
                "role": "assistant",
                "content": assistant_message.content or "",
            }
            if assistant_message.tool_calls:
                assistant_msg_dict["tool_calls"] = [
                    {
                        "id": tc.id,
                        "type": "function",
                        "function": {
                            "name": tc.function.name,
                            "arguments": tc.function.arguments,
                        },
                    }
                    for tc in assistant_message.tool_calls
                ]

            request_messages.append(assistant_msg_dict)

            # If no tool calls, we're done
            if not assistant_message.tool_calls:
                text = assistant_message.content or ""
                return (
                    text.strip() or "Xin lỗi, tôi chưa có phản hồi. Bạn thử hỏi lại nhé.",
                    tool_results_log,
                )

            # Execute each tool call and append results
            for tool_call in assistant_message.tool_calls:
                fn_name = tool_call.function.name
                try:
                    fn_args = json.loads(tool_call.function.arguments)
                except (json.JSONDecodeError, TypeError):
                    fn_args = {}

                result = execute_tool(fn_name, fn_args, customer_id=customer_id)
                tool_results_log.append({"tool": fn_name, "result": result})

                request_messages.append(
                    {
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "content": tool_result_content(result),
                    }
                )

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

        # Store only the user message and a simple assistant reply in memory
        # (tool call details are ephemeral to the request)
        new_messages = [{"role": "user", "content": message}]
        new_messages.append({"role": "assistant", "content": assistant_text})
        self.memory.extend(conversation_id, new_messages)

        return ChatResponse(
            conversation_id=conversation_id,
            message=assistant_text,
            artifact=self._build_artifact(tool_results_log),
            suggestions=build_suggestions(
                is_first_turn=is_first_turn, tool_results_log=tool_results_log
            ),
        )

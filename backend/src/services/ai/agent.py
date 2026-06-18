"""Anthropic agent with tool use and conversation memory."""

import json
import re
import uuid
from typing import Any

import anthropic

from src.config.settings import Settings, get_settings
from src.schema.chat import ChatResponse
from src.services.ai.memory import get_conversation_memory
from src.services.ai.prompts import (
    BOOKING_FORM_FIELDS,
    INTAKE_FORM_FIELDS,
    INTAKE_FORM_MESSAGE,
    SYSTEM_PROMPT,
)
from src.services.ai.tools import ANTHROPIC_TOOLS, execute_tool, tool_result_content
from src.services.booking_service import upsert_booking
from src.services.customer_service import find_customer_by_name, upsert_customer_info


_BOOKING_INTENT_KEYWORDS = (
    "đặt lịch",
    "dat lich",
    "đặt buổi",
    "dat buoi",
    "đặt lịch tập",
    "dat lich tap",
    "book lịch",
    "book lich",
    "hẹn tập",
    "hen tap",
    "lên lịch",
    "len lich",
    "muốn tập",
    "muon tap",
    "đăng ký tập",
    "dang ky tap",
    "schedule",
    "booking",
)


def _fold_vietnamese(text: str) -> str:
    """Lowercase and strip diacritics for intent matching."""
    text = text.lower()
    replacements = {
        "à": "a",
        "á": "a",
        "ả": "a",
        "ã": "a",
        "ạ": "a",
        "ă": "a",
        "ằ": "a",
        "ắ": "a",
        "ẳ": "a",
        "ẵ": "a",
        "ặ": "a",
        "â": "a",
        "ầ": "a",
        "ấ": "a",
        "ẩ": "a",
        "ẫ": "a",
        "ậ": "a",
        "è": "e",
        "é": "e",
        "ẻ": "e",
        "ẽ": "e",
        "ẹ": "e",
        "ê": "e",
        "ề": "e",
        "ế": "e",
        "ể": "e",
        "ễ": "e",
        "ệ": "e",
        "ì": "i",
        "í": "i",
        "ỉ": "i",
        "ĩ": "i",
        "ị": "i",
        "ò": "o",
        "ó": "o",
        "ỏ": "o",
        "õ": "o",
        "ọ": "o",
        "ô": "o",
        "ồ": "o",
        "ố": "o",
        "ổ": "o",
        "ỗ": "o",
        "ộ": "o",
        "ơ": "o",
        "ờ": "o",
        "ớ": "o",
        "ở": "o",
        "ỡ": "o",
        "ợ": "o",
        "ù": "u",
        "ú": "u",
        "ủ": "u",
        "ũ": "u",
        "ụ": "u",
        "ư": "u",
        "ừ": "u",
        "ứ": "u",
        "ử": "u",
        "ữ": "u",
        "ự": "u",
        "ỳ": "y",
        "ý": "y",
        "ỷ": "y",
        "ỹ": "y",
        "ỵ": "y",
        "đ": "d",
    }
    for src, dst in replacements.items():
        text = text.replace(src, dst)
    return text


class ChatAgent:
    def __init__(self, settings: Settings | None = None):
        self.settings = settings or get_settings()
        if not self.settings.anthropic_api_key:
            raise RuntimeError("ANTHROPIC_API_KEY is not set in env/.env")
        self.client = anthropic.Anthropic(api_key=self.settings.anthropic_api_key)
        self.memory = get_conversation_memory()

    def _user_wants_booking(self, message: str) -> bool:
        text = _fold_vietnamese(message)
        return any(keyword in text for keyword in _BOOKING_INTENT_KEYWORDS)

    def _message_has_booking_details(self, message: str) -> bool:
        if re.search(r"\d{4}-\d{2}-\d{2}", message):
            has_date = True
        else:
            has_date = bool(re.search(r"\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}", message))
        has_time = bool(re.search(r"\d{1,2}:\d{2}", message))
        return has_date and has_time

    def _persist_turn(self, conversation_id: str, user_content: str, assistant_text: str) -> None:
        self.memory.extend(
            conversation_id,
            [
                {"role": "user", "content": user_content},
                {
                    "role": "assistant",
                    "content": [{"type": "text", "text": assistant_text}],
                },
            ],
        )

    def _intake_form_response(
        self,
        conversation_id: str,
        message: str,
        reason: str,
    ) -> ChatResponse:
        result = execute_tool("request_booking_intake", {"reason": reason})
        tool_results_log = [{"tool": "request_booking_intake", "result": result}]
        assistant_text = str(result.get("message", INTAKE_FORM_MESSAGE))
        self._persist_turn(conversation_id, message, assistant_text)
        return self._response_type_from_tools(
            tool_results_log, assistant_text, conversation_id
        )

    def _try_booking_intake_request(
        self,
        message: str,
        conversation_id: str,
    ) -> ChatResponse | None:
        if not self._user_wants_booking(message):
            return None
        if self._message_has_booking_details(message):
            return None
        return self._intake_form_response(
            conversation_id,
            message,
            "user_requested_booking_without_details",
        )

    def _form_field(self, form_data: dict[str, Any], *keys: str) -> str:
        for key in keys:
            val = form_data.get(key)
            if val is not None and str(val).strip():
                return str(val).strip()
        return ""

    def _is_intake_submission(self, form_data: dict[str, Any]) -> bool:
        return bool(
            self._form_field(form_data, "date")
            and self._form_field(form_data, "time")
        )

    def _try_direct_intake_booking(
        self,
        message: str,
        form_data: dict[str, Any],
        conversation_id: str,
    ) -> ChatResponse | None:
        name = str(form_data.get("customer_name", "")).strip()
        date = str(form_data.get("date", "")).strip()
        time = str(form_data.get("time", "")).strip()
        phone = str(form_data.get("phone", "")).strip()

        if not (name and date and time):
            return None

        user_content = self._build_user_message(message, form_data)
        tool_results_log: list[dict[str, Any]] = []
        existing = find_customer_by_name(name, self.settings)

        if phone:
            save_result = upsert_customer_info(
                customer_name=name,
                phone=phone,
            )
            tool_results_log.append(
                {"tool": "upsert_customer_info", "result": save_result}
            )
            if not save_result.get("success"):
                self._persist_turn(
                    conversation_id,
                    user_content,
                    save_result.get("message", "Không lưu được thông tin khách."),
                )
                return ChatResponse(
                    conversation_id=conversation_id,
                    type="text",
                    message=save_result.get("message", ""),
                    metadata={"tool_result": save_result},
                )
        elif existing is None:
            return self._intake_form_response(
                conversation_id,
                user_content,
                "missing_phone_for_new_customer",
            )

        booking_result = upsert_booking(
            customer_name=name,
            trainer="",
            date=date,
            time=time,
        )
        tool_results_log.append({"tool": "upsert_booking", "result": booking_result})

        if booking_result.get("requires_customer_info"):
            return self._intake_form_response(
                conversation_id,
                user_content,
                "customer_not_found",
            )

        if booking_result.get("success"):
            message = f"Đặt lịch thành công! Renfit sẽ xác nhận lịch tập của {name} sớm nhất. Bạn có thể hỏi thêm về chương trình tập hoặc dinh dưỡng nhé!"
            self._persist_turn(conversation_id, user_content, message)
            return ChatResponse(
                conversation_id=conversation_id,
                type="booking_success",
                message=message,
                metadata={"tool_results": tool_results_log},
            )

        response = self._response_type_from_tools(
            tool_results_log,
            booking_result.get("message", ""),
            conversation_id,
        )
        self._persist_turn(conversation_id, user_content, response.message)
        return response

    def _build_user_message(self, message: str, form_data: dict[str, Any]) -> str:
        if not form_data:
            return message
        form_json = json.dumps(form_data, ensure_ascii=False)
        return f"{message}\n\n[Dữ liệu biểu mẫu]\n{form_json}"

    def _extract_text(self, content_blocks: list[Any]) -> str:
        parts: list[str] = []
        for block in content_blocks:
            if getattr(block, "type", None) == "text":
                parts.append(block.text)
        return "\n".join(parts).strip()

    def _run_tool_loop(
        self,
        messages: list[dict[str, Any]],
    ) -> tuple[str, list[dict[str, Any]]]:
        tool_results_log: list[dict[str, Any]] = []
        max_iterations = 8

        for _ in range(max_iterations):
            response = self.client.messages.create(
                model=self.settings.anthropic_model,
                max_tokens=self.settings.anthropic_max_tokens,
                system=SYSTEM_PROMPT,
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
                result = execute_tool(block.name, block.input)
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

    def _response_type_from_tools(
        self,
        tool_results_log: list[dict[str, Any]],
        assistant_text: str,
        conversation_id: str,
    ) -> ChatResponse:
        last_intake_request: dict[str, Any] | None = None
        last_booking: dict[str, Any] | None = None

        for entry in tool_results_log:
            if entry["tool"] == "request_booking_intake":
                last_intake_request = entry["result"]
            elif entry["tool"] in ("upsert_booking", "create_booking"):
                last_booking = entry["result"]

        if last_intake_request and last_intake_request.get("show_form"):
            return ChatResponse(
                conversation_id=conversation_id,
                type="form_request",
                message=assistant_text or INTAKE_FORM_MESSAGE,
                form="intake",
                fields=INTAKE_FORM_FIELDS,
                metadata={"tool_result": last_intake_request},
            )

        if last_booking:
            if last_booking.get("requires_customer_info"):
                return ChatResponse(
                    conversation_id=conversation_id,
                    type="form_request",
                    message=assistant_text or INTAKE_FORM_MESSAGE,
                    form="intake",
                    fields=INTAKE_FORM_FIELDS,
                    metadata={"tool_result": last_booking},
                )
            if last_booking.get("requires_booking_info"):
                return ChatResponse(
                    conversation_id=conversation_id,
                    type="form_request",
                    message=assistant_text
                    or "Bạn điền thông tin đặt lịch tập bên dưới nhé!",
                    form="booking",
                    fields=BOOKING_FORM_FIELDS,
                    metadata={"tool_result": last_booking},
                )
            if last_booking.get("success"):
                name = str(last_booking.get("customer_name", "")).strip() or "Khách"
                return ChatResponse(
                    conversation_id=conversation_id,
                    type="booking_success",
                    message=f"Đặt lịch thành công! Renfit sẽ xác nhận lịch tập của {name} sớm nhất. Bạn có thể hỏi thêm về chương trình tập hoặc dinh dưỡng nhé!",
                )

        return ChatResponse(
            conversation_id=conversation_id,
            type="text",
            message=assistant_text,
        )

    def chat(
        self,
        message: str,
        conversation_id: str | None = None,
        form_data: dict[str, Any] | None = None,
    ) -> ChatResponse:
        conversation_id = conversation_id or str(uuid.uuid4())
        form_data = form_data or {}

        if form_data:
            direct = self._try_direct_intake_booking(
                message, form_data, conversation_id
            )
            if direct is not None:
                return direct

        if not form_data:
            intake = self._try_booking_intake_request(message, conversation_id)
            if intake is not None:
                return intake

        history = self.memory.get(conversation_id)
        user_content = self._build_user_message(message, form_data)
        messages = history + [{"role": "user", "content": user_content}]

        assistant_text, tool_results_log = self._run_tool_loop(messages)
        self.memory.extend(conversation_id, messages[len(history) :])

        return self._response_type_from_tools(
            tool_results_log, assistant_text, conversation_id
        )

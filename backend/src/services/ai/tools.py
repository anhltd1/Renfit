"""Anthropic tool definitions and execution handlers.

All tools are scoped to the logged-in customer bound server-side
(``customer_id``, taken from the authenticated session — never from model
input). The agent cannot look up or modify any other customer's data, and it
cannot write to profile fields at all: personal info is read-only in chat and
can only be edited on the Profile page.
"""

import json
from typing import Any

from src.services.booking_service import (
    build_ai_availability,
    cancel_customer_booking,
    create_customer_booking,
)
from src.services.customer_service import get_customer_info, get_inbody_history


def _field(tool_input: dict[str, Any], *keys: str) -> str:
    for key in keys:
        val = tool_input.get(key)
        if val is not None and str(val).strip():
            return str(val).strip()
    return ""


ANTHROPIC_TOOLS: list[dict[str, Any]] = [
    {
        "name": "get_my_profile",
        "description": (
            "Xem hồ sơ cá nhân của khách đang chat (mục tiêu tập luyện, ghi chú sức khỏe, "
            "chiều cao, cân nặng, tuổi...). CHỈ ĐỌC — dùng để cá nhân hoá lời khuyên, trả lời "
            "khi khách hỏi 'bạn có biết thông tin của tôi không', hoặc động viên. "
            "KHÔNG dùng để thay đổi thông tin — chat không thể cập nhật hồ sơ."
        ),
        "input_schema": {"type": "object", "properties": {}, "required": []},
    },
    {
        "name": "get_my_inbody_history",
        "description": (
            "Xem lịch sử chỉ số InBody (chiều cao, cân nặng, khối lượng cơ SMM, khối lượng mỡ BFM) "
            "của khách đang chat, do HLV đo và cập nhật sau mỗi lần scan. Bao gồm số liệu mới nhất "
            "và mức thay đổi so với lần đo đầu tiên — dùng để động viên và nhận xét tiến độ."
        ),
        "input_schema": {"type": "object", "properties": {}, "required": []},
    },
    {
        "name": "get_booking_availability",
        "description": (
            "Xem khung giờ còn trống (08:00–20:00, trừ Chủ Nhật) và lịch tập hiện tại của "
            "khách đang chat (kèm trạng thái và booking_id). Nếu khách nêu một ngày cụ thể, "
            "TRUYỀN date đúng ngày đó — công cụ chỉ trả về khung giờ của ngày đó, không phải cả "
            "2 tuần. Nếu khách chưa nói ngày, để date trống — công cụ tự trả về hôm nay + ngày mai. "
            "Luôn gọi công cụ này trước khi đặt hoặc hủy lịch."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "date": {
                    "type": "string",
                    "description": "YYYY-MM-DD — chỉ truyền khi khách đã nêu rõ ngày cụ thể",
                },
            },
            "required": [],
        },
    },
    {
        "name": "book_slot",
        "description": (
            "Đặt lịch tập cho khách đang chat vào một khung giờ còn trống cụ thể. "
            "Luôn gọi get_booking_availability trước để xác nhận khung giờ còn trống. "
            "Lịch mới sẽ ở trạng thái 'pending' chờ HLV xác nhận."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "date": {"type": "string", "description": "YYYY-MM-DD"},
                "time": {"type": "string", "description": "HH:MM (giờ tròn, 08:00-19:00)"},
                "note": {"type": "string", "description": "Ghi chú buổi tập (tuỳ chọn)"},
            },
            "required": ["date", "time"],
        },
    },
    {
        "name": "cancel_booking",
        "description": "Hủy một lịch tập đã đặt của khách đang chat, theo booking_id.",
        "input_schema": {
            "type": "object",
            "properties": {
                "booking_id": {"type": "string"},
            },
            "required": ["booking_id"],
        },
    },
]

_SELF_SERVICE_TOOLS = (
    "get_my_profile",
    "get_my_inbody_history",
    "get_booking_availability",
    "book_slot",
    "cancel_booking",
)


def execute_tool(
    name: str,
    tool_input: dict[str, Any],
    customer_id: str = "",
) -> dict[str, Any]:
    """Run a tool by name; returns JSON-serializable dict.

    ``customer_id`` is the logged-in customer bound server-side — it scopes
    every tool so the agent can only ever see/act on the current chat user's
    own data.
    """
    if name not in _SELF_SERVICE_TOOLS:
        return {"success": False, "message": f"Unknown tool: {name}"}

    if not customer_id:
        return {
            "success": False,
            "message": "Bạn cần đăng nhập để dùng chức năng này.",
        }

    if name == "get_my_profile":
        return get_customer_info(customer_id)
    if name == "get_my_inbody_history":
        return get_inbody_history(customer_id)
    if name == "get_booking_availability":
        return build_ai_availability(customer_id, date_filter=_field(tool_input, "date"))
    if name == "book_slot":
        date_str = _field(tool_input, "date")
        time_str = _field(tool_input, "time")
        slot = f"{date_str}T{time_str}" if date_str and time_str else ""
        return create_customer_booking(
            customer_id=customer_id,
            time=slot,
            note=_field(tool_input, "note"),
        )
    if name == "cancel_booking":
        return cancel_customer_booking(
            customer_id=customer_id,
            booking_id=_field(tool_input, "booking_id"),
        )

    return {"success": False, "message": f"Unknown tool: {name}"}  # pragma: no cover


def tool_result_content(result: dict[str, Any]) -> str:
    return json.dumps(result, ensure_ascii=False)

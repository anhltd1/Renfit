"""Anthropic tool definitions and execution handlers."""

import json
from typing import Any

from src.constants import MVP_DEFAULT_TRAINER_LABEL
from src.services.ai.prompts import CUSTOMER_PROFILE_FORM_MESSAGE, INTAKE_FORM_MESSAGE
from src.services.booking_service import upsert_booking
from src.services.customer_service import get_customer_info, upsert_customer_info


def _field(tool_input: dict[str, Any], *keys: str) -> str:
    for key in keys:
        val = tool_input.get(key)
        if val is not None and str(val).strip():
            return str(val).strip()
    return ""


def _customer_profile_tool_result(customer_name: str) -> dict[str, Any]:
    return {
        "success": True,
        "show_form": True,
        "form": "customer_profile",
        "message": CUSTOMER_PROFILE_FORM_MESSAGE,
        "customer_name": customer_name,
    }


def _customer_tool_payload(tool_input: dict[str, Any]) -> dict[str, str]:
    return {
        "customer_name": tool_input.get("customer_name", ""),
        "phone": _field(tool_input, "phone"),
        "goal": _field(tool_input, "goal"),
        "trainer": _field(tool_input, "trainer"),
        "health_note": _field(tool_input, "health_note"),
        "note": _field(tool_input, "note"),
        "height": _field(tool_input, "height", "height_cm"),
        "weight": _field(tool_input, "weight", "weight_kg"),
    }


ANTHROPIC_TOOLS: list[dict[str, Any]] = [
    {
        "name": "request_booking_intake",
        "description": (
            "Hiện biểu mẫu đặt lịch trong chat (họ tên, SĐT, ngày, giờ). "
            "BẮT BUỘC gọi khi người dùng muốn đặt lịch nhưng chưa cung cấp đủ thông tin."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "reason": {"type": "string", "description": "Lý do (tuỳ chọn)"},
            },
            "required": [],
        },
    },
    {
        "name": "request_customer_profile",
        "description": (
            "Hiện biểu mẫu hồ sơ khách sau đặt lịch. Gọi sau khi đặt lịch thành công."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "customer_name": {"type": "string"},
            },
            "required": ["customer_name"],
        },
    },
    {
        "name": "find_customer",
        "description": "Tìm khách theo họ tên (không phân biệt hoa thường).",
        "input_schema": {
            "type": "object",
            "properties": {
                "customer_name": {"type": "string"},
            },
            "required": ["customer_name"],
        },
    },
    {
        "name": "upsert_customer_info",
        "description": (
            "Ghi nhận thông tin khách: tìm theo họ tên — có rồi thì cập nhật, "
            "chưa có thì tạo mới (cần phone khi tạo). Không tạo bản ghi trùng tên."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "customer_name": {"type": "string"},
                "phone": {"type": "string"},
                "goal": {"type": "string"},
                "trainer": {"type": "string"},
                "health_note": {"type": "string"},
                "note": {"type": "string"},
                "height": {"type": "string", "description": "Chiều cao (cm)"},
                "weight": {"type": "string", "description": "Cân nặng (kg)"},
            },
            "required": ["customer_name"],
        },
    },
    {
        "name": "upsert_booking",
        "description": (
            "Ghi nhận lịch tập: tìm theo họ tên (và ngày/giờ nếu có) — có rồi thì cập nhật, "
            "chưa có thì tạo mới. Khách phải đã có trong Customers (dùng upsert_customer_info trước). "
            f"trainer tuỳ chọn → {MVP_DEFAULT_TRAINER_LABEL}."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "customer_name": {"type": "string"},
                "trainer": {"type": "string"},
                "date": {"type": "string", "description": "YYYY-MM-DD"},
                "time": {"type": "string", "description": "HH:MM"},
                "status": {
                    "type": "string",
                    "enum": ["pending", "confirmed", "cancelled", "no_show"],
                },
                "note": {"type": "string"},
            },
            "required": ["customer_name", "date", "time"],
        },
    },
]


def execute_tool(name: str, tool_input: dict[str, Any]) -> dict[str, Any]:
    """Run a tool by name; returns JSON-serializable dict."""
    if name == "request_booking_intake":
        return {
            "success": True,
            "show_form": True,
            "form": "intake",
            "message": INTAKE_FORM_MESSAGE,
            "reason": (tool_input.get("reason") or "").strip(),
        }
    if name in ("request_customer_profile", "request_body_metrics"):
        customer_name = (tool_input.get("customer_name") or "").strip()
        return _customer_profile_tool_result(customer_name)
    if name == "find_customer":
        return get_customer_info(tool_input.get("customer_name", ""))

    customer_tools = (
        "upsert_customer_info",
        "save_customer_info",
        "update_customer_info",
    )
    if name in customer_tools:
        return upsert_customer_info(**_customer_tool_payload(tool_input))

    booking_tools = ("upsert_booking", "create_booking")
    if name in booking_tools:
        return upsert_booking(
            customer_name=tool_input.get("customer_name", ""),
            trainer=tool_input.get("trainer", ""),
            date=tool_input.get("date", ""),
            time=tool_input.get("time", ""),
            status=tool_input.get("status", "pending"),
            note=tool_input.get("note", ""),
        )

    return {"success": False, "message": f"Unknown tool: {name}"}


def tool_result_content(result: dict[str, Any]) -> str:
    return json.dumps(result, ensure_ascii=False)

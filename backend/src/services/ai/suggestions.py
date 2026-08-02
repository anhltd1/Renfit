"""Suggested-reply chips shown under the chat input.

Always exactly 3 suggestions per turn:

* **First turn of a session** (no prior history): the 3 fixed onboarding
  prompts covering the main use cases (booking, progress, consultation).
* **Every turn after that**: 2 contextual follow-ups derived from the last
  tool the agent called this turn (deterministic — no extra LLM call, same
  philosophy as artifacts: server-computed from real tool results, not
  fabricated), plus 1 evergreen anchor from the fixed set so booking/
  progress/consultation stay reachable even mid-conversation.
"""

from typing import Any

FIXED_SUGGESTIONS: list[str] = [
    "Tôi muốn đặt lịch",
    "Tôi muốn kiểm tra tiến độ",
    "Tôi muốn tư vấn lịch tập",
]

# 2 contextual follow-ups keyed by the last tool called this turn.
_CONTEXTUAL_BY_TOOL: dict[str, list[str]] = {
    "get_my_profile": ["Xem tiến độ InBody của tôi", "Tôi muốn đặt lịch tập"],
    "get_my_inbody_history": ["Gợi ý bài tập phù hợp với tôi", "Tôi muốn đặt lịch tập"],
    "get_booking_availability": ["Xem khung giờ ngày khác", "Hủy một lịch đã đặt"],
    "book_slot": ["Xem lịch tập sắp tới của tôi", "Kiểm tra tiến độ InBody"],
    "cancel_booking": ["Đặt lại một lịch khác", "Xem khung giờ còn trống"],
}

# Fallback when the turn had no relevant tool call (e.g. general Q&A).
_DEFAULT_CONTEXTUAL: list[str] = ["Gợi ý bài tập cho tôi", "Tư vấn dinh dưỡng tập luyện"]


def _last_relevant_tool(tool_results_log: list[dict[str, Any]]) -> str | None:
    for entry in reversed(tool_results_log):
        if entry.get("tool") in _CONTEXTUAL_BY_TOOL:
            return entry["tool"]
    return None


def build_suggestions(
    *,
    is_first_turn: bool,
    tool_results_log: list[dict[str, Any]],
) -> list[str]:
    """Return exactly 3 suggested replies for the chat input."""
    if is_first_turn:
        return list(FIXED_SUGGESTIONS)

    last_tool = _last_relevant_tool(tool_results_log)
    contextual = (
        _CONTEXTUAL_BY_TOOL[last_tool] if last_tool else _DEFAULT_CONTEXTUAL
    )[:2]

    # Anchor: a fixed suggestion not already covered by the contextual pair,
    # so a core intent (booking/progress/consultation) is always one click
    # away even deep in a conversation.
    anchor = next((s for s in FIXED_SUGGESTIONS if s not in contextual), FIXED_SUGGESTIONS[0])

    suggestions: list[str] = []
    for s in (*contextual, anchor):
        if s not in suggestions:
            suggestions.append(s)

    # Defensive padding — shouldn't trigger given the sets above are disjoint
    # enough, but guarantees the "always 3" contract regardless.
    for fallback in (*FIXED_SUGGESTIONS, *_DEFAULT_CONTEXTUAL):
        if len(suggestions) >= 3:
            break
        if fallback not in suggestions:
            suggestions.append(fallback)

    return suggestions[:3]

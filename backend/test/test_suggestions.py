"""Tests for suggested-reply chip generation."""

from src.services.ai.suggestions import FIXED_SUGGESTIONS, build_suggestions


def test_first_turn_returns_fixed_suggestions_in_order():
    result = build_suggestions(is_first_turn=True, tool_results_log=[])
    assert result == FIXED_SUGGESTIONS


def test_first_turn_ignores_tool_results_log():
    result = build_suggestions(
        is_first_turn=True,
        tool_results_log=[{"tool": "book_slot", "result": {"success": True}}],
    )
    assert result == FIXED_SUGGESTIONS


def test_always_returns_exactly_three():
    cases = [
        [],
        [{"tool": "get_my_profile", "result": {"success": True}}],
        [{"tool": "get_my_inbody_history", "result": {"success": True}}],
        [{"tool": "get_booking_availability", "result": {"success": True}}],
        [{"tool": "book_slot", "result": {"success": True}}],
        [{"tool": "cancel_booking", "result": {"success": True}}],
        [{"tool": "unknown_tool", "result": {"success": True}}],
    ]
    for tool_results_log in cases:
        result = build_suggestions(is_first_turn=False, tool_results_log=tool_results_log)
        assert len(result) == 3
        assert len(set(result)) == 3  # no duplicates


def test_contextual_suggestions_follow_last_relevant_tool():
    tool_results_log = [
        {"tool": "get_my_profile", "result": {"success": True}},
        {"tool": "book_slot", "result": {"success": True}},
    ]
    result = build_suggestions(is_first_turn=False, tool_results_log=tool_results_log)
    # book_slot's contextual suggestions should be used (last relevant tool), not profile's.
    assert "Xem lịch tập sắp tới của tôi" in result
    assert "Kiểm tra tiến độ InBody" in result


def test_no_relevant_tool_falls_back_to_default_contextual():
    result = build_suggestions(is_first_turn=False, tool_results_log=[])
    assert "Gợi ý bài tập cho tôi" in result
    assert "Tư vấn dinh dưỡng tập luyện" in result


def test_subsequent_turn_includes_a_fixed_anchor():
    tool_results_log = [{"tool": "book_slot", "result": {"success": True}}]
    result = build_suggestions(is_first_turn=False, tool_results_log=tool_results_log)
    assert any(s in FIXED_SUGGESTIONS for s in result)

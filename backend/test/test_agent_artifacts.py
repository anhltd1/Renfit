"""Tests for ChatAgent artifact rendering and login gating."""

from unittest.mock import MagicMock, patch

import pytest

from src.services.ai.agent import ChatAgent


@pytest.fixture
def agent():
    with patch.object(ChatAgent, "__init__", lambda self, settings=None: None):
        a = ChatAgent()
        a.settings = MagicMock(openai_api_key="test", openai_model="m", openai_max_tokens=100)
        a.memory = MagicMock()
        a.memory.get.return_value = []
        a.client = MagicMock()
        return a


def test_chat_requires_customer_id(agent):
    response = agent.chat("Xin chào", conversation_id="conv-1", customer_id=None)
    assert response.artifact is None
    assert "đăng nhập" in response.message.lower()
    agent.client.chat.completions.create.assert_not_called()


def test_chat_requires_customer_id_still_returns_three_suggestions(agent):
    response = agent.chat("Xin chào", conversation_id="conv-1", customer_id=None)
    assert len(response.suggestions) == 3


def test_chat_first_turn_returns_fixed_suggestions(agent):
    from unittest.mock import MagicMock

    mock_message = MagicMock()
    mock_message.content = "Chào bạn!"
    mock_message.tool_calls = None
    mock_choice = MagicMock()
    mock_choice.message = mock_message
    mock_response = MagicMock()
    mock_response.choices = [mock_choice]
    agent.client.chat.completions.create.return_value = mock_response

    from src.services.ai.suggestions import FIXED_SUGGESTIONS

    response = agent.chat("Xin chào", conversation_id="conv-1", customer_id="Real User")
    assert response.suggestions == FIXED_SUGGESTIONS


def test_chat_later_turn_returns_contextual_suggestions(agent):
    from unittest.mock import MagicMock

    agent.memory.get.return_value = [
        {"role": "user", "content": "hi"},
        {"role": "assistant", "content": "hello"},
    ]

    mock_message = MagicMock()
    mock_message.content = "Đây là các khung giờ trống."
    mock_message.tool_calls = None
    mock_choice = MagicMock()
    mock_choice.message = mock_message
    mock_response = MagicMock()
    mock_response.choices = [mock_choice]
    agent.client.chat.completions.create.return_value = mock_response

    response = agent.chat("Đặt lịch giúp tôi", conversation_id="conv-1", customer_id="Real User")
    assert len(response.suggestions) == 3


def test_build_artifact_from_profile_tool(agent):
    tool_results_log = [
        {
            "tool": "get_my_profile",
            "result": {"success": True, "found": True, "customer": {"id": "A"}},
        }
    ]
    artifact = agent._build_artifact(tool_results_log)
    assert artifact is not None
    assert artifact.kind == "profile"
    assert artifact.data["customer"]["id"] == "A"


def test_build_artifact_ignores_failed_tool_calls(agent):
    tool_results_log = [
        {"tool": "book_slot", "result": {"success": False, "message": "Đã đầy"}},
    ]
    assert agent._build_artifact(tool_results_log) is None


def test_build_artifact_picks_last_relevant_call(agent):
    tool_results_log = [
        {"tool": "get_my_profile", "result": {"success": True}},
        {"tool": "get_booking_availability", "result": {"success": True, "days_with_open_slots": []}},
    ]
    artifact = agent._build_artifact(tool_results_log)
    assert artifact is not None
    assert artifact.kind == "booking_availability"

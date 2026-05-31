"""Tests for booking intake form trigger."""

from unittest.mock import MagicMock, patch

import pytest

from src.services.ai.agent import ChatAgent


@pytest.fixture
def agent():
    with patch.object(ChatAgent, "__init__", lambda self, settings=None: None):
        a = ChatAgent()
        a.settings = MagicMock(anthropic_api_key="test")
        a.memory = MagicMock()
        a.memory.get.return_value = []
        return a


def test_user_wants_booking(agent):
    assert agent._user_wants_booking("Tôi muốn đặt lịch tập")
    assert not agent._user_wants_booking("Chào bạn")


def test_message_has_booking_details(agent):
    assert agent._message_has_booking_details("2026-05-12 lúc 14:30")
    assert not agent._message_has_booking_details("muốn đặt lịch")


@patch("src.services.ai.agent.execute_tool")
def test_try_booking_intake_request_returns_form(mock_execute, agent):
    mock_execute.return_value = {
        "success": True,
        "show_form": True,
        "form": "intake",
        "message": "Để đặt lịch tập, bạn điền thông tin ngay tại đây nhé:",
    }

    response = agent._try_booking_intake_request(
        "Tôi muốn đặt lịch tập",
        "conv-1",
    )

    assert response is not None
    assert response.type == "form_request"
    assert response.form == "intake"
    mock_execute.assert_called_once_with(
        "request_booking_intake",
        {"reason": "user_requested_booking_without_details"},
    )


def test_try_booking_intake_skips_when_details_present(agent):
    assert (
        agent._try_booking_intake_request(
            "Đặt lịch 2026-05-12 14:30",
            "conv-1",
        )
        is None
    )

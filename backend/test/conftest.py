"""Shared pytest fixtures."""

import pytest

from src.config.settings import get_settings


@pytest.fixture
def mock_settings():
    return get_settings()

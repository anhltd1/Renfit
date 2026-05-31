"""Shared pytest fixtures for Google Sheets integration tests."""

import uuid

import pytest

from src.config.settings import get_settings


@pytest.fixture(scope="session")
def settings():
    get_settings.cache_clear()
    s = get_settings()
    if not s.sheets_configured:
        pytest.skip(
            "Google Sheets not configured. Add env/service-account.json, "
            "GOOGLE_CUSTOMERS_SHEET_URL, and GOOGLE_BOOKINGS_SHEET_URL to env/.env"
        )
    return s


@pytest.fixture(scope="session")
def test_run_id():
    return uuid.uuid4().hex[:8]

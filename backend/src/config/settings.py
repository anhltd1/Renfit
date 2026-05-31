"""
Load configuration from backend/env/.env
Prep only — used by future API, Anthropic, and Google Sheets layers.
"""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/env/.env (two levels up from this file: src/config -> backend)
_ENV_DIR = Path(__file__).resolve().parents[2] / "env"
_ENV_FILE = _ENV_DIR / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_ENV_FILE if _ENV_FILE.exists() else None,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Anthropic
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-3-5-haiku-20241022"
    anthropic_max_tokens: int = 1024

    # Google Sheets (MVP — one spreadsheet file per object)
    google_api_key: str = ""
    # Service account JSON path (relative to backend/ or absolute) — required for read/write
    google_service_account_file: str = "env/service-account.json"
    google_customers_sheet_url: str = ""
    google_bookings_sheet_url: str = ""
    google_customers_sheet_tab: str = ""
    google_bookings_sheet_tab: str = ""

    # Server
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_env: str = "development"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    # AI Coach
    ai_max_history_turns: int = 20
    ai_request_timeout: int = 60

    log_level: str = "INFO"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_development(self) -> bool:
        return self.api_env.lower() == "development"

    def service_account_path(self) -> Path:
        path = Path(self.google_service_account_file)
        if not path.is_absolute():
            path = Path(__file__).resolve().parents[2] / path
        return path

    @property
    def sheets_configured(self) -> bool:
        return bool(
            self.service_account_path().is_file()
            and self.google_customers_sheet_url
            and self.google_bookings_sheet_url
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()

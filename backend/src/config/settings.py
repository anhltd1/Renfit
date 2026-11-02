"""
Load configuration from backend/env/.env
Used by API, OpenAI chat, and MongoDB layers.
"""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_ENV_DIR = Path(__file__).resolve().parents[2] / "env"
_ENV_FILE = _ENV_DIR / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_ENV_FILE if _ENV_FILE.exists() else None,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # OpenAI
    openai_api_key: str = ""
    openai_model: str = "gpt-5.6-luna"
    openai_max_tokens: int = 1024

    # MongoDB
    mongodb_uri: str = ""
    db_name: str = "renfit"

    # Server
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_env: str = "development"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    # AI Coach
    ai_max_history_turns: int = 20
    ai_request_timeout: int = 60

    # Web Push (VAPID)
    vapid_public_key: str = ""
    vapid_private_key: str = ""
    vapid_contact_email: str = "mailto:admin@renfit.local"

    log_level: str = "INFO"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_development(self) -> bool:
        return self.api_env.lower() == "development"

    @property
    def mongodb_configured(self) -> bool:
        return bool(self.mongodb_uri.strip())


@lru_cache
def get_settings() -> Settings:
    return Settings()

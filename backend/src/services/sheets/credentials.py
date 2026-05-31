"""Validate Google service account JSON before loading credentials."""

import json
from pathlib import Path


def validate_service_account_file(path: Path) -> None:
    if not path.is_file():
        raise FileNotFoundError(
            f"Service account file not found: {path}\n"
            "Download a Service Account JSON key from GCP (not OAuth client credentials)."
        )

    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ValueError(f"Invalid JSON in service account file: {path}") from exc

    if data.get("type") == "service_account" and data.get("client_email"):
        return

    if "web" in data or "installed" in data:
        raise ValueError(
            "Wrong credential file: this is an OAuth Client ID JSON (client_secret), "
            "not a Service Account key.\n\n"
            "Fix:\n"
            "  1. Google Cloud Console → IAM & Admin → Service Accounts\n"
            "  2. Create/select a service account → Keys → Add key → Create new key → JSON\n"
            "  3. Save as backend/env/service-account.json\n"
            "  4. Share both Google Sheets with the service account email (Editor)\n\n"
            "Do not put client_secret in .env. See env/service-account.json.example"
        )

    missing = [k for k in ("type", "client_email", "private_key", "token_uri") if not data.get(k)]
    raise ValueError(
        f"Service account JSON missing required fields: {', '.join(missing)}. "
        f"See env/service-account.json.example"
    )

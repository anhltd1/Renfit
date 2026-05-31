# Environment configuration (`backend/env/`)

All API keys and runtime settings for the Renfit backend live in this folder.

## Setup

1. Copy the example file:

   ```bash
   cd backend/env
   cp .env.example .env
   ```

2. **Anthropic** — add your [API key](https://console.anthropic.com/) for AI Coach (Claude Haiku):

   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ANTHROPIC_MODEL=claude-3-5-haiku-20241022
   ```

3. **Google Sheets (MVP data)** — enable [Google Sheets API](https://console.cloud.google.com/apis/library/sheets.googleapis.com), then create a **Service Account key** (not OAuth client secret):

   | ✅ Correct | ❌ Wrong |
   |------------|----------|
   | **IAM & Admin → Service Accounts → Keys → Add key → JSON** | APIs & Services → Credentials → OAuth client ID → Download JSON |
   | File has `"type": "service_account"` and `"client_email": "...@....iam.gserviceaccount.com"` | File has `"web": { "client_secret": "GOCSPX-..." }` |

   Save the JSON as `env/service-account.json` (see `service-account.json.example`). **Share both spreadsheets** with the `client_email` as **Editor**. Set URLs in `.env`:

   ```
   GOOGLE_SERVICE_ACCOUNT_FILE=env/service-account.json
   GOOGLE_CUSTOMERS_SHEET_URL=https://docs.google.com/spreadsheets/d/<ID>/edit
   GOOGLE_BOOKINGS_SHEET_URL=https://docs.google.com/spreadsheets/d/<ID>/edit
   ```

   Optional: `GOOGLE_API_KEY` for other Google APIs (Sheets read/write uses the service account).

   Optional: if data is not on the first tab, set tab names:

   ```
   GOOGLE_CUSTOMERS_SHEET_TAB=Customers
   GOOGLE_BOOKINGS_SHEET_TAB=Bookings
   ```

   Sheet schemas: [docs/data-model.md](../docs/data-model.md).

## Files

| File | Purpose |
|------|---------|
| `.env.example` | Template — safe to commit |
| `.env` | Your local secrets — **never commit** (listed in `.gitignore`) |
| `README.md` | This guide |

## Variables

### Anthropic (AI Coach)

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `ANTHROPIC_MODEL` | LLM id (`claude-3-5-haiku-20241022` = Haiku) |
| `ANTHROPIC_MAX_TOKENS` | Max tokens per assistant reply |

### Google Sheets (MVP)

| Variable | Description |
|----------|-------------|
| `GOOGLE_API_KEY` | Optional Google Cloud API key |
| `GOOGLE_SERVICE_ACCOUNT_FILE` | Path to service account JSON (required for Sheets) |
| `GOOGLE_CUSTOMERS_SHEET_URL` | URL of the **Customers** spreadsheet file |
| `GOOGLE_BOOKINGS_SHEET_URL` | URL of the **Bookings** spreadsheet file |
| `GOOGLE_CUSTOMERS_SHEET_TAB` | Worksheet tab name (empty = first tab) |
| `GOOGLE_BOOKINGS_SHEET_TAB` | Worksheet tab name (empty = first tab) |

### Server & AI

| Variable | Description |
|----------|-------------|
| `API_HOST` / `API_PORT` | Server bind address |
| `API_ENV` | `development` \| `production` |
| `CORS_ORIGINS` | Allowed frontend origins (comma-separated) |
| `AI_MAX_HISTORY_TURNS` | Chat context window |
| `AI_REQUEST_TIMEOUT` | LLM timeout (seconds) |
| `LOG_LEVEL` | `DEBUG`, `INFO`, `WARNING`, `ERROR` |

## Security

- Do not commit `.env` or paste keys in chat/issues.
- Rotate keys if exposed.
- Restrict the Google API key to Sheets API and (recommended) HTTP referrers or IP allowlists in GCP.


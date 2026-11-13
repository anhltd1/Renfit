# Backend Environment (`env/`)

Copy the example and fill in secrets before running the app:

```bash
cp .env.example .env
```

## Required Variables

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | OpenAI API key — used by the AI Coach (gpt-6-luna) |
| `MONGODB_URI` | MongoDB connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/`) |
| `ADMIN_USERNAME` | Coach (admin) login name — the account is created/synced on every startup |
| `ADMIN_PASSWORD` | Coach (admin) password (stored bcrypt-hashed; change it + restart to rotate) |

## Optional Variables

| Variable | Default | Description |
|---|---|---|
| `DB_NAME` | `renfit` | MongoDB database name |
| `OPENAI_MODEL` | `gpt-6-luna` | OpenAI model ID |
| `OPENAI_MAX_TOKENS` | `1024` | Max tokens per AI response |
| `AI_MAX_HISTORY_TURNS` | `20` | Conversation turns kept in memory |
| `AI_REQUEST_TIMEOUT` | `60` | Seconds before AI request times out |
| `API_HOST` | `0.0.0.0` | Uvicorn bind host |
| `API_PORT` | `8000` | Uvicorn port |
| `CORS_ORIGINS` | `http://localhost:5173,...` | Comma-separated allowed origins |
| `LOG_LEVEL` | `INFO` | Python logging level |

**Never commit `env/.env`.** It is gitignored. Only `env/.env.example` and this `README.md` are tracked.

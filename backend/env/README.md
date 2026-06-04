# Backend environment (`env/`)

Copy the example file and fill in secrets:

```bash
cp .env.example .env
```

## Required

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Anthropic API key for AI Coach |
| `MONGODB_URI` | Remote MongoDB connection string |

## Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_NAME` | `renfit` | MongoDB database name |
| `ANTHROPIC_MODEL` | `claude-3-5-haiku-20241022` | Claude model |
| `CORS_ORIGINS` | local Vite URLs | Comma-separated CORS origins |

Do not commit `env/.env`.

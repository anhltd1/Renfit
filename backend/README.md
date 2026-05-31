# Renfit Backend

Prep workspace for the AI Coach API (Claude Haiku) and MVP data in **Google Sheets** (Customers + Bookings).

```
backend/
├── env/          # API keys & config — copy .env.example → .env
├── docs/         # Documentation → see docs/README.md
└── src/          # Python source code
```

**Quick start**

1. Configure: [env/README.md](env/README.md) (Anthropic + Google Sheets URLs)
2. Docs: [docs/README.md](docs/README.md) · Data model: [docs/data-model.md](docs/data-model.md)
3. Install: `pip install -r requirements.txt`
4. Run (stub): `uvicorn src.main:app --reload` from `backend/`

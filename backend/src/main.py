"""
FastAPI application entry point.
Routes and Anthropic chat logic will be added in the next phase.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.admin import router as admin_router
from src.api.auth import router as auth_router
from src.api.bookings import router as bookings_router
from src.api.chat import router as chat_router
from src.api.profile import router as profile_router
from src.config import get_settings
from src.init_db.seed import seed_admin_trainer

settings = get_settings()

app = FastAPI(
    title="Renfit API",
    description="Backend API for Renfit — AI Fitness Coach (Claude Haiku)",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin_router)
app.include_router(auth_router)
app.include_router(bookings_router)
app.include_router(profile_router)
app.include_router(chat_router)


@app.on_event("startup")
def _seed_defaults() -> None:
    """Ensure the default admin coach exists (idempotent, best-effort)."""
    try:
        seed_admin_trainer()
    except Exception:  # noqa: BLE001 — never block startup on seeding
        pass


@app.get("/api/v1/health")
def health():
    return {
        "status": "ok",
        "env": settings.api_env,
        "model": settings.anthropic_model,
        "mongodb_configured": settings.mongodb_configured,
        "db_name": settings.db_name,
    }

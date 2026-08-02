"""
FastAPI application entry point.
Routes and Anthropic chat logic will be added in the next phase.
"""

import asyncio

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.admin import router as admin_router
from src.api.auth import router as auth_router
from src.api.bookings import router as bookings_router
from src.api.chat import router as chat_router
from src.api.notifications import router as notifications_router
from src.api.profile import router as profile_router
from src.config import get_settings
from src.init_db.seed import seed_admin_trainer
from src.services.notification_scheduler import run_reminder_scheduler_forever

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
app.include_router(notifications_router)


@app.on_event("startup")
def _drop_stale_indexes() -> None:
    """Drop indexes that no longer match the current schema (one-time migration, idempotent)."""
    from pymongo.errors import OperationFailure
    from src.db.mongo import bookings_collection
    try:
        bookings_collection().drop_index("booking_customer_trainer_unique")
    except OperationFailure:
        pass  # Index doesn't exist — nothing to do


@app.on_event("startup")
def _maybe_reset_db() -> None:
    """When RESET_DB=true, drop and recreate the database for a clean start.

    This is the primary mechanism for the "first-time" flag: set RESET_DB=true
    in docker-compose (or .env) to wipe the DB on next startup, then set it
    back to false to preserve data on subsequent restarts.
    """
    import os
    if os.environ.get("RESET_DB", "false").lower() == "true":
        try:
            from src.init_db.reset_database import reset_database
            reset_database()
        except Exception as exc:  # noqa: BLE001
            import logging
            logging.getLogger(__name__).error("RESET_DB failed: %s", exc)


@app.on_event("startup")
def _seed_defaults() -> None:
    """Ensure the default admin coach exists (idempotent, best-effort)."""
    try:
        seed_admin_trainer()
    except Exception:  # noqa: BLE001 — never block startup on seeding
        pass


@app.on_event("startup")
async def _start_notification_scheduler() -> None:
    """Start the session-reminder background scan (docs/notifications.md §3.2).

    Best-effort: if MongoDB isn't configured (e.g. running without a DB in
    some dev setups), the loop's first scan will simply raise and be logged
    per-iteration rather than blocking app startup.
    """
    asyncio.create_task(run_reminder_scheduler_forever())


@app.get("/api/v1/health")
def health():
    return {
        "status": "ok",
        "env": settings.api_env,
        "model": settings.anthropic_model,
        "mongodb_configured": settings.mongodb_configured,
        "db_name": settings.db_name,
    }

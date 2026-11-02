"""
FastAPI application entry point.
Routes and OpenAI chat logic will be added in the next phase.
"""

import asyncio

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.admin import router as admin_router
from src.api.auth import router as auth_router
from src.api.bookings import router as bookings_router
from src.api.chat import router as chat_router
from src.api.inbody_photos import router as inbody_photos_router
from src.api.notifications import router as notifications_router
from src.api.profile import router as profile_router
from src.api.push import router as push_router
from src.api.site_content import router as site_content_router
from src.config import get_settings
from src.init_db.seed import seed_admin_trainer
from src.services.notification_scheduler import run_reminder_scheduler_forever

settings = get_settings()

app = FastAPI(
    title="Renfit API",
    description="Backend API for Renfit — AI Fitness Coach (GPT-5.6-luna)",
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
app.include_router(push_router)
app.include_router(site_content_router)
app.include_router(inbody_photos_router)


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
def _sync_bookings_validator() -> None:
    """Apply the current Bookings JSON-schema validator to existing databases.

    Idempotent, non-destructive ``collMod`` (only replaces the validator, never
    touches documents) so new statuses (e.g. ``completed`` / ``no_show``) are
    accepted without ``reset_database``. Best-effort: never blocks startup.
    """
    import logging

    log = logging.getLogger(__name__)
    try:
        from src.init_db.database import get_renfit_database
        from src.schema import collections as col
        from src.schema.mongo import COLLECTION_SPECS, VALIDATION_OPTIONS

        spec = next((s for s in COLLECTION_SPECS if s["name"] == col.BOOKINGS), None)
        if spec is None:
            return
        db = get_renfit_database()
        if col.BOOKINGS not in db.list_collection_names():
            return  # created with the current validator on first reset/seed
        db.command("collMod", col.BOOKINGS, validator=spec["validator"], **VALIDATION_OPTIONS)
    except Exception as exc:  # noqa: BLE001 — never block startup on migration
        log.warning("Bookings validator sync skipped: %s", exc)


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
def _ensure_inbody_photo_indexes() -> None:
    """Create InbodyPhoto indexes on existing databases (idempotent, best-effort)."""
    try:
        from src.db.mongo import inbody_photos_collection
        from src.schema.mongo import INBODY_PHOTO_INDEXES

        coll = inbody_photos_collection()
        for index in INBODY_PHOTO_INDEXES:
            opts = {k: v for k, v in index.items() if k != "keys"}
            coll.create_index(index["keys"], **opts)
    except Exception:  # noqa: BLE001 — never block startup on index creation
        pass


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
        "model": settings.openai_model,
        "mongodb_configured": settings.mongodb_configured,
        "db_name": settings.db_name,
    }

"""
FastAPI application entry point.
Routes and Anthropic chat logic will be added in the next phase.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.chat import router as chat_router
from src.config import get_settings

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

app.include_router(chat_router)


@app.get("/api/v1/health")
def health():
    return {
        "status": "ok",
        "env": settings.api_env,
        "model": settings.anthropic_model,
        "mongodb_configured": settings.mongodb_configured,
        "db_name": settings.db_name,
    }

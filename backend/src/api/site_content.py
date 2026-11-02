"""Site content (Landing Page CMS) endpoints.

Public endpoint serves published content (no auth).
Admin endpoints require trainer authentication via _require_admin.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from src.api.admin import _require_admin
from src.schema.site_content import SiteContentTree
from src.services.site_content_service import SiteContentService

router = APIRouter(tags=["site-content"])


# ── Request/Response models ────────────────────────────────────────────────


class UploadImageRequest(BaseModel):
    base64_data: str
    format: str


class UploadImageResponse(BaseModel):
    url: str


# ── Public endpoints ───────────────────────────────────────────────────────


@router.get("/api/v1/site-content")
def get_published_content():
    """Return the published site content (public, no auth)."""
    return SiteContentService.get_published()


# ── Admin endpoints ────────────────────────────────────────────────────────


@router.get("/api/v1/admin/site-content/draft")
def get_draft_content(_trainer_id: str = Depends(_require_admin)):
    """Return the draft site content (trainer-only)."""
    return SiteContentService.get_draft()


@router.put("/api/v1/admin/site-content/draft")
def save_draft_content(
    body: SiteContentTree,
    trainer_id: str = Depends(_require_admin),
):
    """Save (replace) the draft content (trainer-only)."""
    content_dict = body.model_dump()
    try:
        result = SiteContentService.save_draft(content_dict, trainer_id)
    except ValueError as exc:
        missing_fields = exc.args[0] if exc.args else []
        detail = "Thiếu trường bắt buộc: " + ", ".join(missing_fields)
        raise HTTPException(status_code=422, detail=detail)
    return {"content": result["content"], "updated_at": result["updated_at"].isoformat()}


@router.post("/api/v1/admin/site-content/publish")
def publish_content(trainer_id: str = Depends(_require_admin)):
    """Copy draft → published (trainer-only)."""
    result = SiteContentService.publish(trainer_id)
    return {"published_at": result["published_at"].isoformat()}


@router.post("/api/v1/admin/site-content/upload-image")
def upload_image(
    body: UploadImageRequest,
    _trainer_id: str = Depends(_require_admin),
):
    """Upload a base64-encoded image (trainer-only). Returns the base64 string."""
    try:
        url = SiteContentService.upload_image(body.base64_data, body.format)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except OverflowError as exc:
        raise HTTPException(status_code=413, detail=str(exc))
    return UploadImageResponse(url=url)

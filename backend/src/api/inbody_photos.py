"""Serve InBody progress photos by id.

MVP posture (see backend/docs/data-model.md): like `GET /api/v1/profile/inbody`,
this endpoint has no auth. Access relies on the photo id being an unguessable
uuid4 that is only ever returned to the record's owner and to trainers.
"""

from fastapi import APIRouter, HTTPException, Response

from src.services.inbody_photo_service import get_photo

router = APIRouter(prefix="/api/v1/inbody", tags=["inbody"])


@router.get("/photos/{photo_id}")
def get_inbody_photo(photo_id: str) -> Response:
    found = get_photo(photo_id)
    if found is None:
        raise HTTPException(status_code=404, detail="Không tìm thấy ảnh.")
    content_type, data = found
    return Response(
        content=data,
        media_type=content_type,
        # Photos are immutable (new photo = new id), so cache aggressively but
        # privately — they are personal body-progress images.
        headers={"Cache-Control": "private, max-age=31536000, immutable"},
    )

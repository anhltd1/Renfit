"""Customer profile — view and update personal information."""

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from passlib.context import CryptContext
from pydantic import BaseModel

from src.api.deps import require_customer
from src.db.mongo import customers_collection, inbody_collection
from src.schema.customer import Customer
from src.api.auth import AuthResponse, _customer_response
from src.services.inbody_photo_service import photo_urls

router = APIRouter(prefix="/api/v1/profile", tags=["profile"])

_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UpdateProfileRequest(BaseModel):
    """All fields are optional — only provided fields are updated."""

    goal: str | None = None
    health_note: str | None = None
    address: str | None = None
    height: str | None = None
    weight: str | None = None
    avatar: str | None = None
    age: int | float | None = None
    # Password change (optional — requires current password)
    current_password: str | None = None
    new_password: str | None = None


@router.put("", response_model=AuthResponse)
def update_profile(
    body: UpdateProfileRequest, customer_id: str = Depends(require_customer)
) -> AuthResponse:
    """Update the logged-in customer's profile fields."""
    coll = customers_collection()
    doc = coll.find_one({"id": customer_id})
    if doc is None:
        raise HTTPException(status_code=404, detail="Không tìm thấy tài khoản.")

    customer = Customer.model_validate(doc)

    # Password change
    new_hash: str | None = None
    if body.new_password is not None:
        if not body.current_password:
            raise HTTPException(
                status_code=422,
                detail="Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu.",
            )
        if not _pwd.verify(body.current_password, customer.password):
            raise HTTPException(status_code=400, detail="Mật khẩu hiện tại không đúng.")
        if len(body.new_password) < 6:
            raise HTTPException(
                status_code=422,
                detail="Mật khẩu mới phải có ít nhất 6 ký tự.",
            )
        new_hash = _pwd.hash(body.new_password)

    # Apply updates (only fields that were provided)
    updated = customer.model_copy(
        update={
            k: v
            for k, v in {
                "goal": body.goal,
                "health_note": body.health_note,
                "address": body.address,
                "height": body.height,
                "weight": body.weight,
                "avatar": body.avatar,
                "age": body.age,
                "password": new_hash,
            }.items()
            if v is not None
        }
    )

    coll.replace_one({"_id": doc["_id"]}, updated.model_dump(exclude_none=True))
    return _customer_response(updated)


# ── Customer InBody history (read-only, no admin token required) ──────────────

class InbodyRecordOut(BaseModel):
    id: str
    customer_id: str
    height: float
    weight: float
    SMM: float
    BFM: float
    date_recorded: str
    photos: list[str] = []  # photo URLs, first = cover


def _fmt_date(raw: str | datetime | None) -> str:
    if raw is None:
        return datetime.utcnow().strftime("%Y-%m-%d")
    if isinstance(raw, datetime):
        return raw.strftime("%Y-%m-%d")
    return str(raw)[:10]


@router.get("/inbody", response_model=list[InbodyRecordOut])
def get_my_inbody(customer_id: str = Depends(require_customer)) -> list[InbodyRecordOut]:
    """Return the logged-in customer's InBody records (sorted by date)."""
    docs = list(
        inbody_collection()
        .find({"customer_id": customer_id}, {"_id": 0})
        .sort("date_recorded", 1)
    )
    return [
        InbodyRecordOut(
            id=doc.get("id", ""),
            customer_id=doc.get("customer_id", ""),
            height=float(doc.get("height", 0)),
            weight=float(doc.get("weight", 0)),
            SMM=float(doc.get("SMM", 0)),
            BFM=float(doc.get("BFM", 0)),
            date_recorded=_fmt_date(doc.get("date_recorded")),
            photos=photo_urls(doc.get("photo_ids")),
        )
        for doc in docs
    ]

"""Admin (coach) dashboard endpoints.

Trainers authenticate against the ``Personal_Trainer`` collection. The session
token is simply the trainer id, validated against the database on every call
(MVP — no JWT). The default ``admin`` account is seeded by
``src.init_db.seed.seed_admin_trainer``.
"""

import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from passlib.context import CryptContext
from pydantic import BaseModel, Field

from src.db.mongo import (
    customers_collection,
    inbody_collection,
    personal_trainers_collection,
)
from src.schema.inbody import Inbody
from src.services.booking_service import list_window_bookings, set_booking_status

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])

_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
_bearer = HTTPBearer(auto_error=False)


def _require_admin(creds: HTTPAuthorizationCredentials | None = Depends(_bearer)) -> str:
    """Validate the bearer token (= trainer id) and return the trainer id."""
    if creds is None:
        raise HTTPException(status_code=401, detail="Không có quyền truy cập.")
    trainer = personal_trainers_collection().find_one({"id": creds.credentials})
    if trainer is None:
        raise HTTPException(status_code=401, detail="Không có quyền truy cập.")
    return str(trainer.get("id", ""))


# ── Models ─────────────────────────────────────────────────────────────────

class AdminLoginRequest(BaseModel):
    username: str
    password: str


class AdminLoginResponse(BaseModel):
    token: str
    name: str


class CustomerSummary(BaseModel):
    id: str
    phone_number: str
    goal: str
    health_note: str
    address: str
    height: str
    weight: str
    avatar: str
    age: float | None


class InbodyRecord(BaseModel):
    id: str
    customer_id: str
    height: float
    weight: float
    SMM: float
    BFM: float
    date_recorded: str


class AddInbodyRequest(BaseModel):
    height: float = Field(..., gt=0)
    weight: float = Field(..., gt=0)
    SMM: float = Field(..., ge=0)
    BFM: float = Field(..., ge=0)
    date_recorded: str | None = None   # ISO string; defaults to now if omitted


# ── Endpoints ──────────────────────────────────────────────────────────────

@router.post("/login", response_model=AdminLoginResponse)
def admin_login(body: AdminLoginRequest) -> AdminLoginResponse:
    """Authenticate a trainer against Personal_Trainer (login by `name`)."""
    username = body.username.strip()
    trainer = personal_trainers_collection().find_one({"name": username})
    stored_hash = trainer.get("password", "") if trainer else ""
    try:
        valid = bool(stored_hash) and _pwd.verify(body.password, stored_hash)
    except ValueError:
        valid = False
    if not trainer or not valid:
        raise HTTPException(status_code=401, detail="Tên đăng nhập hoặc mật khẩu không đúng.")
    return AdminLoginResponse(token=str(trainer.get("id", "")), name=str(trainer.get("name", "")))


@router.get("/customers", response_model=list[CustomerSummary])
def list_customers(_: None = Depends(_require_admin)) -> list[CustomerSummary]:
    """Return all registered customers (passwords excluded)."""
    docs = customers_collection().find({}, {"_id": 0, "password": 0})
    return [
        CustomerSummary(
            id=doc.get("id", ""),
            phone_number=doc.get("phone_number", ""),
            goal=doc.get("goal", ""),
            health_note=doc.get("health_note", ""),
            address=doc.get("address", ""),
            height=doc.get("height", ""),
            weight=doc.get("weight", ""),
            avatar=doc.get("avatar", ""),
            age=doc.get("age"),
        )
        for doc in docs
    ]


def _fmt_date(raw: str | datetime | None) -> str:
    """Return a short ISO date string (YYYY-MM-DD) regardless of input format."""
    if raw is None:
        return datetime.utcnow().strftime("%Y-%m-%d")
    if isinstance(raw, datetime):
        return raw.strftime("%Y-%m-%d")
    # already a string — truncate to date part
    return str(raw)[:10]


@router.get("/customers/{customer_id}/inbody", response_model=list[InbodyRecord])
def get_inbody(
    customer_id: str, _: None = Depends(_require_admin)
) -> list[InbodyRecord]:
    """Return all InBody records for a customer, sorted by date."""
    docs = list(
        inbody_collection().find(
            {"customer_id": customer_id}, {"_id": 0}
        ).sort("date_recorded", 1)
    )
    return [
        InbodyRecord(
            id=doc.get("id", ""),
            customer_id=doc.get("customer_id", ""),
            height=float(doc.get("height", 0)),
            weight=float(doc.get("weight", 0)),
            SMM=float(doc.get("SMM", 0)),
            BFM=float(doc.get("BFM", 0)),
            date_recorded=_fmt_date(doc.get("date_recorded")),
        )
        for doc in docs
    ]


@router.post("/customers/{customer_id}/inbody", response_model=InbodyRecord, status_code=201)
def add_inbody(
    customer_id: str,
    body: AddInbodyRequest,
    _: None = Depends(_require_admin),
) -> InbodyRecord:
    """Add a new InBody record for a customer."""
    # Verify customer exists
    if customers_collection().find_one({"id": customer_id}) is None:
        raise HTTPException(status_code=404, detail="Không tìm thấy hội viên.")

    record_date = body.date_recorded or datetime.utcnow().strftime("%Y-%m-%d")
    inbody = Inbody(
        id=str(uuid.uuid4()),
        customer_id=customer_id,
        height=body.height,
        weight=body.weight,
        SMM=body.SMM,
        BFM=body.BFM,
        date_recorded=record_date,
    )
    inbody_collection().insert_one(inbody.model_dump())
    return InbodyRecord(
        id=inbody.id,
        customer_id=inbody.customer_id,
        height=inbody.height,
        weight=inbody.weight,
        SMM=inbody.SMM,
        BFM=inbody.BFM,
        date_recorded=_fmt_date(inbody.date_recorded),
    )


# ── Bookings (trainer view) ─────────────────────────────────────────────────

class UpdateBookingStatusRequest(BaseModel):
    status: str = Field(..., description="pending | approved | rejected")


@router.get("/bookings")
def get_bookings(_: str = Depends(_require_admin)) -> dict:
    """Two-week booking calendar grouped by day + hour."""
    return list_window_bookings()


@router.patch("/bookings/{booking_id}")
def update_booking_status(
    booking_id: str,
    body: UpdateBookingStatusRequest,
    _: str = Depends(_require_admin),
) -> dict:
    result = set_booking_status(booking_id=booking_id, status=body.status)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("message", "Cập nhật thất bại."))
    return result

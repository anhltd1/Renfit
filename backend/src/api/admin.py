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
    bookings_collection,
    customers_collection,
    inbody_collection,
    personal_trainers_collection,
    trainer_notes_collection,
)
from src.schema.inbody import Inbody
from src.services.blocked_slot_service import (
    cancel_affected_bookings,
    create_blocked_slot,
    delete_blocked_slot,
    get_affected_bookings,
    list_blocked_slots,
)
from src.services.booking_service import admin_assign_booking, list_window_bookings, set_booking_status
from src.services.notification_service import (
    list_trainer_notifications,
    mark_all_trainer_notifications_read,
    mark_trainer_notification_read,
    notify_inbody_added,
    trainer_unread_count,
)

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
    active: bool = True
    last_session: str | None = None
    next_session: str | None = None


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


# ── Today screen (PT landing view) ────────────────────────────────────────


class TodaySession(BaseModel):
    time: str
    hour: int
    customer_id: str
    customer_goal: str
    status: str


class PendingBooking(BaseModel):
    id: str
    customer_id: str
    time: str
    hour: int
    note: str


class TodayResponse(BaseModel):
    date: str
    sessions: list[TodaySession]
    pending: list[PendingBooking]


@router.get("/today", response_model=TodayResponse)
def get_today(_: str = Depends(_require_admin)) -> TodayResponse:
    """Today's approved sessions + all pending bookings (PT landing view)."""
    from src.services.booking_service import today_ict, slot_hours

    today = today_ict()
    today_prefix = today.isoformat()  # "2026-08-02"

    # Build a customer_id → goal lookup
    customer_goals: dict[str, str] = {}
    for doc in customers_collection().find({}, {"_id": 0, "id": 1, "goal": 1}):
        customer_goals[doc.get("id", "")] = doc.get("goal", "")

    # Today's approved bookings sorted by time
    sessions: list[TodaySession] = []
    for doc in bookings_collection().find(
        {"status": "approved", "time": {"$regex": f"^{today_prefix}"}},
    ).sort("time", 1):
        time_str = str(doc.get("time", ""))
        # Extract hour from "2026-08-02T14:00"
        hour = int(time_str[11:13]) if len(time_str) >= 13 else 0
        cid = doc.get("customer_id", "")
        sessions.append(TodaySession(
            time=time_str,
            hour=hour,
            customer_id=cid,
            customer_goal=customer_goals.get(cid, ""),
            status="approved",
        ))

    # All pending bookings across the window
    pending: list[PendingBooking] = []
    for doc in bookings_collection().find({"status": "pending"}).sort("time", 1):
        time_str = str(doc.get("time", ""))
        hour = int(time_str[11:13]) if len(time_str) >= 13 else 0
        pending.append(PendingBooking(
            id=doc.get("id", ""),
            customer_id=doc.get("customer_id", ""),
            time=time_str,
            hour=hour,
            note=doc.get("note", ""),
        ))

    return TodayResponse(date=today_prefix, sessions=sessions, pending=pending)


# ── Customers ──────────────────────────────────────────────────────────────


@router.get("/customers", response_model=list[CustomerSummary])
def list_customers(active: bool | None = None, _: None = Depends(_require_admin)) -> list[CustomerSummary]:
    """Return customers. If active param is omitted, returns ALL (active first, then archived)."""
    from src.services.booking_service import today_ict

    query: dict = {}
    if active is True:
        query = {"active": {"$ne": False}}
    elif active is False:
        query = {"active": False}

    docs = customers_collection().find(query, {"_id": 0, "password": 0})
    customer_list = list(docs)

    # Build last/next session lookup from bookings
    today_iso = today_ict().isoformat()
    all_bookings = list(bookings_collection().find(
        {"status": {"$in": ["approved", "pending"]}},
        {"_id": 0, "customer_id": 1, "time": 1, "status": 1},
    ))

    # Group by customer
    last_map: dict[str, str] = {}  # customer_id → most recent past session
    next_map: dict[str, str] = {}  # customer_id → soonest future session

    for b in all_bookings:
        cid = b.get("customer_id", "")
        time_str = str(b.get("time", ""))
        if not time_str or not cid:
            continue
        date_part = time_str[:10]
        if date_part <= today_iso:
            # Past or today — candidate for last_session
            if cid not in last_map or time_str > last_map[cid]:
                last_map[cid] = time_str
        else:
            # Future — candidate for next_session
            if cid not in next_map or time_str < next_map[cid]:
                next_map[cid] = time_str

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
            active=doc.get("active", True),
            last_session=last_map.get(doc.get("id", "")),
            next_session=next_map.get(doc.get("id", "")),
        )
        for doc in customer_list
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
    notify_inbody_added(
        customer_id=customer_id,
        inbody_id=inbody.id,
        date_recorded=_fmt_date(inbody.date_recorded),
    )
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


class AssignBookingRequest(BaseModel):
    customer_id: str = Field(..., description="Customer.id (name)")
    time: str = Field(..., description="Slot key, e.g. '2026-06-15T08:00'")
    note: str = ""


@router.post("/bookings/assign", status_code=201)
def assign_booking(
    body: AssignBookingRequest,
    trainer_id: str = Depends(_require_admin),
) -> dict:
    """Admin-creates a booking for a customer — auto-approved, bypasses capacity."""
    result = admin_assign_booking(
        customer_id=body.customer_id,
        time=body.time,
        trainer_id=trainer_id,
        note=body.note,
    )
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("message", "Đặt lịch thất bại."))
    return result


class BatchAssignRequest(BaseModel):
    customer_id: str = Field(..., description="Customer.id (name)")
    times: list[str] = Field(..., description="List of slot keys, e.g. ['2026-06-15T08:00', ...]")


class BatchAssignResult(BaseModel):
    time: str
    success: bool
    message: str


@router.post("/bookings/batch-assign", status_code=201)
def batch_assign_booking(
    body: BatchAssignRequest,
    trainer_id: str = Depends(_require_admin),
) -> dict:
    """Assign multiple time slots to one member in a single request.

    Returns per-slot results. Sends ONE summary notification to the member
    (not N individual ones). Suppresses trainer self-notification.
    """
    from src.services.notification_service import notify_batch_booking

    name = body.customer_id.strip()
    if not name:
        raise HTTPException(status_code=422, detail="customer_id is required")
    if not body.times:
        raise HTTPException(status_code=422, detail="times list is empty")

    results: list[dict] = []
    success_count = 0
    first_booking_id: str | None = None

    for time_key in body.times:
        result = admin_assign_booking(
            customer_id=name,
            time=time_key,
            trainer_id=trainer_id,
            note="",
        )
        ok = result.get("success", False)
        if ok:
            success_count += 1
            if first_booking_id is None:
                first_booking_id = result.get("booking_id", "")
        results.append({
            "time": time_key,
            "success": ok,
            "message": result.get("message", ""),
        })

    # Send one summary notification to the member
    notification_sent = False
    if success_count > 0 and first_booking_id:
        notify_batch_booking(
            customer_id=name,
            count=success_count,
            related_id=f"batch:{first_booking_id}",
        )
        notification_sent = True

    return {
        "results": results,
        "success_count": success_count,
        "notification_sent": notification_sent,
    }


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


# ── Notifications (trainer-facing, broadcast — see docs/notifications.md) ──


class TrainerNotificationOut(BaseModel):
    id: str
    type: str
    title: str
    message: str
    target: str
    related_id: str
    read: bool
    created_at: str
    read_at: str | None = None


@router.get("/notifications", response_model=list[TrainerNotificationOut])
def get_trainer_notifications(
    unread_only: bool = False, _: str = Depends(_require_admin)
) -> list[TrainerNotificationOut]:
    docs = list_trainer_notifications(unread_only=unread_only)
    return [TrainerNotificationOut(**doc) for doc in docs]


@router.get("/notifications/unread-count")
def get_trainer_unread_count(_: str = Depends(_require_admin)) -> dict:
    return {"count": trainer_unread_count()}


@router.post("/notifications/{notification_id}/read")
def mark_trainer_notification_as_read(
    notification_id: str, _: str = Depends(_require_admin)
) -> dict:
    result = mark_trainer_notification_read(notification_id=notification_id)
    if not result.get("success"):
        raise HTTPException(
            status_code=404, detail=result.get("message", "Không tìm thấy thông báo.")
        )
    return result


@router.post("/notifications/read-all")
def mark_all_trainer_notifications_as_read(_: str = Depends(_require_admin)) -> dict:
    return mark_all_trainer_notifications_read()


# ── Member Management (PT creates/edits/archives members) ─────────────────


class CreateCustomerRequest(BaseModel):
    name: str = Field(..., min_length=1)
    phone_number: str = Field(..., min_length=1)
    age: int | float = Field(..., ge=10)
    goal: str = ""
    health_note: str = ""
    address: str = ""
    height: str = ""
    weight: str = ""


class EditCustomerRequest(BaseModel):
    age: int | float | None = None
    goal: str | None = None
    health_note: str | None = None
    address: str | None = None
    height: str | None = None
    weight: str | None = None
    avatar: str | None = None


@router.post("/customers", status_code=201)
def create_customer(
    body: CreateCustomerRequest,
    _: str = Depends(_require_admin),
) -> dict:
    """PT creates a new member with a temporary password."""
    import random
    import string

    name = body.name.strip()
    phone = body.phone_number.strip()

    if not name:
        raise HTTPException(status_code=422, detail="Họ tên không được để trống.")
    if not phone:
        raise HTTPException(status_code=422, detail="Số điện thoại không được để trống.")

    coll = customers_collection()

    # Check uniqueness
    if coll.find_one({"phone_number": phone}):
        raise HTTPException(status_code=409, detail="Số điện thoại đã tồn tại.")

    # Generate temp password
    temp_password = ''.join(random.choices(string.ascii_letters + string.digits, k=6))
    hashed = _pwd.hash(temp_password)

    customer_doc = {
        "id": name,
        "phone_number": phone,
        "age": body.age,
        "goal": body.goal.strip(),
        "health_note": body.health_note.strip(),
        "address": body.address.strip(),
        "height": body.height.strip(),
        "weight": body.weight.strip(),
        "avatar": "",
        "password": hashed,
        "active": True,
    }
    coll.insert_one(customer_doc)

    return {
        "id": name,
        "phone_number": phone,
        "goal": body.goal.strip(),
        "health_note": body.health_note.strip(),
        "address": body.address.strip(),
        "height": body.height.strip(),
        "weight": body.weight.strip(),
        "avatar": "",
        "age": body.age,
        "temporary_password": temp_password,
    }


@router.patch("/customers/{customer_id}")
def edit_customer(
    customer_id: str,
    body: EditCustomerRequest,
    _: str = Depends(_require_admin),
) -> CustomerSummary:
    """PT edits a member's profile (name and phone locked)."""
    coll = customers_collection()
    doc = coll.find_one({"id": customer_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Hội viên không tồn tại.")

    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if updates:
        coll.update_one({"id": customer_id}, {"$set": updates})

    updated = coll.find_one({"id": customer_id}, {"_id": 0, "password": 0})
    return CustomerSummary(
        id=updated.get("id", ""),
        phone_number=updated.get("phone_number", ""),
        goal=updated.get("goal", ""),
        health_note=updated.get("health_note", ""),
        address=updated.get("address", ""),
        height=updated.get("height", ""),
        weight=updated.get("weight", ""),
        avatar=updated.get("avatar", ""),
        age=updated.get("age"),
    )


@router.post("/customers/{customer_id}/archive")
def archive_customer(customer_id: str, _: str = Depends(_require_admin)) -> dict:
    """Soft-delete: set active=false."""
    coll = customers_collection()
    result = coll.update_one({"id": customer_id}, {"$set": {"active": False}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Hội viên không tồn tại.")
    return {"success": True, "message": "Đã lưu trữ hội viên."}


@router.post("/customers/{customer_id}/restore")
def restore_customer(customer_id: str, _: str = Depends(_require_admin)) -> dict:
    """Restore an archived member."""
    coll = customers_collection()
    result = coll.update_one({"id": customer_id}, {"$set": {"active": True}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Hội viên không tồn tại.")
    return {"success": True, "message": "Đã khôi phục hội viên."}


# ── Trainer Notes (per-customer, PT-only) ──────────────────────────────────


class TrainerNoteOut(BaseModel):
    id: str
    customer_id: str
    trainer_id: str
    content: str
    created_at: str


class AddNoteRequest(BaseModel):
    content: str = Field(..., min_length=1, description="Note content")


@router.get("/customers/{customer_id}/notes", response_model=list[TrainerNoteOut])
def get_customer_notes(
    customer_id: str, _: str = Depends(_require_admin)
) -> list[TrainerNoteOut]:
    """List all trainer notes for a customer, newest first."""
    docs = (
        trainer_notes_collection()
        .find({"customer_id": customer_id}, {"_id": 0})
        .sort("created_at", -1)
    )
    return [TrainerNoteOut(**doc) for doc in docs]


@router.post("/customers/{customer_id}/notes", response_model=TrainerNoteOut, status_code=201)
def add_customer_note(
    customer_id: str,
    body: AddNoteRequest,
    trainer_id: str = Depends(_require_admin),
) -> TrainerNoteOut:
    """Add a new note for a customer."""
    # Verify customer exists
    if not customers_collection().find_one({"id": customer_id}):
        raise HTTPException(status_code=404, detail="Hội viên không tồn tại.")

    note = {
        "id": str(uuid.uuid4()),
        "customer_id": customer_id,
        "trainer_id": trainer_id,
        "content": body.content.strip(),
        "created_at": datetime.utcnow().isoformat(),
    }
    trainer_notes_collection().insert_one(note)
    note.pop("_id", None)
    return TrainerNoteOut(**note)


@router.delete("/customers/{customer_id}/notes/{note_id}")
def delete_customer_note(
    customer_id: str,
    note_id: str,
    _: str = Depends(_require_admin),
) -> dict:
    """Delete a trainer note."""
    result = trainer_notes_collection().delete_one(
        {"id": note_id, "customer_id": customer_id}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy ghi chú.")
    return {"success": True, "message": "Đã xóa ghi chú."}


# ── Blocked Slots ──────────────────────────────────────────────────────────


class CreateBlockRequest(BaseModel):
    date: str = Field(..., description="ISO date, e.g. '2026-08-05'")
    hours: list[int] | str = Field(..., description="List of hours or 'all' for full-day")
    reason: str = ""


class BlockedSlotOut(BaseModel):
    id: str
    date: str
    hours: list[int] | str
    reason: str
    created_at: str
    created_by: str


@router.post("/blocked-slots", response_model=BlockedSlotOut, status_code=201)
def create_block(
    body: CreateBlockRequest,
    trainer_id: str = Depends(_require_admin),
) -> BlockedSlotOut:
    """Block off individual hours or a full day."""
    result = create_blocked_slot(
        date=body.date,
        hours=body.hours,
        reason=body.reason,
        trainer_id=trainer_id,
    )
    return BlockedSlotOut(**result)


@router.get("/blocked-slots", response_model=list[BlockedSlotOut])
def get_blocks(_: str = Depends(_require_admin)) -> list[BlockedSlotOut]:
    """List all blocked slots in the 2-week booking window."""
    from src.services.booking_service import today_ict, window_days

    days = window_days()
    if not days:
        return []
    start = days[0].isoformat()
    end = days[-1].isoformat()
    docs = list_blocked_slots(start_date=start, end_date=end)
    return [BlockedSlotOut(**doc) for doc in docs]


@router.delete("/blocked-slots/{block_id}")
def remove_block(block_id: str, _: str = Depends(_require_admin)) -> dict:
    """Delete a blocked slot."""
    result = delete_blocked_slot(slot_id=block_id)
    if not result.get("success"):
        raise HTTPException(status_code=404, detail=result.get("message", "Không tìm thấy."))
    return result


@router.post("/blocked-slots/{block_id}/cancel-bookings")
def cancel_block_bookings(block_id: str, _: str = Depends(_require_admin)) -> dict:
    """Cancel all bookings that fall within a blocked slot (assisted cancellation)."""
    affected = get_affected_bookings(slot_id=block_id)
    if not affected:
        return {"success": True, "cancelled": 0, "message": "Không có lịch nào bị ảnh hưởng."}
    result = cancel_affected_bookings(slot_id=block_id)
    return result

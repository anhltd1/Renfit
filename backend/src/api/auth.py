"""Authentication routes — customer signup and login."""

import uuid
from datetime import datetime
from typing import Any

from fastapi import APIRouter, HTTPException
from passlib.context import CryptContext
from pydantic import BaseModel, Field

from src.db.mongo import customers_collection, inbody_collection
from src.schema.customer import Customer
from src.schema.inbody import Inbody
from src.services.customer_service import find_customer_by_name
from src.services.notification_service import notify_trainee_registered

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ── Request / Response models ─────────────────────────────────────────────────


class SignupRequest(BaseModel):
    name: str = Field(..., min_length=1, description="Họ và tên đầy đủ (dùng làm ID)")
    phone_number: str = Field(..., min_length=1)
    password: str = Field(..., min_length=6)
    age: int | float = Field(..., ge=10, description="Tuổi (ít nhất 10)")
    goal: str = ""
    health_note: str = ""
    address: str = ""
    height: str = ""
    weight: str = ""
    avatar: str = ""


class LoginRequest(BaseModel):
    phone_number: str
    password: str


class AuthResponse(BaseModel):
    id: str
    phone_number: str
    goal: str
    health_note: str
    address: str
    height: str
    weight: str
    avatar: str
    age: int | float = 0


# ── Helpers ───────────────────────────────────────────────────────────────────


def _customer_response(customer: Customer) -> AuthResponse:
    return AuthResponse(
        id=customer.id,
        phone_number=customer.phone_number,
        goal=customer.goal,
        health_note=customer.health_note,
        address=customer.address,
        height=customer.height,
        weight=customer.weight,
        avatar=customer.avatar,
        age=customer.age,
    )


def _find_by_phone(phone: str) -> dict[str, Any] | None:
    return customers_collection().find_one({"phone_number": phone.strip()})


# ── Endpoints ─────────────────────────────────────────────────────────────────


@router.post("/signup", response_model=AuthResponse, status_code=201)
def signup(body: SignupRequest) -> AuthResponse:
    """Create a new customer account."""
    name = body.name.strip()
    phone = body.phone_number.strip()

    if not name:
        raise HTTPException(status_code=422, detail="Họ tên không được để trống.")
    if not phone:
        raise HTTPException(status_code=422, detail="Số điện thoại không được để trống.")

    coll = customers_collection()

    # Check phone uniqueness
    if _find_by_phone(phone):
        raise HTTPException(
            status_code=409,
            detail="Số điện thoại này đã được đăng ký. Vui lòng đăng nhập.",
        )

    # Check name uniqueness (Customer.id is the name)
    existing_by_name = find_customer_by_name(name)
    if existing_by_name is not None:
        raise HTTPException(
            status_code=409,
            detail="Tên này đã được đăng ký. Vui lòng dùng tên đầy đủ hoặc thêm số phân biệt.",
        )

    hashed = _pwd.hash(body.password)
    customer = Customer(
        id=name,
        phone_number=phone,
        goal=body.goal.strip(),
        health_note=body.health_note.strip(),
        address=body.address.strip(),
        height=body.height.strip(),
        weight=body.weight.strip(),
        avatar=body.avatar,
        password=hashed,
        age=body.age,
    )
    coll.insert_one(customer.model_dump(exclude_none=True))
    notify_trainee_registered(customer_id=name)

    # Create initial Inbody record if height or weight provided
    h = body.height.strip()
    w = body.weight.strip()
    if h or w:
        try:
            inbody = Inbody(
                id=str(uuid.uuid4()),
                customer_id=name,
                height=float(h) if h else 0.0,
                weight=float(w) if w else 0.0,
                date_recorded=datetime.utcnow().isoformat(),
                SMM=0.0,
                BFM=0.0,
            )
            inbody_collection().insert_one(inbody.model_dump())
        except (ValueError, Exception):
            pass  # Inbody creation is best-effort; don't fail signup

    return _customer_response(customer)


@router.post("/login", response_model=AuthResponse)
def login(body: LoginRequest) -> AuthResponse:
    """Authenticate a customer by phone number and password."""
    doc = _find_by_phone(body.phone_number)
    if doc is None:
        raise HTTPException(
            status_code=401,
            detail="Số điện thoại hoặc mật khẩu không đúng.",
        )

    if not _pwd.verify(body.password, doc.get("password", "")):
        raise HTTPException(
            status_code=401,
            detail="Số điện thoại hoặc mật khẩu không đúng.",
        )

    customer = Customer.model_validate(doc)
    return _customer_response(customer)

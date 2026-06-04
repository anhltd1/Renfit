"""Customer operations backed by MongoDB."""

import re
from typing import Any

from src.config.settings import Settings, get_settings
from src.db.mongo import customers_collection
from src.schema.customer import Customer


def _normalize_name(name: str) -> str:
    return " ".join(name.strip().lower().split())


def _id_filter(name: str) -> dict[str, Any]:
    escaped = re.escape(name.strip())
    return {"id": {"$regex": f"^{escaped}$", "$options": "i"}}


def find_customer_by_name(name: str, settings: Settings | None = None) -> Customer | None:
    """Search Customer collection by id (case-insensitive)."""
    _ = settings
    target = _normalize_name(name)
    if not target:
        return None
    doc = customers_collection().find_one(_id_filter(name))
    if doc is None:
        return None
    return Customer.model_validate(doc)


def customer_to_dict(customer: Customer) -> dict[str, str]:
    """API/tool-friendly shape (customer_name aliases MongoDB id)."""
    data = customer.model_dump()
    return {
        "id": str(data["id"]),
        "customer_name": str(data["id"]),
        "phone": str(data.get("phone_number", "")),
        "phone_number": str(data.get("phone_number", "")),
        "goal": str(data.get("goal", "")),
        "health_note": str(data.get("health_note", "")),
        "note": str(data.get("health_note", "")),
        "address": str(data.get("address", "")),
        "height": str(data.get("height", "")),
        "weight": str(data.get("weight", "")),
        "age": str(data.get("age", "")) if data.get("age") is not None else "",
    }


def get_customer_info(
    customer_name: str,
    settings: Settings | None = None,
) -> dict[str, Any]:
    name = customer_name.strip()
    if not name:
        return {"success": False, "message": "customer_name is required"}

    customer = find_customer_by_name(name, settings)
    if customer is None:
        return {
            "success": False,
            "found": False,
            "message": "Customer not found",
        }
    return {
        "success": True,
        "found": True,
        "customer": customer_to_dict(customer),
    }


def _merge_customer(
    existing: Customer | None,
    *,
    customer_id: str,
    phone: str | None = None,
    goal: str | None = None,
    health_note: str | None = None,
    note: str | None = None,
    address: str | None = None,
    height: str | None = None,
    weight: str | None = None,
    age: str | int | float | None = None,
) -> Customer:
    base = existing or Customer(
        id=customer_id,
        phone_number="",
        health_note="",
        goal="",
        address="",
        height="",
        weight="",
        password="",
    )

    def pick_str(new_val: str | None, old_val: str) -> str:
        if new_val is None:
            return old_val
        stripped = new_val.strip()
        return stripped if stripped else old_val

    def pick_age(new_val: str | int | float | None, old_val: int | float | None):
        if new_val is None or (isinstance(new_val, str) and not new_val.strip()):
            return old_val
        if isinstance(new_val, str):
            try:
                return int(new_val) if "." not in new_val else float(new_val)
            except ValueError:
                return old_val
        return new_val

    merged_health = pick_str(health_note, base.health_note)
    if note is not None and note.strip():
        merged_health = pick_str(note, merged_health)

    return Customer(
        id=customer_id,
        phone_number=pick_str(phone, base.phone_number),
        goal=pick_str(goal, base.goal),
        health_note=merged_health,
        address=pick_str(address, base.address),
        height=pick_str(height, base.height),
        weight=pick_str(weight, base.weight),
        password=base.password,
        age=pick_age(age, base.age),
    )


def upsert_customer_info(
    *,
    customer_name: str,
    phone: str = "",
    goal: str = "",
    trainer: str = "",
    health_note: str = "",
    note: str = "",
    height: str = "",
    weight: str = "",
    settings: Settings | None = None,
) -> dict[str, Any]:
    _ = trainer  # reserved for future trainer assignment field
    name = customer_name.strip()
    phone_value = phone.strip()
    if not name:
        return {"success": False, "message": "customer_name is required"}

    _ = settings
    coll = customers_collection()
    existing_doc = coll.find_one(_id_filter(name))
    existing = Customer.model_validate(existing_doc) if existing_doc else None

    if existing is not None:
        merged = _merge_customer(
            existing,
            customer_id=existing.id,
            phone=phone_value or None,
            goal=goal or None,
            health_note=health_note or None,
            note=note or None,
            height=height or None,
            weight=weight or None,
        )
        coll.replace_one({"_id": existing_doc["_id"]}, merged.model_dump())
        return {
            "success": True,
            "upserted": True,
            "created": False,
            "updated": True,
            "message": "Customer information updated successfully",
            "customer": customer_to_dict(merged),
        }

    if not phone_value:
        return {
            "success": False,
            "requires_customer_info": True,
            "message": "phone is required for new customers",
        }

    new_health = health_note.strip()
    if note.strip():
        new_health = note.strip() if not new_health else f"{new_health}; {note.strip()}"

    customer = Customer(
        id=name,
        phone_number=phone_value,
        goal=goal.strip(),
        health_note=new_health,
        address="",
        password="",
        height=height.strip(),
        weight=weight.strip(),
    )
    coll.insert_one(customer.model_dump())
    return {
        "success": True,
        "upserted": True,
        "created": True,
        "updated": False,
        "message": "Customer information saved successfully",
        "customer": customer_to_dict(customer),
    }


def save_customer_info(
    *,
    customer_name: str,
    phone: str,
    goal: str = "",
    trainer: str = "",
    health_note: str = "",
    note: str = "",
    height: str = "",
    weight: str = "",
    settings: Settings | None = None,
) -> dict[str, Any]:
    return upsert_customer_info(
        customer_name=customer_name,
        phone=phone,
        goal=goal,
        trainer=trainer,
        health_note=health_note,
        note=note,
        height=height,
        weight=weight,
        settings=settings,
    )


def update_customer_info(
    *,
    customer_name: str,
    phone: str | None = None,
    goal: str | None = None,
    trainer: str | None = None,
    health_note: str | None = None,
    note: str | None = None,
    height: str | None = None,
    weight: str | None = None,
    settings: Settings | None = None,
) -> dict[str, Any]:
    return upsert_customer_info(
        customer_name=customer_name,
        phone=phone or "",
        goal=goal or "",
        trainer=trainer or "",
        health_note=health_note or "",
        note=note or "",
        height=height or "",
        weight=weight or "",
        settings=settings,
    )

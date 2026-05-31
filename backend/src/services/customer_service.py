"""Customer operations backed by Google Sheets."""

from typing import Any

from src.config.settings import Settings, get_settings
from src.models.customer import Customer
from src.services.sheets.customers import get_customers_repository


def _normalize_name(name: str) -> str:
    return " ".join(name.strip().lower().split())


def find_customer_by_name(name: str, settings: Settings | None = None) -> Customer | None:
    """Search Customers sheet by name (case-insensitive). Returns first match."""
    settings = settings or get_settings()
    repo = get_customers_repository(settings)
    target = _normalize_name(name)
    if not target:
        return None
    for customer in repo.list_all():
        if _normalize_name(customer.customer_name) == target:
            return customer
    return None


def _find_customer_row_index(name: str, settings: Settings) -> int | None:
    repo = get_customers_repository(settings)
    target = _normalize_name(name)

    def matches(record: Customer) -> bool:
        return _normalize_name(record.customer_name) == target

    return repo.find_row_index(matches)


def customer_to_dict(customer: Customer) -> dict[str, str]:
    data = customer.model_dump()
    return {k: str(v) if v is not None else "" for k, v in data.items()}


def get_customer_info(
    customer_name: str,
    settings: Settings | None = None,
) -> dict[str, Any]:
    """Look up customer by name for tools/API."""
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
    customer_name: str,
    phone: str | None = None,
    goal: str | None = None,
    trainer: str | None = None,
    health_note: str | None = None,
    note: str | None = None,
    height: str | None = None,
    weight: str | None = None,
) -> Customer:
    base = existing or Customer(
        customer_name=customer_name,
        phone="",
        goal="",
    )

    def pick(new_val: str | None, old_val: str) -> str:
        if new_val is None:
            return old_val
        stripped = new_val.strip()
        return stripped if stripped else old_val

    return Customer(
        customer_name=customer_name,
        phone=pick(phone, base.phone),
        goal=pick(goal, base.goal),
        trainer=pick(trainer, base.trainer),
        health_note=pick(health_note, base.health_note),
        note=pick(note, base.note),
        height=pick(height, base.height),
        weight=pick(weight, base.weight),
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
    """
    Create or update customer by name (case-insensitive).
    New rows require phone; existing rows merge non-empty fields.
    """
    name = customer_name.strip()
    phone_value = phone.strip()
    if not name:
        return {"success": False, "message": "customer_name is required"}

    settings = settings or get_settings()
    existing = find_customer_by_name(name, settings)

    if existing is not None:
        row_index = _find_customer_row_index(name, settings)
        if row_index is None:
            return {"success": False, "message": "Customer row not found in sheet"}

        merged = _merge_customer(
            existing,
            customer_name=name,
            phone=phone_value or None,
            goal=goal or None,
            trainer=trainer or None,
            health_note=health_note or None,
            note=note or None,
            height=height or None,
            weight=weight or None,
        )
        repo = get_customers_repository(settings)
        repo.update_row(row_index, merged)
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

    repo = get_customers_repository(settings)
    customer = Customer(
        customer_name=name,
        phone=phone_value,
        goal=goal.strip(),
        trainer=trainer.strip(),
        health_note=health_note.strip(),
        note=note.strip(),
        height=height.strip(),
        weight=weight.strip(),
    )
    repo.append(customer)
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
    """Alias for upsert_customer_info."""
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
    """Alias for upsert_customer_info (creates if name not found and phone given)."""
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

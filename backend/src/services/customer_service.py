"""Customer operations backed by MongoDB."""

import re
from datetime import datetime
from typing import Any

from src.config.settings import Settings
from src.db.mongo import customers_collection, inbody_collection
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


# ── InBody history (read-only — records are entered by the trainer) ────────

def _fmt_inbody_date(raw: str | datetime | None) -> str:
    if raw is None:
        return datetime.utcnow().strftime("%Y-%m-%d")
    if isinstance(raw, datetime):
        return raw.strftime("%Y-%m-%d")
    return str(raw)[:10]


def get_inbody_history(customer_id: str) -> dict[str, Any]:
    """Return this customer's InBody records (chronological) for AI/API use."""
    name = customer_id.strip()
    if not name:
        return {"success": False, "message": "customer_id is required"}

    docs = list(
        inbody_collection()
        .find({"customer_id": name}, {"_id": 0})
        .sort("date_recorded", 1)
    )
    records = [
        {
            "id": doc.get("id", ""),
            "date_recorded": _fmt_inbody_date(doc.get("date_recorded")),
            "height": float(doc.get("height", 0)),
            "weight": float(doc.get("weight", 0)),
            "SMM": float(doc.get("SMM", 0)),
            "BFM": float(doc.get("BFM", 0)),
        }
        for doc in docs
    ]

    latest = records[-1] if records else None
    first = records[0] if records else None
    progress: dict[str, float] = {}
    if latest and first and latest is not first:
        progress = {
            "weight_change": round(latest["weight"] - first["weight"], 1),
            "SMM_change": round(latest["SMM"] - first["SMM"], 1),
            "BFM_change": round(latest["BFM"] - first["BFM"], 1),
        }

    return {
        "success": True,
        "customer_id": name,
        "record_count": len(records),
        "records": records,
        "latest": latest,
        "progress_since_first_record": progress,
    }

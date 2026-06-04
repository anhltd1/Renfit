"""MongoDB database access."""

from src.db.mongo import bookings_collection, customers_collection

__all__ = ["customers_collection", "bookings_collection"]

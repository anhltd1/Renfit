"""Notification collection document models.

See ``backend/docs/notifications.md`` for the full design (triggers,
generation mechanism, click-through routing).

Two separate collections/models, kept independent rather than one shared
schema:

* ``Notification`` — customer-facing, always addressed to one
  ``Customer.id`` (booking approvals, reminders, new InBody scores).
* ``TrainerNotification`` — trainer-facing and **broadcast** (no per-trainer
  recipient field): this gym's admin model is effectively single-tenant
  (one shared "admin" dashboard sees every customer/booking), so any
  logged-in trainer sees the same feed and any trainer marking one read
  marks it read for all trainers. Revisit with a real `recipient_id` if
  multi-trainer read-tracking is ever needed.
"""

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class NotificationType(str, Enum):
    BOOKING_APPROVED = "booking_approved"
    SESSION_REMINDER = "session_reminder"
    INBODY_ADDED = "inbody_added"


class Notification(BaseModel):
    """Maps to MongoDB collection `Notification` (customer-facing)."""

    id: str = Field(..., description="Unique notification id (app-generated string)")
    customer_id: str = Field(..., description="References Customer.id — recipient")
    type: NotificationType
    title: str
    message: str
    target: str = Field(
        ..., description='Click-through target, e.g. "dashboard:bookings"'
    )
    related_id: str = Field(
        ..., description="Booking.id or Inbody.id this notification is about"
    )
    read: bool = False
    created_at: datetime | str
    read_at: datetime | str | None = None


class TrainerNotificationType(str, Enum):
    BOOKING_CREATED = "booking_created"
    BOOKING_CANCELLED = "booking_cancelled"
    TRAINEE_REGISTERED = "trainee_registered"


class TrainerNotification(BaseModel):
    """Maps to MongoDB collection `TrainerNotification` (trainer-facing,
    broadcast to every logged-in trainer — see module docstring)."""

    id: str = Field(..., description="Unique notification id (app-generated string)")
    type: TrainerNotificationType
    title: str
    message: str
    target: str = Field(
        ..., description='Click-through target, e.g. "admin:bookings"'
    )
    related_id: str = Field(
        ..., description="Booking.id or Customer.id this notification is about"
    )
    read: bool = False
    created_at: datetime | str
    read_at: datetime | str | None = None

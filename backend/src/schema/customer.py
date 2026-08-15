"""Customer collection document model."""

from pydantic import BaseModel, Field


class Customer(BaseModel):
    """Maps to MongoDB collection `Customer`."""

    id: str = Field(..., description="Unique customer id (app-generated string)")
    phone_number: str = Field(..., description="Unique phone number")
    health_note: str = ""
    goal: str = ""
    address: str = ""
    height: str = ""
    weight: str = ""
    avatar: str = ""
    password: str = Field(..., description="bcrypt hash string")
    age: int | float | None = None
    active: bool = True

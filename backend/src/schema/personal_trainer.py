"""Personal trainer collection document model."""

from pydantic import BaseModel, Field


class PersonalTrainer(BaseModel):
    """Maps to MongoDB collection `Personal_Trainer`."""

    id: str = Field(..., description="Unique trainer id (app-generated string)")
    name: str
    age: int | float
    address: str
    phone_number: str
    password: str = Field(..., description="bcrypt hash string")

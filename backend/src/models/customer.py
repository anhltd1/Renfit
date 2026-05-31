"""Customer record — maps to Google Sheet 1 (Customers)."""

from pydantic import BaseModel, Field

# Example goal values (documentation — free text in sheet, not enforced)
GOAL_EXAMPLES = [
    "weight loss",
    "muscle gain",
    "body recomposition",
    "improve health",
    "rehabilitation",
]


class Customer(BaseModel):
    """Gym customer stored in the Customers spreadsheet."""

    customer_name: str = Field(..., description="Customer full name")
    phone: str = Field(..., description="Customer phone number")
    goal: str = Field(
        ...,
        description="Fitness goal (free text), e.g. weight loss, muscle gain",
    )
    trainer: str = Field(default="", description="Assigned personal trainer")
    health_note: str = Field(
        default="",
        description="Health condition or injury notes",
    )
    note: str = Field(default="", description="Additional notes")
    height: str = Field(
        default="",
        description="Height in centimeters (sheet column: height)",
    )
    weight: str = Field(
        default="",
        description="Weight in kilograms (sheet column: weight)",
    )

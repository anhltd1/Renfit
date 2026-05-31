"""Generic repository mapping sheet rows to Pydantic models."""

from typing import Generic, TypeVar

from pydantic import BaseModel

from src.services.sheets.client import SheetsClient

T = TypeVar("T", bound=BaseModel)


class SheetRepository(Generic[T]):
    def __init__(
        self,
        client: SheetsClient,
        fields: list[str],
        model_class: type[T],
    ):
        self.client = client
        self.fields = fields
        self.model_class = model_class

    def _ensure_header(self) -> None:
        rows = self.client.get_values("A1:Z1")
        if not rows:
            self.client.append_row(self.fields)
            return
        header = [h.strip().lower() for h in rows[0]]
        expected = [f.lower() for f in self.fields]
        if header[: len(expected)] == expected:
            return
        # Backward compatible: core 6 columns — auto-append height / weight headers
        core = [f.lower() for f in self.fields[:6]]
        if len(self.fields) > 6 and header[:6] == core:
            if len(header) < len(self.fields):
                self.client.update_row(1, self.fields, allow_header=True)
            return
        raise RuntimeError(
            f"Sheet header mismatch. Expected {self.fields} (or core {self.fields[:6]}), got {rows[0]}"
        )

    def _row_to_dict(self, row: list[str]) -> dict:
        data: dict = {}
        for i, field in enumerate(self.fields):
            data[field] = row[i].strip() if i < len(row) else ""
        return data

    def list_all(self) -> list[T]:
        self._ensure_header()
        rows = self.client.get_values()
        if len(rows) <= 1:
            return []
        return [self.model_class.model_validate(self._row_to_dict(row)) for row in rows[1:]]

    def update_row(self, row_index: int, record: T) -> None:
        self._ensure_header()
        payload = record.model_dump()
        values = [payload[field] for field in self.fields]
        values = [v.value if hasattr(v, "value") else v for v in values]
        self.client.update_row(row_index, values, allow_header=False)

    def append(self, record: T) -> int:
        self._ensure_header()
        payload = record.model_dump()
        values = [payload[field] for field in self.fields]
        # Enum -> string value
        values = [v.value if hasattr(v, "value") else v for v in values]
        return self.client.append_row(values)

    def delete_row(self, row_index: int) -> None:
        self.client.delete_row(row_index)

    def find_row_index(self, predicate) -> int | None:
        """Return 1-based row index of first data row matching predicate(record)."""
        self._ensure_header()
        rows = self.client.get_values()
        for idx, row in enumerate(rows[1:], start=2):
            record = self.model_class.model_validate(self._row_to_dict(row))
            if predicate(record):
                return idx
        return None

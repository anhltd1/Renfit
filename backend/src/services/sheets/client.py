"""Google Sheets API client (read / append / delete rows)."""

import re
from pathlib import Path
from typing import Any

from google.oauth2 import service_account
from googleapiclient.discovery import build

from src.config.settings import Settings
from src.services.sheets.credentials import validate_service_account_file

SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]


def extract_spreadsheet_id(url: str) -> str:
    match = re.search(r"/spreadsheets/d/([a-zA-Z0-9-_]+)", url)
    if not match:
        raise ValueError(f"Invalid Google Sheets URL: {url}")
    return match.group(1)


class SheetsClient:
    """Low-level Google Sheets v4 operations for one spreadsheet file."""

    def __init__(
        self,
        settings: Settings,
        spreadsheet_url: str,
        tab_name: str = "",
    ):
        if not settings.sheets_configured:
            raise RuntimeError(
                "Google Sheets not configured. Set service account file and sheet URLs in env/.env"
            )

        self.spreadsheet_id = extract_spreadsheet_id(spreadsheet_url)
        self.tab_name = tab_name.strip()
        self._service = self._build_service(settings)

    def _build_service(self, settings: Settings):
        sa_path = settings.service_account_path()
        validate_service_account_file(sa_path)
        creds = service_account.Credentials.from_service_account_file(
            str(sa_path),
            scopes=SCOPES,
        )
        return build("sheets", "v4", credentials=creds, cache_discovery=False)

    def _sheet_id(self) -> int:
        meta = (
            self._service.spreadsheets()
            .get(spreadsheetId=self.spreadsheet_id)
            .execute()
        )
        sheets = meta.get("sheets", [])
        if not sheets:
            raise RuntimeError(f"No worksheets found in spreadsheet {self.spreadsheet_id}")

        if self.tab_name:
            for sheet in sheets:
                title = sheet["properties"]["title"]
                if title == self.tab_name:
                    return sheet["properties"]["sheetId"]
            raise RuntimeError(
                f"Worksheet tab '{self.tab_name}' not found in spreadsheet {self.spreadsheet_id}"
            )

        return sheets[0]["properties"]["sheetId"]

    def _range(self, cell_range: str) -> str:
        prefix = f"'{self.tab_name}'!" if self.tab_name else ""
        return f"{prefix}{cell_range}"

    def get_values(self, cell_range: str = "A:Z") -> list[list[str]]:
        result = (
            self._service.spreadsheets()
            .values()
            .get(spreadsheetId=self.spreadsheet_id, range=self._range(cell_range))
            .execute()
        )
        return result.get("values", [])

    def append_row(self, values: list[Any]) -> int:
        """Append one row; returns 1-based row index of the new row."""
        body = {"values": [[str(v) for v in values]]}
        result = (
            self._service.spreadsheets()
            .values()
            .append(
                spreadsheetId=self.spreadsheet_id,
                range=self._range("A1"),
                valueInputOption="USER_ENTERED",
                insertDataOption="INSERT_ROWS",
                body=body,
            )
            .execute()
        )
        updated = result.get("updates", {}).get("updatedRange", "")
        # e.g. 'Sheet1!A5:F5' -> row 5
        match = re.search(r"!A(\d+)", updated)
        if match:
            return int(match.group(1))
        # Fallback: count existing rows
        existing = self.get_values()
        return len(existing) + 1

    def update_row(
        self, row_index: int, values: list[Any], *, allow_header: bool = False
    ) -> None:
        """Overwrite one row by 1-based index (row 1 = header when allow_header=True)."""
        if row_index < 2 and not allow_header:
            raise ValueError("Cannot update header row")
        if row_index < 1:
            raise ValueError("row_index must be >= 1")
        col = self._column_letter(len(values))
        cell_range = f"A{row_index}:{col}{row_index}"
        body = {"values": [[str(v) for v in values]]}
        (
            self._service.spreadsheets()
            .values()
            .update(
                spreadsheetId=self.spreadsheet_id,
                range=self._range(cell_range),
                valueInputOption="USER_ENTERED",
                body=body,
            )
            .execute()
        )

    @staticmethod
    def _column_letter(count: int) -> str:
        """1-based column index to letter(s), e.g. 1->A, 27->AA."""
        letters = ""
        n = max(count, 1)
        while n > 0:
            n, rem = divmod(n - 1, 26)
            letters = chr(65 + rem) + letters
        return letters

    def delete_row(self, row_index: int) -> None:
        """Delete a row by 1-based index (row 1 = header)."""
        if row_index < 2:
            raise ValueError("Cannot delete header row")

        sheet_id = self._sheet_id()
        self._service.spreadsheets().batchUpdate(
            spreadsheetId=self.spreadsheet_id,
            body={
                "requests": [
                    {
                        "deleteDimension": {
                            "range": {
                                "sheetId": sheet_id,
                                "dimension": "ROWS",
                                "startIndex": row_index - 1,
                                "endIndex": row_index,
                            }
                        }
                    }
                ]
            },
        ).execute()

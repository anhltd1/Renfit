# Backend tests (`backend/test/`)

Integration tests for **Google Sheets** read/write (Customers + Bookings).

## Prerequisites

1. **Service account JSON** at `backend/env/service-account.json`  
   (or set `GOOGLE_SERVICE_ACCOUNT_FILE` in `env/.env`)

2. **Share both spreadsheets** with the service account email  
   (`client_email` inside the JSON file) as **Editor**.

3. **`env/.env`** configured:

   ```env
   GOOGLE_SERVICE_ACCOUNT_FILE=env/service-account.json
   GOOGLE_CUSTOMERS_SHEET_URL=https://docs.google.com/spreadsheets/d/.../edit
   GOOGLE_BOOKINGS_SHEET_URL=https://docs.google.com/spreadsheets/d/.../edit
   ```

4. **Header row (row 1)** in each sheet:

   - Customers: `customer_name`, `phone`, `goal`, `trainer`, `health_note`, `note`, `height`, `weight`
   - Bookings: `customer_name`, `trainer`, `date`, `time`, `status`, `note`

> **Note:** Google Sheets API requires a **service account** for private sheet read/write. `GOOGLE_API_KEY` alone cannot authorize sheet access.

## Run

```bash
cd backend
pip install -r requirements.txt
```

**Windows (recommended if `pytest` fails with langsmith plugin errors):**

```powershell
.\test\run_tests.ps1
```

**Or manually:**

```powershell
$env:PYTEST_DISABLE_PLUGIN_AUTOLOAD = "1"
python -m pytest test/ -v
```

Tests append rows prefixed with `TEST_` and delete them after each run.

## Files

| File | Description |
|------|-------------|
| `test_customers_sheet.py` | List, append, find, delete customer row |
| `test_bookings_sheet.py` | List, append, find, delete booking row |
| `conftest.py` | Skips tests if sheets are not configured |

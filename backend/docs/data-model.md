# MVP Data Model (Google Sheets)

At MVP stage, Renfit uses **two separate Google Spreadsheet files** (not a database). Each object maps to one file configured in `backend/env/.env`.

| Object | Env variable | Spreadsheet purpose |
|--------|--------------|---------------------|
| **Customers** | `GOOGLE_CUSTOMERS_SHEET_URL` | Gym customer profiles |
| **Bookings** | `GOOGLE_BOOKINGS_SHEET_URL` | Training session bookings |

Authentication: `GOOGLE_API_KEY` (Google Cloud, Sheets API enabled).

Python models: `backend/src/models/customer.py`, `backend/src/models/booking.py`.

---

## Sheet 1: Customers

Manage gym customer information.

| Field | Type | Description |
|-------|------|-------------|
| `customer_name` | Text | Customer full name |
| `phone` | Text | Customer phone number |
| `goal` | Text | Customer fitness goal (free text) |
| `trainer` | Text | Assigned personal trainer |
| `health_note` | Text | Health condition or injury notes |
| `note` | Text | Additional notes |
| `height` | Text | Height in centimeters (optional) |
| `weight` | Text | Weight in kilograms (optional) |

Sheets with only the first 6 columns are still supported; the API can auto-append `height` and `weight` headers on first access.

### Example values for `goal`

- weight loss
- muscle gain
- body recomposition
- improve health
- rehabilitation

**Header row (row 1)** in the sheet should use these exact column names for API mapping.

---

## Sheet 2: Bookings

Manage training session bookings between customers and trainers.

| Field | Type | Description | Options |
|-------|------|-------------|---------|
| `customer_name` | Text | Customer who booked the session | |
| `trainer` | Text | Personal trainer for the session | |
| `date` | Date | Training date | |
| `time` | Time | Training start time | |
| `status` | Category | Booking status | `pending`, `confirmed`, `cancelled`, `no_show` |
| `note` | Text | Additional booking notes | |

### Status definitions

| Status | Meaning |
|--------|---------|
| `pending` | Waiting for confirmation |
| `confirmed` | Booking confirmed |
| `cancelled` | Booking cancelled |
| `no_show` | Customer did not attend |

**Header row (row 1)** should match field names above.

---

## Google Sheets setup recommendations

### Dropdown for `status` (Bookings sheet)

Options:

- pending
- confirmed
- cancelled
- no_show

### Formatting

- `date` → Date format
- `time` → Time format

### Sharing

- Share both spreadsheet files with the Google Cloud project / API key access model you use (service account email or public read if using API key constraints per your GCP setup).

---

## Suggested workflow

```
Create customer in Customers sheet
        ↓
Customer requests booking (app / AI / staff)
        ↓
Create new row in Bookings sheet (status: pending)
        ↓
Trainer updates booking status → confirmed | cancelled | no_show
```

---

## Environment

```env
GOOGLE_API_KEY=...
GOOGLE_CUSTOMERS_SHEET_URL=https://docs.google.com/spreadsheets/d/.../edit
GOOGLE_BOOKINGS_SHEET_URL=https://docs.google.com/spreadsheets/d/.../edit
# Optional tab names (default: first worksheet in each file)
GOOGLE_CUSTOMERS_SHEET_TAB=
GOOGLE_BOOKINGS_SHEET_TAB=
```

See [env/README.md](../env/README.md) for setup steps.

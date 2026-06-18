# Backend Tests

Unit tests with fully mocked MongoDB (no live database required).

## Run

```powershell
# From backend/
.\test\run_tests.ps1
```

Or directly with pytest:

```bash
cd backend
pytest test/ -v
```

## Coverage

| Test file | What it covers |
|---|---|
| `test_tools.py` | AI agent tool functions (customer lookup, booking create/cancel, profile update) |
| `test_agent_intake.py` | End-to-end agent response for booking intake flow |

Tests use `unittest.mock.patch` to replace MongoDB collection calls, so no `.env` or live Atlas connection is needed.

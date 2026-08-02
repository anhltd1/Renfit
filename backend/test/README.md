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
| `test_tools.py` | AI agent self-service tools (read-only profile, InBody history, booking availability/create/cancel) — all scoped to a server-bound `customer_id` |
| `test_agent_artifacts.py` | `ChatAgent` login gating and artifact rendering from tool results |

Tests use `unittest.mock.patch` to replace MongoDB collection calls, so no `.env` or live Atlas connection is needed.

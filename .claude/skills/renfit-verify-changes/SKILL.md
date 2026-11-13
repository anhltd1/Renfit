---
name: renfit-verify-changes
description: Run the correct build/test verification gate for Renfit backend or frontend changes and clean up any temporary artifacts afterward. Use before considering any code change to this project complete.
---

# Verify Renfit Changes

Renfit has no CI configured yet, so verification is manual. Use the right gate for the stack you
touched — run both if a change spans backend and frontend.

## Backend changes (`backend/**/*.py`)
1. Run tests from `backend/` (if `backend/.venv` is missing, create it first:
   `python3 -m venv .venv && .venv/bin/pip install -r requirements.txt`):
   ```
   .venv/bin/python -m pytest test/
   ```
2. If the change touches `main.py`, `config/`, or import structure, additionally confirm:
   ```
   .venv/bin/python -c "import src.main"
   ```
3. Fix failures before presenting the change as done.

## Frontend changes (`frontend/**/*.{ts,tsx,css}`)
1. Run the test suite once (not watch mode) from `frontend/`:
   ```
   npm run test
   ```
2. Run the production build:
   ```
   npm run build
   ```
   Use a background process for the build (it can be slow); poll output rather than blocking.
3. **Clean up** the `dist/` output afterward — it's gitignored but shouldn't be left around from an
   ad hoc verification build:
   ```
   rm -rf dist
   ```
4. A chunk-size warning ("Some chunks are larger than 500 kB") is a known, tracked issue (see
   `aidlc-docs/inception/application-design/unit-of-work.md` U7 Performance & PWA) — not a
   failure, don't attempt to fix it ad hoc outside that unit's scope unless explicitly asked.
5. Fix any real build error or test failure before presenting the change as done.

## Both stacks
If a single task touched both backend and frontend (rare — they're loosely coupled via REST),
run both gates above independently.

## Reporting
State plainly what you ran and the result (e.g. "22 tests passed; build succeeded, 2431 modules").
If you could not run a gate (missing dependency, environment issue), say so explicitly rather than
presenting the change as verified.

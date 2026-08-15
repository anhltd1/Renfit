# U17 Web Push Notifications — Code Generation Plan

**Unit**: U17 Web Push Notifications
**FRs**: FR-10 (Web Push replacing polling)
**Dependencies**: U14 (customer schema stable)
**This is the final unit.**

---

## Step 1: Backend — VAPID keys + PushSubscription collection

- [ ] Add `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` to `backend/env/.env.example` and `settings.py`
- [ ] Add `PUSH_SUBSCRIPTION = "PushSubscription"` to `schema/collections.py`
- [ ] Add `push_subscriptions_collection()` to `db/mongo.py`
- [ ] Create `backend/src/schema/push_subscription.py` — model with endpoint, keys, customer_id, is_trainer, created_at

**Files**: 5 files (1 new schema, 4 modified)

---

## Step 2: Backend — push_service.py

- [ ] Create `backend/src/services/push_service.py`
- [ ] Functions:
  - `subscribe(endpoint, keys, customer_id, is_trainer)` → dict
  - `unsubscribe(endpoint)` → dict
  - `send_to_customer(customer_id, title, body, url?)` → dict (sends to all subscriptions for that customer)
  - `send_to_trainers(title, body, url?)` → dict (sends to all trainer subscriptions)
- [ ] Uses `pywebpush` library for VAPID-based push delivery
- [ ] Fire-and-forget: log errors but don't fail the caller

**Files**: 1 new

---

## Step 3: Backend — Push subscribe/unsubscribe endpoints

- [ ] Add a new router `backend/src/api/push.py` with:
  - `POST /api/v1/push/subscribe` — store subscription (upsert by endpoint)
  - `DELETE /api/v1/push/unsubscribe` — remove subscription by endpoint
  - `GET /api/v1/push/vapid-public-key` — return the public key for frontend use
- [ ] Register router in `main.py`

**Files**: 1 new router, 1 modified (main.py)

---

## Step 4: Backend — Integrate push into notification_service

- [ ] `notification_service.py` — after `create_notification()` inserts to DB, also call `push_service.send_to_customer()`
- [ ] `notification_service.py` — after `create_trainer_notification()` inserts to DB, also call `push_service.send_to_trainers()`
- [ ] Both calls are best-effort (wrapped in try/except, never fail the write path)

**Files**: 1 modified

---

## Step 5: Backend — Add pywebpush dependency

- [ ] Add `pywebpush` to `backend/requirements.txt`
- [ ] Generate VAPID keys and add to `.env.example` with instructions

**Files**: 2 modified

---

## Step 6: Backend — Verify

- [ ] Confirm `import src.main` succeeds
- [ ] Rebuild backend container

**Files**: None

---

## Step 7: Frontend — Push API client + VAPID key fetch

- [ ] Add to `frontend/src/lib/api/push.ts` (new file):
  - `fetchVapidPublicKey()` → string
  - `subscribePush(subscription, customerId?, isTrainer?)` → void
  - `unsubscribePush(endpoint)` → void

**Files**: 1 new

---

## Step 8: Frontend — usePushNotifications hook

- [ ] Create `frontend/src/app/shared/hooks/usePushNotifications.ts`
- [ ] On mount: check if push is supported + permission state
- [ ] `subscribe()`: request permission → get push subscription from SW → POST to backend
- [ ] `unsubscribe()`: unsubscribe from SW → DELETE from backend
- [ ] Exposes: `{ supported, permission, subscribed, subscribe, unsubscribe }`

**Files**: 1 new

---

## Step 9: Frontend — Service worker push handler

- [ ] Modify `frontend/public/service-worker.js`:
  - Add `self.addEventListener('push', ...)` — parse push payload, show native notification via `self.registration.showNotification()`
  - Add `self.addEventListener('notificationclick', ...)` — open/focus the app on click

**Files**: 1 modified

---

## Step 10: Frontend — Remove polling from notification hooks

- [ ] `frontend/src/app/shared/hooks/useNotifications.ts` — remove polling interval (push replaces it)
- [ ] `frontend/src/app/shared/hooks/useTrainerNotifications.ts` — remove polling interval
- [ ] Keep the initial fetch on mount (so the dropdown has data immediately)
- [ ] Add a refetch on `visibilitychange` (when user returns to the tab) as a lightweight fallback

**Files**: 2 modified

---

## Step 11: Frontend — Subscribe on login, show permission prompt

- [ ] Wire `usePushNotifications` into `UserDashboardPage` (desktop) and `MobileShell` / user pages (mobile) — call `subscribe()` on mount if not already subscribed
- [ ] Wire into admin dashboard pages for trainer push
- [ ] If permission denied: silently fall back (no broken UX, just no push)

**Files**: ~3 modified

---

## Step 12: Verify & test

- [ ] `npm run build` — no errors
- [ ] `npm run test` — all pass
- [ ] Backend `import src.main` succeeds
- [ ] Docker compose up healthy
- [ ] Clean up `dist/`

**Files**: Test files as needed

---

## Summary

- **Total steps**: 12
- **New files**: 5 (`push_subscription.py`, `push_service.py`, `api/push.py`, `lib/api/push.ts`, `usePushNotifications.ts`)
- **Modified files**: ~9 (`collections.py`, `mongo.py`, `settings.py`, `main.py`, `requirements.txt`, `notification_service.py`, `service-worker.js`, `useNotifications.ts`, `useTrainerNotifications.ts`, dashboard pages)
- **Backend changes**: 1 new collection, 1 new service, 3 new endpoints, notification integration
- **New dependency**: `pywebpush`

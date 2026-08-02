# API Documentation

Base URL: same-origin (frontend proxies `/api` and `/chat` to the backend in dev). All paths are
prefixed as shown. Auth for admin endpoints is enforced via a `_require_admin` dependency.

## REST APIs

### Auth (`/api/v1/auth`)
- **POST `/signup`** — Create a customer account (201). Body: name, phone_number, password, age,
  goal, health_note, address, height, weight, avatar. Returns `AuthResponse`. Triggers a
  "trainee registered" trainer notification.
- **POST `/login`** — Authenticate customer by phone + password. Returns `AuthResponse`.

### Profile (`/api/v1/profile`)
- **PUT ``** — Update the logged-in customer's profile fields. Returns `AuthResponse`.
- **GET `/inbody`** (query: `customer_id`) — InBody records for a customer, sorted by date.
  Returns `list[InbodyRecordOut]`.

### Bookings (`/api/v1/bookings`)
- **GET `/availability`** (query: `customer_id`) — Two-week booking grid with per-slot availability
  (capacity, past/full flags, my_status).
- **POST ``** (201) — Create a booking. Body: customer_id, time. Returns booking id + status.
- **POST `/cancel`** — Cancel a booking. Body: customer_id, booking_id.

### Admin / Trainer (`/api/v1/admin`)
- **POST `/login`** — Trainer login (by `name` against `Personal_Trainer`). Returns token.
- **GET `/customers`** — All customers (passwords excluded). [admin]
- **GET `/customers/{customer_id}/inbody`** — InBody records for a customer. [admin]
- **POST `/customers/{customer_id}/inbody`** (201) — Add an InBody record. [admin]
- **POST `/bookings/assign`** (201) — Assign a session to a member. [admin]
- **GET `/bookings`** — Two-week calendar grouped by day + hour. [admin]
- **PATCH `/bookings/{booking_id}`** — Update booking status (approved/rejected/pending). [admin]
- **GET `/notifications`** (query: `unread_only`) — Trainer notifications. [admin]
- **GET `/notifications/unread-count`** — Trainer unread count. [admin]
- **POST `/notifications/{notification_id}/read`** — Mark a trainer notification read. [admin]
- **POST `/notifications/read-all`** — Mark all trainer notifications read. [admin]

### Chat (`/chat` and `/api/v1/chat`)
- **POST** — AI Coach turn. Body: `ChatRequest` (message, conversation_id, customer_id). Returns
  `ChatResponse` (message, conversation_id, artifact?, suggestions[]).

### Notifications (`/api/v1/notifications`)
- **GET ``** (query: `customer_id`, `unread_only`) — Customer notifications.
- **GET `/unread-count`** (query: `customer_id`) — Unread count.
- **POST `/{notification_id}/read`** (query: `customer_id`) — Mark one read.
- **POST `/read-all`** — Body: `MarkAllReadRequest` (customer_id). Mark all read.

### Health
- **GET `/api/v1/health`** — Status, env, model, mongodb_configured, db_name.

## Internal APIs (AI Coach Tools)
Exposed to Claude by `services/ai/tools.py`:
- `get_my_profile` — read the trainee's profile.
- `get_my_inbody_history` — read InBody history for motivation/progress.
- `get_booking_availability` — open slots (date-scoped; respects past-time constraint).
- `book_slot` — create a booking for the trainee.
- `cancel_booking` — cancel an existing booking.

Each tool returns data plus, where relevant, an `artifact` payload for the frontend to render.

## Data Models (documents)
### Customer (`Customer`)
- Fields: id/phone_number, name, password (bcrypt hash), age, goal, health_note, address, height,
  weight, avatar. Relationships: has many Inbody, Bookings, Notifications, ChatSessions.

### Personal_Trainer (`Personal_Trainer`)
- Fields: name (login), credential. Seeded with a default admin coach.

### Bookings (`Bookings`)
- Fields: customer_id, time (date+hour), status (`pending`/`approved`/`rejected`). Capacity-limited
  per hour; gym closed Sundays; past slots not bookable.

### Inbody (`Inbody`)
- Fields: customer_id, date_recorded, weight, SMM, BFM (and related metrics). History drives charts.

### ChatSession / ChatMessage (`ChatSession`, `ChatMessage`)
- Conversation threads and per-turn messages backing the AI Coach memory.

### Notification (`Notification`) / TrainerNotification (`TrainerNotification`)
- Customer-facing (booking approved, session reminder, new InBody) and trainer-facing (booking
  created/cancelled, trainee registered) notification records; read/unread state.

# Component Methods (V2) — Admin UX & Feature Improvements

Method signatures for new components. Detailed business rules will be defined in Functional Design per unit.

## Backend — blocked_slot_service.py

```python
def create_blocked_slot(*, date: str, hours: list[int] | str, reason: str, trainer_id: str) -> dict
def list_blocked_slots(*, start_date: str, end_date: str) -> list[dict]
def delete_blocked_slot(*, slot_id: str) -> dict
def get_blocked_for_date(date: str) -> set[int]  # returns set of blocked hours
def is_slot_blocked(date: str, hour: int) -> bool
def get_affected_bookings(slot_id: str) -> list[dict]  # bookings in the blocked range
```

## Backend — push_service.py

```python
def subscribe(*, endpoint: str, keys: dict, customer_id: str | None, is_trainer: bool) -> dict
def unsubscribe(*, endpoint: str) -> dict
def send_to_customer(*, customer_id: str, title: str, body: str, url: str | None = None) -> dict
def send_to_trainers(*, title: str, body: str, url: str | None = None) -> dict
```

## Backend — admin.py (new endpoints)

```python
# Today screen
def get_today(trainer_id: str) -> TodayResponse

# Batch booking
def batch_assign(body: BatchAssignRequest, trainer_id: str) -> BatchAssignResponse

# Blocked slots
def create_block(body: CreateBlockRequest, trainer_id: str) -> BlockedSlotOut
def list_blocks(trainer_id: str) -> list[BlockedSlotOut]
def delete_block(block_id: str, trainer_id: str) -> dict
def cancel_block_bookings(block_id: str, trainer_id: str) -> dict

# Member management
def create_customer(body: CreateCustomerRequest, trainer_id: str) -> CreateCustomerResponse
def edit_customer(customer_id: str, body: EditCustomerRequest, trainer_id: str) -> CustomerSummary
def archive_customer(customer_id: str, trainer_id: str) -> dict
def restore_customer(customer_id: str, trainer_id: str) -> dict

# Push subscriptions
def push_subscribe(body: PushSubscribeRequest) -> dict
def push_unsubscribe(body: PushUnsubscribeRequest) -> dict
```

## Frontend — Hooks

### useAdminToday
```typescript
function useAdminToday(): {
  sessions: TodaySession[];
  pending: PendingBooking[];
  loading: boolean;
  error: string;
  refetch: () => Promise<void>;
}
```

### useBatchBooking
```typescript
function useBatchBooking(): {
  active: boolean;
  activate: () => void;
  deactivate: () => void;
  member: CustomerSummary | null;
  setMember: (c: CustomerSummary) => void;
  stagedSlots: Set<string>;  // time keys
  toggleSlot: (timeKey: string) => void;
  fullSlots: string[];  // time keys that are at capacity
  submit: () => Promise<BatchResult>;
  submitting: boolean;
  reset: () => void;
}
```

### useBlockedSlots
```typescript
function useBlockedSlots(): {
  blocks: BlockedSlot[];
  loading: boolean;
  createBlock: (date: string, hours: number[] | 'all', reason: string) => Promise<void>;
  deleteBlock: (id: string) => Promise<void>;
  cancelAffectedBookings: (id: string) => Promise<void>;
  isBlocked: (date: string, hour: number) => boolean;
}
```

### usePushNotifications
```typescript
function usePushNotifications(userId: string | null, isTrainer: boolean): {
  supported: boolean;
  permission: NotificationPermission;
  subscribed: boolean;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
}
```

### useAdminMembers (extended)
```typescript
function useAdminMembers(): {
  customers: CustomerSummary[];
  loading: boolean;
  error: string;
  // Sort
  sort: 'alpha' | 'lastSession' | 'nextSession';
  setSort: (s: Sort) => void;
  // Filter
  showArchived: boolean;
  setShowArchived: (v: boolean) => void;
  // CRUD
  createMember: (data: CreateMemberPayload) => Promise<{ customer: CustomerSummary; tempPassword: string }>;
  editMember: (id: string, data: EditMemberPayload) => Promise<CustomerSummary>;
  archiveMember: (id: string) => Promise<void>;
  restoreMember: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}
```

## Frontend — UI Components

### AdminTodayScreen
```typescript
interface AdminTodayScreenProps {}  // no props — self-contained with hooks
function AdminTodayScreen(): JSX.Element
// Internal: session cards (time, name, goal), pending cards (name, time, approve/reject buttons)
```

### BatchBookingMode
```typescript
interface BatchBookingModeProps {
  onClose: () => void;
  data: AdminBookings;  // calendar data for rendering
}
function BatchBookingMode(props: BatchBookingModeProps): JSX.Element
// Internal: member picker, slot grid overlay, bottom confirm bar
```

### BlockOffManager
```typescript
interface BlockOffManagerProps {
  onClose: () => void;
  date: string;
  hour?: number;  // pre-selected hour if triggered from a cell
}
function BlockOffManager(props: BlockOffManagerProps): JSX.Element
// Internal: hour selector or "full day" toggle, reason input, existing bookings warning
```

### MemberFormModal / MemberFormSheet
```typescript
interface MemberFormProps {
  mode: 'create' | 'edit';
  customer?: CustomerSummary;  // undefined for create
  onClose: () => void;
  onSaved: (customer: CustomerSummary, tempPassword?: string) => void;
}
function MemberFormModal(props: MemberFormProps): JSX.Element
function MemberFormSheet(props: MemberFormProps): JSX.Element
```

### BodyCompositionRing
```typescript
interface BodyCompositionRingProps {
  smm: number;  // kg
  bfm: number;  // kg
  weight: number;  // kg (total)
  size?: number;  // px, default 160
}
function BodyCompositionRing(props: BodyCompositionRingProps): JSX.Element
```

### InbodyComparison
```typescript
interface InbodyComparisonProps {
  first: InbodyRecord;
  latest: InbodyRecord;
}
function InbodyComparison(props: InbodyComparisonProps): JSX.Element
```

### MemberHomeDashboard
```typescript
interface MemberHomeDashboardProps {
  user: AuthUser;
  onNavigateTab: (tab: string) => void;
}
function MemberHomeDashboard(props: MemberHomeDashboardProps): JSX.Element
// Internal: next-session hero, progress strip, InBody snapshot, AI Coach contextual entry
```

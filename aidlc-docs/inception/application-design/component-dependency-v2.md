# Component Dependencies (V2) — Admin UX & Feature Improvements

## Dependency Matrix

| Component | Depends On | Used By |
|---|---|---|
| AdminTodayScreen | useAdminToday, useUpdateBookingStatus | AdminDashboardPage |
| BatchBookingMode | useBatchBooking, useCustomers | AdminBookings |
| BlockOffManager | useBlockedSlots | AdminBookings |
| MemberFormModal | useAdminMembers (create/edit) | CustomerDetail |
| MemberFormSheet | useAdminMembers (create/edit) | CustomerDetailScreen |
| BodyCompositionRing | InBody data (props) | MemberHomeDashboard, ProgressScreen |
| InbodyComparison | InBody data (props) | MemberHomeDashboard, ProgressScreen |
| MemberHomeDashboard | useBookingAvailability, useInbody, useAuth | UserDashboardPage (desktop) |
| MemberHomeScreen | useBookingAvailability, useInbody, useAuth | UserDashboardPage (mobile) |
| usePushNotifications | service-worker, push API | App.tsx (on auth) |
| useAdminToday | lib/api/admin (fetchToday) | AdminTodayScreen |
| useBatchBooking | lib/api/admin (batchAssign) | BatchBookingMode |
| useBlockedSlots | lib/api/admin (blocked slot CRUD) | BlockOffManager, AdminBookings |
| useAdminMembers | lib/api/admin (customers CRUD) | CustomerSidebar, CustomerListScreen |
| push_service.py | pywebpush, PushSubscription collection | notification_service.py |
| blocked_slot_service.py | BlockedSlot collection | booking_service.py, admin.py |

## Data Flow

```
PT opens app
  → AdminDashboardPage defaults to "Hôm nay" tab
    → AdminTodayScreen fetches GET /admin/today
    → Renders sessions list + pending list with inline actions

PT switches to "Lịch đặt" tab
  → AdminBookings renders calendar (existing)
  → "Đặt lịch loạt" toggle → BatchBookingMode overlay
    → Member picker → slot tapping → confirm → POST /admin/bookings/batch-assign
  → Blocked slots rendered from useBlockedSlots (fetched alongside bookings)
  → "Chặn giờ" action → BlockOffManager → POST /admin/blocked-slots

PT switches to "Hội viên" tab
  → CustomerSidebar with sort/filter/search
  → Detail panel (two-column desktop): identity left, notes+InBody right
  → Edit pencil → MemberFormModal
  → Archive → POST /admin/customers/{id}/archive

Member opens app
  → MemberHomeDashboard (next session hero, progress strip, InBody snapshot)
  → Push subscription registered on login (usePushNotifications)
  → Notifications arrive via push (service worker shows native notification)
```

## Integration Points (cross-cutting)

### Blocked Slots ↔ Availability
- `booking_service.build_availability()` queries `BlockedSlot` for the date window
- Each slot gains `blocked: bool, block_reason?: str`
- Frontend booking calendar marks blocked slots as unselectable
- AI Coach `get_available_slots` uses the same `build_availability()` — automatically excluded

### Push ↔ Existing Notifications
- `notification_service.create_notification()` calls `push_service.send_to_customer()` after DB insert
- `create_trainer_notification()` calls `push_service.send_to_trainers()` after DB insert
- Frontend removes polling intervals from `useNotifications` and `useTrainerNotifications`
- Service worker `push` event handler shows OS notification with title/body from push payload

### Archive ↔ Customer Queries
- `customers_collection().find()` in admin endpoints adds `{"active": {"$ne": False}}` by default
- Explicit `?active=false` returns only archived
- `find_customer_by_name()` (used by signup, AI Coach) is NOT filtered — archived members can still be found by exact lookup (their data is preserved)

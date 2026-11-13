# Components (V2) — Admin UX & Feature Improvements

New and modified components for this initiative. Builds on the existing component structure from V1.

## New Backend Components

### BlockedSlot Service (`services/blocked_slot_service.py`) — NEW
- **Purpose**: CRUD for blocked time slots; integration with availability logic
- **Responsibilities**: Create/delete blocked slots, query blocked slots for a date range, check if a specific slot is blocked

### Push Notification Service (`services/push_service.py`) — NEW
- **Purpose**: VAPID-based Web Push delivery, subscription management
- **Responsibilities**: Store/remove push subscriptions, send push notification to all subscriptions for a customer, send broadcast push to trainer subscriptions

## New Frontend Components

### AdminTodayScreen (`desktop/components/AdminTodayScreen.tsx`) — NEW
- **Purpose**: PT's landing view showing today's sessions and pending requests
- **Responsibilities**: Fetch today data from dedicated endpoint, render chronological session list, render pending bookings with inline approve/reject, auto-refresh

### AdminTodayScreenMobile (`mobile/screens/AdminTodayScreen.tsx`) — NEW
- **Purpose**: Mobile equivalent of the Today landing screen
- **Responsibilities**: Same data, mobile-optimized layout with pull-to-refresh

### BatchBookingMode (`components/BatchBookingMode.tsx`) — NEW
- **Purpose**: Multi-slot selection overlay for the admin calendar
- **Responsibilities**: Member picker, slot toggle (stage/unstage), staged-slots bottom bar with count, full-slot warning, single confirm action

### BlockOffManager (`components/BlockOffManager.tsx`) — NEW
- **Purpose**: UI for creating and viewing blocked slots on the admin calendar
- **Responsibilities**: Block individual hours or full days, show reason input, warn about existing bookings, render block indicators on calendar cells

### MemberFormModal (`desktop/components/MemberFormModal.tsx`) — NEW
- **Purpose**: Create or edit a member's profile (PT-side)
- **Responsibilities**: Form for editable fields (age, address, goal, health_note, height, weight, avatar), create mode generates temporary password, validation

### MemberFormSheet (`mobile/components/MemberFormSheet.tsx`) — NEW
- **Purpose**: Mobile equivalent (bottom sheet) of MemberFormModal
- **Responsibilities**: Same form logic, sheet-based presentation

### BodyCompositionRing (`components/BodyCompositionRing.tsx`) — NEW
- **Purpose**: Radial gauge showing SMM vs BFM vs rest proportions
- **Responsibilities**: SVG donut chart from latest InBody record, legend, responsive sizing

### InbodyComparison (`components/InbodyComparison.tsx`) — NEW
- **Purpose**: First-vs-latest InBody measurement comparison
- **Responsibilities**: Two-column layout, per-metric delta arrows, color-coded improvements

### MemberHomeDashboard (`desktop/components/MemberHomeDashboard.tsx`) — NEW
- **Purpose**: Data-driven landing for the member's dashboard (replaces OverviewTab link cards)
- **Responsibilities**: Next session hero card, progress strip (weight + BFM delta), InBody snapshot, contextual AI Coach entry

### MemberHomeDashboardMobile (`mobile/screens/MemberHomeScreen.tsx`) — NEW
- **Purpose**: Mobile equivalent of the member home dashboard
- **Responsibilities**: Same data blocks, mobile layout, pull-to-refresh

## Modified Components

### AdminDashboardPage (desktop + mobile)
- **Change**: Restructure from 2-tab (Hội viên / Lịch đặt) to 3-tab (Hôm nay / Hội viên / Lịch đặt), default to "Hôm nay"
- **Change**: Wire batch booking mode + block-off manager into calendar tab

### DesktopAdminHeader
- **Change**: Add "Hôm nay" tab, update tab structure

### AdminBookings
- **Change**: Add "Đặt lịch loạt" toggle button, integrate BatchBookingMode overlay, render blocked slots with diagonal-hatch

### CustomerSidebar / CustomerListScreen
- **Change**: Add last-session and next-session columns, 3 sort modes, "Đã nghỉ" filter toggle, keyboard nav (desktop), create-member action

### CustomerDetail / CustomerDetailScreen
- **Change**: Two-column layout on desktop (identity left, notes+InBody right), compact hero (~120px), edit/archive actions in header

### OverviewScreen (mobile) / OverviewTab (desktop)
- **Change**: Replace link-menu with MemberHomeDashboard content (next session, progress strip, InBody snapshot)

### ChatPanel / DesktopHeader / AIChat
- **Change**: Remove "Đang hoạt động" status dot and text

### NotificationBell / TrainerNotificationBell
- **Change**: Replace polling with push subscription; remove polling intervals

### Service Worker (`service-worker.js`)
- **Change**: Add push event listener for Web Push notifications

### booking_service.py (backend)
- **Change**: `build_availability()` and AI Coach's `get_available_slots` exclude blocked slots

### admin.py (backend)
- **Change**: New endpoints (today, batch-assign, block slots CRUD, member create/edit/archive, push subscribe/unsubscribe)

### Customer schema
- **Change**: Add `active: bool = True` field; customers list defaults to `active=True`

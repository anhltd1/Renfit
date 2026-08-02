# U5 Trainer Desktop — Business Logic Model

## Route-Entry Device Split
Same pattern as U3: thin route entries pick desktop vs. bridge-mobile.
```
AdminDashboardRoute: const { isMobile } = useDevice(); return isMobile ? MobileAdminDashboardPage : DesktopAdminDashboardPage
AdminLoginRoute: same pattern
```

## Master-Detail Logic (desktop only — no mobile branching in this tree)
- Sidebar customer list + detail pane, both always visible side-by-side (desktop never hides
  either pane — the `mobileShowDetail`/`isMobile` branching in the current combined component is
  entirely a mobile concern, dropped from the desktop tree).
- Selecting a customer in the sidebar updates the detail pane; no navigation/stack involved (this
  mirrors a classic desktop split-view, unlike U4's mobile stack).
- Auto-select first customer on load (existing behavior, preserved): `selected` defaults to
  `customers[0]` once the list loads.
- View toggle (`Hội viên` / `Lịch đặt`) stays a simple two-state toggle in the header, replacing
  `AdminBookings` in the main area when `bookings` is active (existing behavior, preserved).

## InBody Recording Flow (Q5=A — Modal primitive)
```
InbodySection: fetch history (existing fetchInbody), render StackedInbodyChart, "Thêm kết quả" button
  -> opens <Modal> (not the current hand-rolled overlay) containing the add-InBody form
  -> on submit: addInbody() (existing lib/api/admin call, unchanged), close modal, append to local list
```

## Reuse Boundary (Q2=A)
- `AdminBookings.tsx` and `InbodyCharts.tsx` (`StackedInbodyChart`) are imported unchanged into
  the desktop tree — same reasoning as U3's `BookingCalendar.tsx`/`DL-3`: both already function
  correctly and rewriting them isn't required to satisfy TR-3/TR-5's "restyle to DESIGN.md + fix
  defects" goal for the *page shell* they sit inside.
- `TrainerNotificationBell.tsx` is reused unchanged (same as U3 kept `NotificationBell.tsx`
  unrewired) — TR-6 desktop is satisfied by relocating it into the new header, not rewriting it.

## Mobile Bridge (Q1=A — same mechanism as U3's BRIDGE-1/2)
`app/mobile/pages/AdminDashboardPage.tsx` and `AdminLoginPage.tsx` become verbatim copies of
today's combined component, marked TEMPORARY, superseded wholesale by U6.

## Testable Properties (PBT-01)
- No new pure transformation logic in U5 — same situation as U3 (restructuring + relocation +
  Modal-primitive adoption, not new algorithms). The customer search filter (`filtered = customers
  .filter(...)`) is a pre-existing pure function that could become a PBT-03 invariant candidate
  (filtering never returns more items than input) if extracted to a standalone utility during
  code generation — flagged, not blocking.

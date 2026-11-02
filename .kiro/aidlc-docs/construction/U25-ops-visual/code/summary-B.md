# U25 Part B — Summary

**Files**: DesktopAdminHeader(+test), SidebarRow, CustomerDetail, DetailField, InbodySection, InbodySectionMobile, StackHeader, desktop/mobile AdminLoginPage(+tests), desktop/mobile AdminDashboardPage(+tests, 401 only), shared/primitives Button/Modal/Sheet/Tabs, new `shared/components/SessionExpiredNotice.tsx`, new `shared/primitives/ModalSheetOps.test.tsx`.

**New API**: `Modal`/`Sheet` prop `ops?: boolean` (default false) adds `ops-surface` to the panel.

**Behaviour**: 401 → `/admin?expired=1` + banner (hidden once typing); header "Thêm" menu with `setOverride('mobile'|null)`; header tabs `aria-current`.

**Sweep result**: no `text-[10|11px]`, `text-[#0F6B3E]`, `uppercase`, `hover:scale`, `#0A0A0A/#080808`, or `ring-[#0F6B3E]` remain in the Part B files.

**Tests**: `vitest run src/app/desktop src/app/mobile src/app/shared src/app/pages` — only failures were corrupted (U+FFFD) Vietnamese literals in 5 new test files (fixed) and the known InbodySection timeouts (pass alone).

**Leftovers**: dialogs outside Part B that should pass `ops`: MemberFormModal, AddInbodyModal/AddInbodySheet, ConfirmDialog, AdminBookings/CalendarKiosk/BlockOffManager/BatchBookingMode/TrainerNotes dialogs (Part A).

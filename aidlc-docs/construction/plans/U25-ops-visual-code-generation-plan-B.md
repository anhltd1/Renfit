# U25 Part B — Code Generation Plan (header, sweep, primitives, 401)

- [x] 1. FR-11: 401 → `/admin?expired=1` (desktop + mobile AdminDashboardPage); `SessionExpiredNotice` (role=status) on both login pages via `useSearchParams`; plain logout stays `/admin`
- [x] 2. FR-13: DesktopAdminHeader overflow menu "Thêm" (Chế độ điện thoại / Tự động, check on current, Esc/outside close)
- [x] 3. DesktopAdminHeader nav a11y (`nav aria-label`, `aria-current`, `.tap-target`, tokens)
- [x] 4. Token/size sweep: SidebarRow, CustomerDetail, DetailField, InbodySection, InbodySectionMobile, StackHeader, login pages, header
- [x] 5. Primitives: focus ring `#3DBE7A`, close buttons `tap-target`, `ops?: boolean` on Modal and Sheet
- [x] 6. Tabs: roles/`aria-selected` verified (active = filled emerald + white text, kept for member side)
- [x] 7. Tests (header, login x2, dashboard x2, ModalSheetOps); fixed corrupted Vietnamese literals in 5 test files

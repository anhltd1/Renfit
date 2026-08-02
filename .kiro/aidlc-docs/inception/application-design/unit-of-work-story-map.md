# Unit of Work — Story Map

Every story (EN/TS/TR) is assigned to exactly one primary unit. Cross-cutting concerns land in the
dedicated cross-cutting units.

## Enabler / NFR Stories
| Story | Unit | Notes |
|---|---|---|
| EN-1 Device-based rendering | U1 | DeviceProvider/useDevice |
| EN-2 Design conformance & tokens | U1 | primitives + token single-source |
| EN-7 Frontend test setup | U1 | Vitest + RTL + fast-check |
| (FR-5 parity support) | U2 | shared data hooks |
| EN-4 Load performance | U7 | code-splitting/lazy loading |
| EN-5 Runtime performance | U7 | re-render/jank fixes |
| EN-3 PWA completion | U7 | install/launch/verify, SW network-only |
| EN-6 Accessibility | U8 | focus/contrast/keyboard |
| EN-8 Deployment | U9 | Docker Compose on VM + docs |

## Trainee (Minh) Stories
| Story | Device | Unit |
|---|---|---|
| TS-1 Mobile app shell & nav | Mobile | U4 |
| TS-2 Desktop dashboard shell | Desktop | U3 |
| TS-3 Mobile booking flow | Mobile | U4 |
| TS-4 Desktop booking calendar | Desktop | U3 |
| TS-5 AI chat (mobile) | Mobile | U4 |
| TS-6 AI chat (desktop) | Desktop | U3 |
| TS-7 Progress & profile (mobile) | Mobile | U4 |
| TS-8 Progress & profile (desktop) | Desktop | U3 |
| TS-9 Notifications & onboarding | Both | U4 (mobile) + U3 (desktop parity) |
| TS-10 Trainee auth screens | Both | U3 (desktop) + U4 (mobile) |

## Trainer (Trang) Stories
| Story | Device | Unit |
|---|---|---|
| TR-1 Desktop master-detail dashboard | Desktop | U5 |
| TR-2 Mobile management UI | Mobile | U6 |
| TR-3 Booking management (desktop) | Desktop | U5 |
| TR-4 Booking management (mobile) | Mobile | U6 |
| TR-5 InBody recording | Both | U5 (desktop) + U6 (mobile) |
| TR-6 Trainer notifications | Both | U5 (desktop) + U6 (mobile) |
| TR-7 Admin login | Both | U5 (desktop) + U6 (mobile) |

## Coverage Check
- All 8 enabler stories assigned (U1, U2-support, U7, U8, U9). ✅
- All 10 trainee stories assigned (U3 desktop, U4 mobile). ✅
- All 7 trainer stories assigned (U5 desktop, U6 mobile). ✅
- Stories spanning both devices (TS-9, TS-10, TR-5, TR-6, TR-7) are delivered by their respective
  desktop and mobile units.


---

## Implementation Status (updated during Construction)
- [x] EN-1 Device-based rendering — implemented in U1 (DeviceProvider/useDevice/resolveDevice).
- [x] EN-2 Design conformance & tokens — U1 (primitives + theme.css token cleanup). Ongoing adoption
      by feature units U3–U6.
- [x] EN-7 Frontend test setup — implemented in U1 (Vitest + RTL + fast-check).
- [ ] Remaining stories pending in their units (U2–U9).

- [x] U2 Shared data layer — 9 hooks implemented in U2 (booking, admin bookings, InBody, profile,
      chat, notifications x2, auth x2). Supports FR-5; existing components not yet rewired to use
      them — that happens per-screen in U3–U6.

- [x] U3 Trainee desktop — TS-2, TS-8 implemented (new desktop shell/overview);
      TS-4, TS-6 implemented via reuse (BookingCalendar/ChatPanel unchanged, wrapped in new tree);
      TS-10 implemented (desktop auth pages rewired to useAuth()). Temporary mobile bridge created
      for TS-1/3/5/7/9 continuity — real mobile implementation still pending in U4.

- [x] U4 Trainee mobile — TS-1, TS-3, TS-5, TS-7 implemented (new mobile shell/stack nav/screens);
      TS-9 implemented (mobile onboarding via generalized OnboardingTour + notification bell reuse);
      TS-10 implemented (mobile auth pages, full-bleed, useAuth()). Temporary bridge from U3 fully
      retired — app/mobile/pages/* now contains the real native-like implementation.

- [x] U5 Trainer desktop — TR-1 implemented (new desktop master-detail shell: DesktopAdminHeader,
      CustomerSidebar, SidebarRow, CustomerDetail, DetailField, InbodySection); TR-3 implemented
      via reuse (AdminBookings unchanged, wrapped in new tree); TR-5 implemented (InBody
      add/view, AddInbodyModal rebuilt on shared Modal primitive); TR-6 implemented via reuse
      (TrainerNotificationBell unchanged); TR-7 implemented (desktop admin login rewired to
      useAdminAuth()). Temporary mobile bridge created for TR-2/4/5/6/7 continuity — real mobile
      implementation still pending in U6.

- [x] U6 Trainer mobile — TR-2 implemented (new mobile shell: AdminBottomTabBar + per-tab
      useStack(), CustomerListScreen root ↔ CustomerDetailScreen pushed screen); TR-4 implemented
      via reuse (AdminBookings unchanged in the "Lịch đặt" tab); TR-5 implemented (InBody
      add/view, AddInbodySheet rebuilt on shared Sheet primitive); TR-6 implemented via reuse
      (TrainerNotificationBell unchanged, header action on the customer-list root). Temporary
      bridge from U5 fully retired — app/mobile/pages/AdminDashboardPage.tsx and
      AdminLoginPage.tsx now contain the real native-like implementation.

- [x] U7 Performance & PWA — EN-4 implemented (deleted the unused `components/ui/` shadcn scaffold
      + 62 dead npm dependencies; route-level React.lazy/Suspense code-splitting in App.tsx; lazy-
      loaded recharts and react-markdown at their call sites) — bundle went from a single ~947kB
      chunk with a Vite size warning to 27 chunks with no warning. EN-5 implemented (React.memo on
      SidebarRow, BookingCalendar's SlotCell, and a new memoized CustomerRow for the mobile
      customer list; no virtualization — list sizes don't warrant it). EN-3 verified already
      satisfied (PWA manifest/SW/icons) — no code change.

- [x] U8 Accessibility — EN-6 implemented via a repo-wide audit + fix pass: global `:focus-visible`
      green ring (theme.css) fixing the systemic missing-focus-ring gap across hand-rolled buttons;
      `Card` primitive made keyboard-operable when interactive; div-as-clickable elements in
      `AdminBookings.tsx`/`TrainerNotificationBell.tsx` fixed with proper role/tabIndex/keydown;
      new shared `useFocusTrap` hook wired into `Modal`/`Sheet` and the two hand-rolled calendar
      dialogs; ~15 missing icon-button aria-labels added; low-contrast informational text bumped in
      6 files. Deleted confirmed-dead `Booking.tsx`.

- [x] U9 Deployment — EN-8 implemented: `Dockerfile.frontend` rewritten as a multi-stage build
      (Vite production build → Caddy runtime), replacing the previous dev-server-in-production
      setup. New `Caddyfile` serves the SPA, reverse-proxies API calls to the backend, and
      auto-provisions/renews Let's Encrypt TLS. `docker-compose.yml` updated (frontend on 80/443,
      backend's port no longer exposed to the host, DOMAIN/CORS_ORIGINS driven by a new root
      `.env`). `DOCKER.md`/`README.md` document the full production deployment + redeploy/rollback
      runbook. Monitoring/backups/CI-CD intentionally kept manual/delegated per the approved scope
      for a 30-100 user single-VM deployment.

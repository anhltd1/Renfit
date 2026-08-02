# U7 Performance & PWA — Frontend Components

## Files/directories deleted (DEAD-1)
```text
frontend/src/app/components/ui/   (46 files — accordion.tsx, alert-dialog.tsx, alert.tsx,
                                    aspect-ratio.tsx, avatar.tsx, badge.tsx, breadcrumb.tsx,
                                    button.tsx, calendar.tsx, card.tsx, carousel.tsx, chart.tsx,
                                    checkbox.tsx, collapsible.tsx, command.tsx, context-menu.tsx,
                                    dialog.tsx, drawer.tsx, dropdown-menu.tsx, form.tsx,
                                    hover-card.tsx, input-otp.tsx, input.tsx, label.tsx,
                                    menubar.tsx, navigation-menu.tsx, pagination.tsx, popover.tsx,
                                    progress.tsx, radio-group.tsx, resizable.tsx, scroll-area.tsx,
                                    select.tsx, separator.tsx, sheet.tsx, sidebar.tsx, skeleton.tsx,
                                    slider.tsx, sonner.tsx, switch.tsx, table.tsx, tabs.tsx,
                                    textarea.tsx, toggle-group.tsx, toggle.tsx, tooltip.tsx,
                                    use-mobile.ts, utils.ts)
```

## package.json dependencies removed (DEAD-2)
```text
@mui/material, @mui/icons-material, @emotion/react, @emotion/styled,
@radix-ui/react-accordion, @radix-ui/react-alert-dialog, @radix-ui/react-aspect-ratio,
@radix-ui/react-avatar, @radix-ui/react-checkbox, @radix-ui/react-collapsible,
@radix-ui/react-context-menu, @radix-ui/react-dialog, @radix-ui/react-dropdown-menu,
@radix-ui/react-hover-card, @radix-ui/react-label, @radix-ui/react-menubar,
@radix-ui/react-navigation-menu, @radix-ui/react-popover, @radix-ui/react-progress,
@radix-ui/react-radio-group, @radix-ui/react-scroll-area, @radix-ui/react-select,
@radix-ui/react-separator, @radix-ui/react-slider, @radix-ui/react-slot,
@radix-ui/react-switch, @radix-ui/react-tabs, @radix-ui/react-toggle,
@radix-ui/react-toggle-group, @radix-ui/react-tooltip,
cmdk, vaul, embla-carousel-react, react-day-picker, react-hook-form,
class-variance-authority, react-dnd, react-dnd-html5-backend,
react-responsive-masonry, react-slick, canvas-confetti, sonner, next-themes,
@popperjs/core, react-popper, input-otp
```
Kept (still imported): `lucide-react`, `recharts`, `react-markdown`, `clsx`, `tailwind-merge`,
`react-router`, `date-fns` (re-verify no import before final removal decision — see below),
`tw-animate-css` (imported by `tailwind.css`), `motion` (re-verify).

## New files
```text
frontend/src/app/components/LazyLoadFallback.tsx   (+ .test.tsx) — shared Suspense fallback
                                                       (small centered spinner, DESIGN.md tokens)
```

## Modified files

### `frontend/src/app/App.tsx` (SPLIT-1)
- Replace static imports of `LandingPage`, `DashboardRoute`, `LoginRoute`, `SignupRoute`,
  `AdminLoginRoute`, `AdminDashboardRoute` with `React.lazy(() => import('./pages/X'))`.
- Wrap `<AppRoutes />` in a single `<Suspense fallback={<LazyLoadFallback />}>`.
- `AuthGuard`/`AdminGuard`/`DeviceProvider` wiring unchanged.

### `frontend/src/app/components/InbodyCharts.tsx` (SPLIT-3)
- No internal change to `StackedInbodyChart` itself; a new thin lazy wrapper is introduced at each
  of its 2 call sites instead (`app/desktop/components/InbodySection.tsx`,
  `app/mobile/components/InbodySectionMobile.tsx`) OR (simpler, one place) `InbodyCharts.tsx`'s
  export itself becomes `React.lazy`-wrapped and consumers use `<Suspense>` locally. Chosen
  approach: wrap `StackedInbodyChart` at its two call sites with `React.lazy(() =>
  import('../../components/InbodyCharts').then(m => ({ default: m.StackedInbodyChart })))` +
  a local `<Suspense fallback={<div className="h-[180px] animate-pulse rounded-2xl bg-white/5" />}>`.

### `frontend/src/app/mobile/screens/ProgressScreen.tsx` (SPLIT-3)
- The inline `recharts` `LineChart` block is extracted into a small new component
  `ProgressChart.tsx` (colocated, mobile-tree-only) so it can be `React.lazy`-loaded the same way,
  with the same skeleton-style local Suspense fallback.

### `frontend/src/app/components/chat/ChatMessageContent.tsx` consumer
- `ChatPanel.tsx`'s render of `<ChatMessageContent content={msg.content} />` is wrapped with
  `React.lazy` + local `Suspense` (fallback: the raw text without markdown formatting, so the
  message is never invisible while react-markdown loads — just briefly unformatted).

### `frontend/src/app/desktop/components/SidebarRow.tsx`, mobile `CustomerListScreen.tsx` row
  renderer, `frontend/src/app/components/AdminBookings.tsx` (`SlotCell`-equivalent inline JSX),
  `frontend/src/app/components/BookingCalendar.tsx`'s `SlotCell` (MEMO-1)
- Wrap with `React.memo`. `BookingCalendar.tsx`'s `SlotCell` is already a separate function
  component — trivial wrap. `SidebarRow` is already a separate component — trivial wrap.
  `CustomerListScreen`'s inline row map is extracted into a small memoized `CustomerRow`
  sub-component (mobile-tree-only, mirrors desktop's `SidebarRow` split) to make it memoizable.
  `AdminBookings.tsx`'s cells are inline JSX within `.map()`, not extractable without touching a
  file marked "reused as-is" (BOOK-ADMIN-1/DL-3 precedent) — **left unmodified**, deviation noted
  in summary.md.

## Verified, unchanged (PWA-1/PWA-2)
- `frontend/public/manifest.webmanifest`, `service-worker.js`, icons.
- `frontend/src/lib/registerServiceWorker.ts`.
- `frontend/index.html` PWA meta tags.

## Test Plan
- `LazyLoadFallback.test.tsx`: renders without crashing, has an accessible loading indicator.
- `App.test.tsx` (new, if none exists) or existing route tests re-run to confirm lazy routes still
  resolve (React Testing Library's `render` + `findBy*` await the Suspense boundary automatically).
- Existing `SidebarRow.test.tsx`, `BookingCalendar`-adjacent tests, `CustomerListScreen.test.tsx`
  re-run unmodified to confirm `React.memo` wrapping doesn't change behavior.
- `npm run build` output inspected for multiple chunks + no size warning (VERIFY-1).

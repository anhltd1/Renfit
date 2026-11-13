# Personas

## Persona 1 — Minh, the Trainee (Member)
- **Role**: Gym member at a small private gym.
- **Primary device**: Smartphone (uses the installed PWA on the go); occasionally a laptop at home.
- **Goals**:
  - Book and manage training sessions quickly.
  - Track InBody progress and stay motivated.
  - Chat with the AI Coach for plans, nutrition, and booking help.
- **Context**: Checks the app in short bursts (before/after work, at the gym). Expects an app that
  feels native on mobile — thumb-friendly, fast, no fiddly desktop layouts squeezed onto a phone.
- **Pain points (current app)**:
  - Dashboard feels like a shrunk website on mobile, not an app.
  - Inconsistent text colors, box sizing, and proportions make it look unpolished.
  - Slow initial load (large JS bundle).
- **Success looks like**: A native-feeling mobile experience with bottom-tab navigation, smooth
  transitions, and clean `DESIGN.md`-conformant styling.

## Persona 2 — Trang, the Trainer / Coach (Admin)
- **Role**: Personal trainer managing members and the session schedule.
- **Primary device**: Laptop/desktop at the gym front desk; sometimes a phone on the floor.
- **Goals**:
  - Review and act on bookings (approve/reject/assign) efficiently.
  - Record InBody measurements for members.
  - Monitor member status and respond to notifications.
- **Context**: Needs an information-dense desktop view (master-detail) for throughput, plus a
  usable mobile view when away from the desk.
- **Pain points (current app)**:
  - Dashboard density and spacing issues; small styling inconsistencies.
  - Mobile management is a cramped version of the desktop layout.
- **Success looks like**: A crisp, `DESIGN.md`-conformant desktop dashboard and a genuinely mobile
  management view — without losing any current capability.

## Persona 3 — Owner (secondary stakeholder)
- **Role**: Gym owner / operator (30–100 members).
- **Goals**: A polished, premium-feeling product that is cheap and simple to run (single cloud VM),
  reliable for a small user base.
- **Success looks like**: Smooth deploy via Docker Compose; fast, professional UX that reflects the
  premium brand.

## Persona → Story Map
- **Minh (Trainee)**: TS-1…TS-10
- **Trang (Trainer)**: TR-1…TR-7
- **Owner**: EN-3 (PWA), EN-4/EN-5 (performance), EN-8 (deployment)
- **All / cross-cutting**: EN-1 (device rendering), EN-2 (design conformance), EN-6 (accessibility),
  EN-7 (test setup)

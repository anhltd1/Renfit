# Requirements Clarification Questions

Thanks — your answers are clear on the goal (rebuild the frontend UI/UX per `DESIGN.md`, improve
performance, deliver a lightweight mobile PWA, and deploy). A few points need clarifying before I
write the requirements document. Please fill in the `[Answer]:` tags and tell me when done.

---

## Context you should know before answering
- **A PWA scaffold already exists** from earlier work: `frontend/public/manifest.webmanifest`,
  `frontend/public/service-worker.js`, generated icons, `registerServiceWorker.ts`, and responsive
  passes on the dashboards. So "build a PWA" is partly done — the remaining work is completing,
  polishing, and verifying it as part of the UI/UX rebuild.
- **Scope tension**: Q1 said "rebuild the UI/UX" (broad) while Q2 focused on "the dashboard" and
  Q3 said Moderate scope. Question 1 below resolves exactly which surfaces are in scope.

---

## Question 1
Which surfaces should the UI/UX rebuild cover in this iteration?

A) Authenticated app only — User Dashboard + Admin/Trainer Dashboard and their shared components (booking calendar, chat panel, InBody charts, notifications, modals). Marketing/landing pages left as-is.

B) Authenticated app + auth pages (Login, Signup, Admin Login), but not the marketing landing page.

C) Everything — including the marketing landing page and all its sections.

X) Other (please describe after [Answer]: tag below)

[Answer]: Everything except the landing page. Also i have to mention, in the mobile PWS app, you must rebuild most of the component to make it actually look like a native app, not a responsive website. If the user use computer then render computer UI else render mobile UI.

---

## Question 2
By "review, test" (Q1), do you want an automated frontend test setup established as part of this work?

A) Yes — set up a lightweight frontend test runner (Vitest + React Testing Library) and cover key components; this also satisfies the property-based testing choice via fast-check where applicable

B) No — keep verification via `npm run build` + manual review only (current approach); no new test tooling

C) Minimal — add a smoke/render test setup only, no broad coverage

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 3
Where do you want to deploy? (Needed to plan the deploy step.)

A) A single VPS / server via Docker Compose (the repo already has Dockerfiles + compose)

B) A cloud platform-as-a-service (e.g., frontend on a static/edge host + backend on a container host) — please name it after the tag if you have a preference

C) You recommend — propose the simplest reliable option for this stack and I'll confirm

X) Other (please describe after [Answer]: tag below)

[Answer]: A. I will just hire a cloud component and deploy on it. The number of user are only 30-100 (small private gym)

---

## Question 4
For "improve the performance" (Q2), what matters most? (Choose the primary target.)

A) Frontend load performance — bundle size / code-splitting (the app currently ships one ~867 kB JS chunk) and faster first paint

B) Runtime UI smoothness — rendering, re-renders, animation jank on the dashboard

C) Both equally

X) Other (please describe after [Answer]: tag below)

[Answer]: Both and also the style as well not the performance. The UI has some small but redundant errors about text color, box sizing, the ratio,... (especially in the dashboard)

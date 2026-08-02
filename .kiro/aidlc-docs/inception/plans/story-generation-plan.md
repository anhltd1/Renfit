# Story Generation Plan

**Role**: Product Owner
**Purpose**: Convert the approved requirements into user-centered stories with acceptance criteria
and personas, as the backbone for Workflow Planning and Units Generation.

---

## Part A — Planning Questions (please answer)

Fill in each `[Answer]:` tag, then tell me you're done. I've marked a **recommended** option on each.

### Question 1 — Story breakdown approach
How should stories be organized?

A) Persona-based — grouped by Trainee vs Trainer (then by area)

B) User-journey-based — grouped by end-to-end flows (e.g., "book a session", "track progress")

C) Feature-based — grouped by feature area (bookings, chat, InBody, notifications, auth, shell)

D) Hybrid (recommended) — top-level by persona (Trainee/Trainer), each story tagged with device
   scope (desktop / mobile / both) and feature area

X) Other (please describe after [Answer]: tag below)

[Answer]: D

### Question 2 — Device dimension in stories
The rebuild has distinct desktop and native-like mobile experiences. How should stories treat this?

A) Separate stories for desktop and mobile where the experience differs materially (recommended)

B) One story per capability with device-specific acceptance criteria inside it

C) Only call out device differences where they are significant; otherwise device-agnostic

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3 — Acceptance-criteria style
What format for acceptance criteria?

A) Given/When/Then (Gherkin-style) (recommended — pairs well with the fast-check/RTL test setup)

B) Simple bullet checklist per story

C) Given/When/Then for complex stories, bullets for simple ones

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4 — Granularity / size
How granular should stories be?

A) Medium (recommended) — each story is an independently shippable slice (e.g., "Trainee mobile
   booking flow"), sized to map roughly to a unit of work

B) Fine-grained — many small stories (per component/screen)

C) Coarse — few large epics

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 5 — Non-functional coverage as stories
Should cross-cutting NFRs (DESIGN.md conformance, performance/code-splitting, accessibility, PWA,
test setup, deployment) be captured as explicit stories too?

A) Yes — include dedicated NFR/enabler stories alongside feature stories (recommended)

B) No — keep NFRs only in requirements.md; stories cover user features only

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Part B — Execution Checklist (runs after plan approval)

- [x] Generate `personas.md` — Trainee (mobile-first member) and Trainer/Coach (admin) archetypes,
      with goals, contexts, devices, and pain points (incl. the reported dashboard UI issues)
- [x] Generate `stories.md` using the approved breakdown approach (Hybrid)
- [x] Apply INVEST criteria (Independent, Negotiable, Valuable, Estimable, Small, Testable)
- [x] Include acceptance criteria for each story in the approved format (Given/When/Then)
- [x] Tag each story with persona, device scope, and feature area
- [x] Include NFR/enabler stories per Question 5 (EN-1…EN-8)
- [x] Map personas to their relevant stories
- [x] Cross-reference requirements (FR-*/NFR-*) for traceability

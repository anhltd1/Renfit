# Requirements Verification Questions

Please answer each question by filling in the letter choice (and any detail) after the `[Answer]:`
tag. If none of the options fit, choose the **Other** option and describe your preference.
Let me know when you're done and I'll analyze the answers and draft the requirements document.

---

## Question 1
What do you want to build or change in this iteration? (This defines the actual work — Reverse
Engineering only documented the existing system.)

A) A new feature (describe it after the tag)

B) Fix / pay down the tech-debt items from the assessment (frontend tests, remove unrouted dead pages, extract the startup DB migration, bundle code-splitting)

C) A refactor or code-quality improvement to existing code (describe the target)

D) An enhancement to an existing feature (bookings, InBody tracking, AI Coach, notifications, onboarding — describe which)

E) You pick — propose the highest-value work based on the code-quality assessment, and I'll confirm

X) Other (please describe after [Answer]: tag below)

[Answer]: The backend works fine but the frontend UI/UX is low quality. I want to review, test and rebuild the UI/UX but you have to follow what defined in design.md (our UI/UX philosophy). Moreover, I want to build a progressive web app (lightway to work in mobile) then help me deploy as well. Thats all

---

## Question 2
If you chose a specific feature/change above, what is the primary goal or outcome it should
achieve? (Skip if you chose E "You pick".)

A) Improve the trainee experience (booking, progress, coaching)

B) Improve the trainer/admin experience (management, monitoring)

C) Improve reliability / quality / maintainability of the system

D) Improve performance or scalability

X) Other (please describe after [Answer]: tag below)

[Answer]: The color, box sizing and most UI components in the dashboard is not very friendly for user. Improve the performance and UI/UX for me

---

## Question 3
What is the intended scope for this iteration?

A) Small / focused — a single component or endpoint

B) Moderate — a few components across frontend and/or backend

C) Large — system-wide or spanning many components

X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 4: Security Extensions
Should security extension rules be enforced for this project?

A) Yes — enforce all SECURITY rules as blocking constraints (recommended for production-grade applications)

B) No — skip all SECURITY rules (suitable for PoCs, prototypes, and experimental projects)

X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 5: Resiliency Extensions
Should the resiliency baseline be applied to this project?

Enabling it applies directional, design-time best practices (from the AWS Well-Architected
Reliability Pillar) toward fault tolerance, high availability, observability, and recoverability.
It is a starting point, not a production-readiness guarantee.

A) Yes — apply the resiliency baseline as directional best practices and design-time guidance (recommended for business-critical workloads)

B) No — skip the resiliency baseline (suitable for PoCs, prototypes, and experimental projects where rapid iteration matters more than reliability)

X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 6: Property-Based Testing Extension
Should property-based testing (PBT) rules be enforced for this project?

A) Yes — enforce all PBT rules as blocking constraints (recommended for projects with business logic, data transformations, serialization, or stateful components)

B) Partial — enforce PBT rules only for pure functions and serialization round-trips (suitable for projects with limited algorithmic complexity)

C) No — skip all PBT rules (suitable for simple CRUD applications, UI-only projects, or thin integration layers with no significant business logic)

X) Other (please describe after [Answer]: tag below)

[Answer]: B

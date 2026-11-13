# U1 Foundation — Functional Design Plan

**Unit**: U1 Foundation (EN-1 device rendering, EN-2 design conformance/tokens, EN-7 test harness).

## Clarifying Questions
No open clarifying questions — the architecture and decisions for U1 were settled and approved in
Application Design (separate trees, enhanced detection, token single-source, Vitest/RTL/fast-check).
Proceeding directly to artifact generation.

## Execution Checklist
- [x] business-logic-model.md — device detection resolution + token resolution logic
- [x] business-rules.md — detection rules, override precedence, design-conformance & a11y rules, PBT properties
- [x] domain-entities.md — DeviceClass/DeviceState, design-token model
- [x] frontend-components.md — DeviceProvider + primitive component hierarchy, props/state, test setup

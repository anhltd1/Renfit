---
name: renfit-component-scaffold
description: Scaffold a new DESIGN.md-conformant React component for the Renfit frontend, including the shared-primitive imports, device-aware pattern, and a colocated Vitest/RTL test. Use when creating a new UI component, screen, or shared primitive in frontend/src/app/.
---

# Renfit Component Scaffold

Use this when creating a **new** React component in `frontend/src/app/` (a screen, a shared
primitive, or a reusable piece of UI) — not for editing existing components.

## Before scaffolding
1. Check `.kiro/steering/frontend-architecture.md` for whether this component belongs in
   `app/shared/`, `app/desktop/`, or `app/mobile/` (device-based rendering split). If the
   desktop/mobile trees for this screen don't exist yet, check
   `.kiro/aidlc-docs/aidlc-state.md` for the current unit before assuming where it goes.
2. Check `app/shared/primitives/` first — if the component is a generic UI atom (button, card,
   input, modal/sheet, toast, tabs), it probably already exists; extend it instead of duplicating.

## Scaffold steps
1. **File placement**: `ComponentName.tsx` in the appropriate folder (PascalCase filename,
   named export `export function ComponentName(...)`).
2. **Imports**: pull primitives from `@/app/shared/primitives` (or relative path), the `cn` helper
   for conditional classes, and `useDevice()` from `@/app/device/useDevice` only if the component
   needs to branch behavior by device (most components should NOT branch internally — device
   selection happens at the tree/route level; see frontend-architecture.md).
3. **Styling**: apply tokens from `.kiro/steering/design-system.md` — dark background, `#0F6B3E`
   primary, glassmorphism cards, pill buttons, 8px spacing grid, `leading-relaxed` on all
   Vietnamese text, visible focus rings. Never introduce a new color or a light-mode variant.
4. **Vietnamese text**: all user-facing strings in Vietnamese, no `uppercase`.
5. **Accessibility**: add `data-testid="{component}-{element-role}"` to interactive elements
   (buttons, inputs, links) using stable, semantic names — never dynamic/generated ids.
6. **Test file**: create `ComponentName.test.tsx` colocated in the same folder. Cover: renders
   expected content, fires callbacks on interaction, and (if the component wraps a primitive with
   states like loading/error/disabled) each state. Use `render`/`screen`/`fireEvent` from RTL —
   see `.kiro/steering/testing-conventions.md`.
7. **Verify**: run `npm run test` and `npm run build` from `frontend/` before considering the
   component done.

## Template skeleton
```tsx
import React from 'react';
import { cn } from '../shared/primitives/cn'; // adjust relative path

export interface ComponentNameProps {
  className?: string;
  // ...
}

export function ComponentName({ className, ...rest }: ComponentNameProps) {
  return (
    <div className={cn('rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8', className)}>
      {/* Vietnamese content here */}
    </div>
  );
}
```

## Common mistakes to avoid
- Solid card backgrounds instead of `bg-white/5 backdrop-blur-*` glassmorphism.
- Generic Tailwind `green-*` instead of `#0F6B3E`.
- Uppercased Vietnamese text.
- Branching desktop/mobile JSX inline in a leaf component instead of at the tree/route level.
- Forgetting the colocated test file.

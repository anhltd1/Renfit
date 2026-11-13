# U1 Foundation — Domain Entities (client-side types)

## DeviceClass
```ts
type DeviceClass = 'desktop' | 'mobile';
```

## DeviceSignals (detection inputs)
```ts
interface DeviceSignals {
  viewportWidth: number;   // window.innerWidth
  coarsePointer: boolean;  // matchMedia('(pointer: coarse)')
  noHover: boolean;        // matchMedia('(hover: none)')
  override: DeviceClass | null;
}
```

## DeviceState (context value)
```ts
interface DeviceState {
  device: DeviceClass;
  isMobile: boolean;
  isDesktop: boolean;
  override: DeviceClass | null;
  setOverride(next: DeviceClass | null): void;
}
```

## DesignToken model (conceptual — realized as CSS vars / Tailwind theme)
```ts
interface DesignTokens {
  colors: { background; primary; primaryHover; surface; border; textPrimary;
            textSecondary; textTertiary; success; warning; error; accentGlow };
  radius: { sm; md; lg; xl; full };
  spacing: Record<'xs'|'sm'|'md'|'lg'|'xl'|'2xl'|'3xl'|'4xl', string>; // 8px grid
  font: { family: 'Be Vietnam Pro, Inter, ...'; weights; scale };
  motion: { fast: '200ms'; normal: '300ms'; slow: '500ms'; easingDefault };
}
```
- **Relationship**: `DesignTokens` are the single source consumed by all primitives; values mirror
  `DESIGN.md`. No component declares raw color/spacing literals.

## Persistence
- `override` persists in `localStorage` under a dedicated key (e.g. `renfit.deviceOverride`).
- No other U1 entity is persisted server-side; no backend schema involved.

import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge only knows Tailwind's default scales. Register the DESIGN.md v2
 * radius tokens (`rounded-panel` / `rounded-control` / `rounded-chip`, defined in
 * theme.css `@theme`) so an override like `cn('rounded-panel', 'rounded-full')`
 * resolves to the last one instead of keeping both.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      radius: ['panel', 'control', 'chip'],
    },
  },
});

/** Merge Tailwind class names with conflict resolution. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

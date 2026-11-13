import React from 'react';
import { cn } from './cn';

/**
 * Tabs primitive (U1 Foundation) — accessible segmented tabs.
 * Keyboard operable. DESIGN.md v2: a neutral segmented control — the active
 * segment is a lighter surface, not a green fill (green is for data).
 */
export interface TabItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (key: string) => void;
  className?: string;
}

export function Tabs({ items, value, onChange, className }: TabsProps) {
  return (
    <div role="tablist" className={cn('flex gap-1 rounded-control bg-surface border border-line p-1', className)}>
      {items.map((item) => {
        const active = item.key === value;
        return (
          <button
            key={item.key}
            role="tab"
            type="button"
            aria-selected={active}
            data-testid={`tab-${item.key}`}
            onClick={() => onChange(item.key)}
            className={cn(
              'flex-1 inline-flex items-center justify-center gap-2 rounded-[7px] px-4 py-2 text-sm font-medium',
              'transition-colors duration-[var(--motion-fast)] outline-none focus-visible:ring-2 focus-visible:ring-primary-text',
              active ? 'bg-surface-3 text-white' : 'text-white/64 hover:text-white hover:bg-surface-2',
            )}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

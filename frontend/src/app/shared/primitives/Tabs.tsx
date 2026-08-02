import React from 'react';
import { cn } from './cn';

/**
 * Tabs primitive (U1 Foundation) — accessible segmented tabs.
 * Keyboard operable, green active state + focus ring per DESIGN.md.
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
    <div role="tablist" className={cn('flex gap-1 rounded-2xl bg-white/5 p-1', className)}>
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
              'flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium',
              'transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-[#0F6B3E]',
              active ? 'bg-[#0F6B3E] text-white' : 'text-white/60 hover:text-white hover:bg-white/5',
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

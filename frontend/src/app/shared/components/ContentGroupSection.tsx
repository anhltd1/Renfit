import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../primitives/cn';

export interface ContentGroupSectionProps {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function ContentGroupSection({
  title,
  icon,
  defaultOpen = false,
  children,
}: ContentGroupSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="w-full">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-3 w-full bg-white/5 rounded-xl px-4 py-3',
          'text-left transition-colors duration-300 hover:bg-white/10',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6B3E]',
        )}
      >
        {icon && <span className="text-[#0F6B3E]">{icon}</span>}
        <span className="flex-1 text-white font-medium text-sm leading-relaxed">{title}</span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-white/40 transition-transform duration-300',
            open && 'rotate-180',
          )}
        />
      </button>

      {/* Content */}
      {open && (
        <div className="mt-3 space-y-4 animate-fade-up">
          {children}
        </div>
      )}
    </div>
  );
}

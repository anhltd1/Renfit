/**
 * Desktop admin customer-detail field row (U5 Trainer Desktop, EXT-1).
 * Extracted from the combined AdminDashboardPage.tsx — same visual content.
 */
import type { ReactNode } from 'react';

export interface DetailFieldProps {
  icon: ReactNode;
  label: string;
  value: string | number;
}

export function DetailField({ icon, label, value }: DetailFieldProps) {
  return (
    <div className="flex gap-3 py-3 border-b border-white/6 last:border-0">
      <div className="w-8 h-8 rounded-xl bg-[#0F6B3E]/12 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-[#0F6B3E]">{icon}</span>
      </div>
      <div>
        <p className="text-white/35 text-[11px] uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-white/90 text-sm leading-relaxed">{value}</p>
      </div>
    </div>
  );
}

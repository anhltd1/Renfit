/**
 * Desktop admin customer sidebar row (U5 Trainer Desktop, EXT-1).
 * Extracted from the combined AdminDashboardPage.tsx — same visual content,
 * with a stable data-testid for RTL queries.
 */
import React from 'react';
import { Phone, User } from 'lucide-react';
import type { CustomerSummary } from '../../../lib/api/admin';

export interface SidebarRowProps {
  customer: CustomerSummary;
  selected: boolean;
  onClick: () => void;
}

export const SidebarRow = React.memo(function SidebarRow({ customer, selected, onClick }: SidebarRowProps) {
  return (
    <button
      type="button"
      data-testid={`sidebar-row-${customer.id}`}
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-all rounded-lg ${
        selected
          ? 'bg-[#0F6B3E]/20 border border-[#0F6B3E]/30'
          : 'hover:bg-white/5 border border-transparent'
      }`}
    >
      {customer.avatar ? (
        <img
          src={customer.avatar}
          alt={customer.id}
          className="w-8 h-8 rounded-full object-cover shrink-0 border border-white/10"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-[#0F6B3E]/12 border border-[#0F6B3E]/20 flex items-center justify-center shrink-0">
          <User className="w-3.5 h-3.5 text-[#0F6B3E]" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${selected ? 'text-white' : 'text-white/75'}`}>
          {customer.id}
        </p>
        <p className="text-white/35 text-xs truncate flex items-center gap-1 mt-0.5">
          <Phone className="w-2.5 h-2.5 shrink-0" />
          {customer.phone_number}
          {customer.last_session && (
            <span className="text-white/20 ml-1">· {customer.last_session.slice(8, 10)}/{customer.last_session.slice(5, 7)}</span>
          )}
        </p>
      </div>
      {customer.active === false ? (
        <span className="hidden lg:block text-[10px] px-2 py-0.5 rounded-full border shrink-0 bg-red-500/10 border-red-500/20 text-red-400/70">
          Đã nghỉ
        </span>
      ) : customer.goal ? (
        <span
          className={`hidden lg:block text-[10px] px-2 py-0.5 rounded-full border shrink-0 max-w-[80px] truncate ${
            selected
              ? 'bg-[#0F6B3E]/30 border-[#0F6B3E]/40 text-[#0F6B3E]'
              : 'bg-white/5 border-white/10 text-white/40'
          }`}
        >
          {customer.goal}
        </span>
      ) : null}
    </button>
  );
});

/**
 * Desktop admin customer sidebar row (U5 Trainer Desktop, EXT-1).
 *
 * Calm two-line row: name, then the member's goal. The phone number lives in
 * the detail header (and stays searchable); the last-session date is a single
 * quiet value on the right instead of a pill per row.
 */
import React from 'react';
import { User } from 'lucide-react';
import type { CustomerSummary } from '../../../lib/api/admin';

export interface SidebarRowProps {
  customer: CustomerSummary;
  selected: boolean;
  onClick: () => void;
}

function shortDate(iso: string): string {
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
}

export const SidebarRow = React.memo(function SidebarRow({ customer, selected, onClick }: SidebarRowProps) {
  const archived = customer.active === false;
  return (
    <button
      type="button"
      data-testid={`sidebar-row-${customer.id}`}
      aria-current={selected ? 'true' : undefined}
 onClick={onClick}
 className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors rounded-control border ${
 selected
 ? 'bg-[#0F6B3E]/20 border-[#0F6B3E]/30'
          : 'border-transparent hover:bg-white/5'
      }`}
    >
      {customer.avatar ? (
        <img
          src={customer.avatar}
          alt=""
          className="w-9 h-9 rounded-full object-cover shrink-0 border border-line"
        />
      ) : (
        <div className="w-9 h-9 rounded-full bg-surface-2 border border-line flex items-center justify-center shrink-0">
          <User className="w-4 h-4 text-primary-text" aria-hidden="true" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`text-sm font-medium truncate ${selected ? 'text-white' : 'text-white/90'}`}>
            {customer.id}
          </p>
          {archived && <span className="text-xs text-error-text shrink-0">Đã nghỉ</span>}
        </div>
        <p className="text-white/64 text-xs truncate mt-0.5">{customer.goal || 'Chưa đặt mục tiêu'}</p>
      </div>
      {customer.last_session && (
        <span className="text-white/64 text-xs tabular-nums shrink-0">
          <span className="sr-only">Buổi gần nhất </span>
          {shortDate(customer.last_session)}
        </span>
      )}
    </button>
  );
});

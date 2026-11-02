/**
 * AdminTodayScreen — the "Hôm nay" hub (U11 → U23).
 * Hero (đang tập / tiếp theo), unmarked-attendance chip, today's sessions with
 * inline attendance once a session has started, and pending bookings grouped
 * by day. Used by BOTH the desktop and mobile trees.
 */
import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Calendar, CalendarDays, Check, Clock, RotateCcw, Users } from 'lucide-react';
import { useAdminToday } from '../../shared/hooks/useAdminToday';
import { useFreshness } from '../../shared/hooks/useFreshness';
import { useToast } from '../../shared/hooks/useToast';
import { FreshnessIndicator } from '../../shared/components/FreshnessIndicator';
import { StatusBadge } from '../../shared/booking/StatusBadge';
import {
  BookingStatusActions,
  hasSessionStarted,
  useBookingStatusChange,
} from '../../shared/booking/BookingStatusActions';
import { isBookingStatusKey } from '../../shared/booking/statusMeta';
import { countdownLabel, groupPendingByDay, pickCurrentAndNext } from '../../shared/booking/todayModel';
import { cn } from '../../shared/primitives/cn';
import { CalendarKiosk } from '../../components/CalendarKiosk';
import type { TodaySession } from '../../../lib/api/admin';

const VIET_DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const COUNTDOWN_TICK_MS = 30_000;

function fmtTime(time: string): string {
  return time.slice(11, 16) || time;
}

function fmtDate(iso: string): string {
  const [, m, d] = iso.split('-');
  const dt = new Date(iso);
  return `${VIET_DAYS[dt.getDay()]} · ${d}/${m}`;
}

export interface AdminTodayScreenProps {
  onOpenMember?: (customerId: string) => void;
  headerActions?: React.ReactNode;
}

export function AdminTodayScreen({ onOpenMember, headerActions }: AdminTodayScreenProps = {}) {
  const { data, loading, error, refetch, setPaused } = useAdminToday();
  const { lastUpdatedAt, offline } = useFreshness({ loading, error, data });
  const [now, setNow] = useState(() => new Date());
  const [kioskOpen, setKioskOpen] = useState(false);
  const { show, node: toastNode } = useToast();
  const { change } = useBookingStatusChange({ show, refresh: () => refetch(true) });

  // One interval drives countdowns and the "started" gate for attendance actions.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), COUNTDOWN_TICK_MS);
    return () => clearInterval(id);
  }, []);

  const sessions = data?.sessions ?? [];
  const pending = data?.pending ?? [];
  const { current, next } = useMemo(() => pickCurrentAndNext(sessions, now), [sessions, now]);
  const groups = useMemo(() => groupPendingByDay(pending, now), [pending, now]);

  const handleChange = async (
    booking: { id: string; customer_id: string },
    nextStatus: Parameters<typeof change>[1],
    prev: Parameters<typeof change>[2],
  ) => {
    setPaused(true);
    try {
      await change(booking, nextStatus, prev);
    } finally {
      setPaused(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="ops-surface flex-1 flex items-center justify-center">
        <div className="space-y-3 w-full max-w-lg px-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-white/[0.04] rounded-xl animate-pulse" />
          ))}
        </div>
        {toastNode}
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="ops-surface flex-1 flex flex-col items-center justify-center gap-3 p-4">
        <p className="text-error-text text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3 leading-relaxed">{error}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="tap-target px-5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm active:scale-[0.97] transition-colors"
        >
          Thử lại
        </button>
        {toastNode}
      </div>
    );
  }

  const dateLabel = data?.date ? fmtDate(data.date) : '';
  const unmarked = data?.unmarked_count ?? 0;

  const openMember = (id: string) => onOpenMember?.(id);
  const bodyBtnClass =
    'flex-1 min-w-0 text-left rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3DBE7A]';

  const heroCard = (s: TodaySession, label: string) => {
    const inner = (
      <>
        <span className="text-xs text-white/60 leading-relaxed">{label}</span>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-white font-bold text-lg tabular-nums">{fmtTime(s.time)}</span>
          <span className="text-white font-bold text-lg truncate">{s.customer_id}</span>
          {isBookingStatusKey(s.status) && <StatusBadge status={s.status} />}
        </div>
        <p className="text-white/60 text-sm mt-1 tabular-nums" data-testid="hero-countdown">
          {countdownLabel(s.time, now)}
        </p>
      </>
    );
    return onOpenMember ? (
      <button
        key={label}
        type="button"
        data-testid={`hero-${label === 'Đang tập' ? 'current' : 'next'}`}
        onClick={() => openMember(s.customer_id)}
        aria-label={`${label}: ${s.customer_id} lúc ${fmtTime(s.time)}`}
        className="tap-target text-left bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3DBE7A]"
      >
        {inner}
      </button>
    ) : (
      <div
        key={label}
        data-testid={`hero-${label === 'Đang tập' ? 'current' : 'next'}`}
        className="bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3"
      >
        {inner}
      </div>
    );
  };

  return (
    <div className="ops-surface flex-1 min-h-0 h-full flex flex-col">
      <div
        className="app-chrome shrink-0 flex items-center justify-between gap-2 px-4 pb-2 border-b border-white/10"
        style={{ paddingTop: 'max(0.75rem, var(--safe-top, 0px))' }}
      >
        <div className="min-w-0">
          <h2 className="text-white font-bold text-base leading-relaxed">Hôm nay</h2>
          <p className="text-white/60 text-xs leading-relaxed tabular-nums">{dateLabel}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <FreshnessIndicator lastUpdatedAt={lastUpdatedAt} offline={offline} className="mr-1" />
          <button
            type="button"
            onClick={() => refetch()}
            className="tap-target flex items-center justify-center rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Làm mới"
          >
            <RotateCcw className={cn('w-4 h-4', loading && 'animate-spin')} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setKioskOpen(true)}
            className="tap-target inline-flex items-center gap-1.5 px-3 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 text-sm transition-colors"
            aria-label="Lịch để bàn"
          >
            <CalendarDays className="w-4 h-4" aria-hidden="true" />
            <span className="hidden lg:inline">Lịch để bàn</span>
          </button>
          {headerActions}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain p-4 space-y-5">
        {(current || next) && (
          <div className="grid gap-2 md:grid-cols-2" data-testid="today-hero">
            {current && heroCard(current, 'Đang tập')}
            {next && heroCard(next, 'Tiếp theo')}
          </div>
        )}

        {unmarked > 0 && (
          <div
            data-testid="unmarked-chip"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium tabular-nums bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/60"
          >
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            Chưa điểm danh: {unmarked}
          </div>
        )}

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-primary-text" aria-hidden="true" />
            <h3 className="text-white/70 text-sm font-semibold leading-relaxed">Buổi tập hôm nay</h3>
            <span className="text-white/60 text-xs tabular-nums">{sessions.length} buổi</span>
          </div>

          {sessions.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-white/60 gap-1.5">
              <Calendar className="w-6 h-6" aria-hidden="true" />
              <p className="text-sm">Hôm nay không có buổi tập nào.</p>
            </div>
          ) : (
            <ul className="space-y-1.5">
              {sessions.map((s) => {
                const finished = s.status === 'completed' || s.status === 'no_show';
                const started = hasSessionStarted(s.time, now);
                return (
                  <li
                    key={s.id || `${s.time}-${s.customer_id}`}
                    data-testid="today-session-row"
                    className={cn(
                      'bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2',
                      finished && 'bg-white/[0.015]',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={!onOpenMember}
                        onClick={() => openMember(s.customer_id)}
                        aria-label={`Mở hồ sơ ${s.customer_id}`}
                        className={cn(bodyBtnClass, 'tap-target flex items-center gap-3 px-1', !onOpenMember && 'cursor-default')}
                      >
                        <span className={cn('font-bold tabular-nums text-sm shrink-0', finished ? 'text-white/60' : 'text-white')}>
                          {fmtTime(s.time)}
                        </span>
                        <span className="min-w-0">
                          <span className={cn('block font-bold text-sm truncate', finished ? 'text-white/60' : 'text-white')}>
                            {s.customer_id}
                          </span>
                          <span className="block text-white/60 text-xs truncate">{s.customer_goal || 'Chưa đặt mục tiêu'}</span>
                        </span>
                      </button>
                      {isBookingStatusKey(s.status) && <StatusBadge status={s.status} className="shrink-0" />}
                    </div>
                    {started && isBookingStatusKey(s.status) && (
                      <BookingStatusActions
                        layout="inline"
                        className="mt-2"
                        booking={{ id: s.id, customer_id: s.customer_id, time: s.time, status: s.status }}
                        now={now}
                        onChange={(n, p) => handleChange(s, n, p)}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-[#f59e0b]" aria-hidden="true" />
            <h3 className="text-white/70 text-sm font-semibold leading-relaxed">Chờ duyệt</h3>
            {pending.length > 0 && (
              <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-1.5 py-0.5 rounded-full tabular-nums">
                {pending.length}
              </span>
            )}
          </div>

          {pending.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-white/60 gap-1.5">
              <Check className="w-6 h-6" aria-hidden="true" />
              <p className="text-sm">Không có lịch chờ duyệt.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {groups.map((g) => (
                <div key={g.date} data-testid="pending-day-group">
                  <h4 className="text-white/60 text-xs font-semibold mb-1.5 tabular-nums" data-testid="pending-day-header">
                    {g.label}
                  </h4>
                  <ul className="space-y-1.5">
                    {g.items.map((p) => (
                      <li
                        key={p.id}
                        data-testid="pending-row"
                        className="bg-[#f59e0b]/[0.04] border border-[#f59e0b]/20 rounded-xl px-3 py-2"
                      >
                        <button
                          type="button"
                          disabled={!onOpenMember}
                          onClick={() => openMember(p.customer_id)}
                          aria-label={`Mở hồ sơ ${p.customer_id}`}
                          className={cn(bodyBtnClass, 'tap-target w-full flex items-center gap-2 px-1', !onOpenMember && 'cursor-default')}
                        >
                          <span className="text-white font-bold text-sm truncate">{p.customer_id}</span>
                          <span className="text-white/60 text-xs flex items-center gap-1 tabular-nums shrink-0">
                            <Clock className="w-3 h-3" aria-hidden="true" />
                            {g.label} · {fmtTime(p.time)}
                          </span>
                          {p.note && <span className="text-white/60 text-xs truncate">· {p.note}</span>}
                        </button>
                        <BookingStatusActions
                          layout="inline"
                          className="mt-1"
                          booking={{ id: p.id, customer_id: p.customer_id, time: p.time, status: 'pending' }}
                          now={now}
                          onChange={(n, prev) => handleChange(p, n, prev)}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      {toastNode}
      {kioskOpen && <CalendarKiosk onClose={() => setKioskOpen(false)} />}
    </div>
  );
}

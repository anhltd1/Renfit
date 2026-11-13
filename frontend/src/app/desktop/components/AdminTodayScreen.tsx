/**
 * AdminTodayScreen — the "Hôm nay" hub (U11 → U23, DESIGN.md v2).
 * The PT's question is "what's now, and what's next?":
 *   1. a finding line under the title (pending requests, unmarked attendance),
 *   2. Đang tập / Tiếp theo,
 *   3. the day timeline 08–20 with each hour's capacity marks and members,
 *   4. today's sessions with inline attendance once started,
 *   5. pending requests grouped by day, with approve/reject on the row.
 * Used by BOTH the desktop and mobile trees.
 */
import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, RotateCcw } from 'lucide-react';
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
import { DayTimeline } from '../../shared/booking/DayTimeline';
import { gymNow } from '../../shared/member/memberHomeModel';
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
      <div className="ops-surface flex-1 p-4 lg:p-6" aria-busy="true">
        <div className="grid gap-4 lg:grid-cols-12">
          <div className="h-28 bg-surface-2 rounded-panel animate-pulse lg:col-span-12" />
          <div className="h-80 bg-surface-2 rounded-panel animate-pulse lg:col-span-7" />
          <div className="h-80 bg-surface-2 rounded-panel animate-pulse lg:col-span-5" />
        </div>
        {toastNode}
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="ops-surface flex-1 flex flex-col items-center justify-center gap-3 p-4">
        <p className="text-error-text text-sm border border-error-text/30 bg-[#f87171]/[0.06] rounded-control px-4 py-3 leading-relaxed">{error}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="tap-target px-5 rounded-control bg-surface-2 hover:bg-surface-3 border border-line-strong text-white text-sm active:scale-[0.97] transition-colors"
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
  const nowHour = gymNow().getHours();
  const held = sessions.filter((s) => s.status !== 'rejected').length;

  // The one finding, stated first (DESIGN.md v2 "Layout around time").
  const findings: { text: string; tone: 'warn' | 'plain' }[] = [];
  if (pending.length > 0) findings.push({ text: `${pending.length} yêu cầu chờ duyệt`, tone: 'warn' });
  if (unmarked > 0) findings.push({ text: `${unmarked} buổi chưa điểm danh`, tone: 'warn' });
  if (findings.length === 0) findings.push({ text: held === 0 ? 'Hôm nay chưa có buổi tập nào' : 'Không có việc cần xử lý', tone: 'plain' });

  const heroCard = (s: TodaySession, label: string) => {
    const inner = (
      <>
        <span className="text-[13px] font-medium text-white/64 leading-relaxed">{label}</span>
        <p className="mt-1 flex items-baseline gap-3 min-w-0">
          <span className="text-white text-[28px] font-semibold tabular-nums leading-none">{fmtTime(s.time)}</span>
          <span className="text-white text-lg font-semibold truncate">{s.customer_id}</span>
        </p>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          {isBookingStatusKey(s.status) && <StatusBadge status={s.status} />}
          <span className={cn('text-sm tabular-nums', label === 'Đang tập' ? 'text-primary-text' : 'text-white/64')} data-testid="hero-countdown">
            {countdownLabel(s.time, now)}
          </span>
        </div>
      </>
    );
    const cls = 'text-left bg-surface border border-line rounded-panel px-5 py-4';
    return onOpenMember ? (
      <button
        key={label}
        type="button"
        data-testid={`hero-${label === 'Đang tập' ? 'current' : 'next'}`}
        onClick={() => openMember(s.customer_id)}
        aria-label={`${label}: ${s.customer_id} lúc ${fmtTime(s.time)}`}
        className={cn(cls, 'tap-target hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text')}
      >
        {inner}
      </button>
    ) : (
      <div key={label} data-testid={`hero-${label === 'Đang tập' ? 'current' : 'next'}`} className={cls}>
        {inner}
      </div>
    );
  };

  const sectionHead = (title: string, meta?: React.ReactNode) => (
    <div className="flex items-baseline gap-2 px-4 pt-4 pb-3">
      <h3 className="text-white text-base font-semibold leading-relaxed">{title}</h3>
      {meta}
    </div>
  );

  return (
    <div className="ops-surface flex-1 min-h-0 h-full flex flex-col">
      <div
        className="app-chrome shrink-0 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 lg:px-6 pb-3 border-b border-line"
        style={{ paddingTop: 'max(0.75rem, var(--safe-top, 0px))' }}
      >
        <div className="flex items-baseline gap-2 min-w-0 flex-1 whitespace-nowrap">
          <h2 className="text-white text-2xl font-semibold leading-tight">Hôm nay</h2>
          <span className="text-white/64 text-sm tabular-nums truncate">{dateLabel}</span>
        </div>
        {/* The one finding — its own full-width row, so it never truncates on a phone. */}
        <p className="order-last basis-full text-sm leading-relaxed" data-testid="today-finding">
          {findings.map((f, i) => (
            <span key={f.text} className={f.tone === 'warn' ? 'text-warning-text' : 'text-white/64'}>
              {i > 0 && <span className="text-white/40"> · </span>}
              {f.text}
            </span>
          ))}
        </p>
        <div className="flex items-center gap-1 shrink-0">
          <FreshnessIndicator lastUpdatedAt={lastUpdatedAt} offline={offline} className="mr-1 hidden sm:inline-flex" />
          <button
            type="button"
            onClick={() => refetch()}
            className="tap-target flex items-center justify-center rounded-control text-white/64 hover:text-white hover:bg-surface-2 transition-colors"
            aria-label="Làm mới"
          >
            <RotateCcw className={cn('w-4 h-4', loading && 'animate-spin')} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setKioskOpen(true)}
            className="tap-target inline-flex items-center gap-1.5 px-3 rounded-control border border-line-strong text-white/80 hover:text-white hover:bg-surface-2 text-sm transition-colors"
            aria-label="Lịch để bàn"
          >
            <CalendarDays className="w-4 h-4" aria-hidden="true" />
            <span className="hidden lg:inline">Lịch để bàn</span>
          </button>
          {headerActions}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain p-4 lg:p-6">
        <div className="grid gap-4 lg:grid-cols-12 items-start">
          {(current || next) && (
            <div className="grid gap-3 sm:grid-cols-2 lg:col-span-12 order-first" data-testid="today-hero">
              {current && heroCard(current, 'Đang tập')}
              {next && heroCard(next, 'Tiếp theo')}
            </div>
          )}

          <div className="lg:col-span-7 order-2 lg:order-1 space-y-4 min-w-0">
            <section className="bg-surface border border-line rounded-panel">
              {sectionHead(
                'Buổi tập hôm nay',
                <span className="text-white/64 text-sm tabular-nums">{sessions.length} buổi</span>,
              )}
              {unmarked > 0 && (
                <p data-testid="unmarked-chip" className="mx-4 mb-3 text-sm text-warning-text tabular-nums">
                  Chưa điểm danh: {unmarked}
                </p>
              )}
              {sessions.length === 0 ? (
                <p className="px-4 pb-5 text-white/64 text-sm">Hôm nay không có buổi tập nào.</p>
              ) : (
                <ul className="divide-y divide-line border-t border-line">
                  {sessions.map((s) => {
                    const finished = s.status === 'completed' || s.status === 'no_show';
                    const started = hasSessionStarted(s.time, now);
                    return (
                      <li key={s.id || `${s.time}-${s.customer_id}`} data-testid="today-session-row" className="px-4 py-2.5">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            disabled={!onOpenMember}
                            onClick={() => openMember(s.customer_id)}
                            aria-label={`Mở hồ sơ ${s.customer_id}`}
                            className={cn(
                              'tap-target flex-1 min-w-0 flex items-center gap-3 text-left rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text',
                              !onOpenMember && 'cursor-default',
                            )}
                          >
                            <span className={cn('w-12 font-semibold tabular-nums text-sm shrink-0', finished ? 'text-white/64' : 'text-white')}>
                              {fmtTime(s.time)}
                            </span>
                            <span className="min-w-0">
                              <span className={cn('block font-semibold text-sm truncate', finished ? 'text-white/64' : 'text-white')}>
                                {s.customer_id}
                              </span>
                              <span className="block text-white/64 text-xs truncate">{s.customer_goal || 'Chưa đặt mục tiêu'}</span>
                            </span>
                          </button>
                          {isBookingStatusKey(s.status) && <StatusBadge status={s.status} className="shrink-0" />}
                        </div>
                        {started && isBookingStatusKey(s.status) && (
                          <BookingStatusActions
                            layout="inline"
                            className="mt-2 pl-15"
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

          </div>

          <div className="lg:col-span-5 order-1 lg:order-2 space-y-4 min-w-0">
              <section className="bg-surface border border-line rounded-panel">
                {sectionHead(
                  'Chờ duyệt',
                  pending.length > 0 ? <span className="text-warning-text text-sm tabular-nums">{pending.length} yêu cầu</span> : undefined,
                )}
                {pending.length === 0 ? (
                  <p className="px-4 pb-5 text-white/64 text-sm">Không có lịch chờ duyệt.</p>
                ) : (
                  <div className="border-t border-line">
                    {groups.map((g) => (
                      <div key={g.date} data-testid="pending-day-group">
                        <h4 className="px-4 pt-3 pb-1 text-white/64 text-xs font-medium tabular-nums" data-testid="pending-day-header">
                          {g.label}
                        </h4>
                        <ul className="divide-y divide-line">
                          {g.items.map((p) => (
                            <li key={p.id} data-testid="pending-row" className="px-4 py-2.5 flex flex-wrap items-center gap-x-3 gap-y-2">
                              <button
                                type="button"
                                disabled={!onOpenMember}
                                onClick={() => openMember(p.customer_id)}
                                aria-label={`Mở hồ sơ ${p.customer_id}`}
                                className={cn(
                                  'tap-target flex-1 min-w-[12rem] flex items-center gap-3 text-left rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text',
                                  !onOpenMember && 'cursor-default',
                                )}
                              >
                                <span className="w-12 text-white font-semibold text-sm tabular-nums shrink-0">{fmtTime(p.time)}</span>
                                <span className="min-w-0">
                                  <span className="block text-white font-semibold text-sm truncate">{p.customer_id}</span>
                                  {p.note && <span className="block text-white/64 text-xs truncate">{p.note}</span>}
                                </span>
                              </button>
                              <BookingStatusActions
                                layout="inline"
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
              <section className="bg-surface border border-line rounded-panel">
              {sectionHead(
                'Lịch trong ngày',
                <span className="text-white/64 text-sm tabular-nums">{held} chỗ đã đặt</span>,
              )}
              <DayTimeline
                className="border-t border-line"
                sessions={sessions}
                nowHour={data?.date && data.date === `${gymNow().getFullYear()}-${String(gymNow().getMonth() + 1).padStart(2, '0')}-${String(gymNow().getDate()).padStart(2, '0')}` ? nowHour : undefined}
                onOpenMember={onOpenMember ? openMember : undefined}
              />
            </section>
            </div>
        </div>
      </div>
      {toastNode}
      {kioskOpen && <CalendarKiosk onClose={() => setKioskOpen(false)} />}
    </div>
  );
}

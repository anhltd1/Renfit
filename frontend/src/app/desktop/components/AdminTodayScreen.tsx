/**
 * AdminTodayScreen — PT's landing view (U11).
 * Shows today's approved sessions chronologically + all pending bookings with
 * inline approve/reject. Uses admin-density styling.
 */
import { useState } from 'react';
import { Calendar, Check, Clock, Loader2, RotateCcw, Users, X } from 'lucide-react';
import { useAdminToday } from '../../shared/hooks/useAdminToday';
import { updateBookingStatus } from '../../../lib/api/admin';
import { haptic } from '../../shared/primitives/haptics';

const VIET_DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function fmtTime(time: string): string {
  // "2026-08-02T14:00" → "14:00"
  return time.slice(11, 16) || time;
}

function fmtDate(iso: string): string {
  const [, m, d] = iso.split('-');
  const dt = new Date(iso);
  return `${VIET_DAYS[dt.getDay()]} · ${d}/${m}`;
}

/** Matches `--motion-fast` in theme.css — the row-leave animation length. */
const LEAVE_MS = 150;

export function AdminTodayScreen() {
  const { data, loading, error, refetch, setPaused } = useAdminToday();
  const [acting, setActing] = useState<string | null>(null);
  // Row that has been resolved and is animating out before the list refetches.
  const [leaving, setLeaving] = useState<string | null>(null);

  const handleStatus = async (bookingId: string, status: 'approved' | 'rejected') => {
    setActing(bookingId);
    setPaused(true);
    haptic();
    try {
      await updateBookingStatus(bookingId, status);
      // Let the handled row shrink away first, so the list change is legible
      // instead of a silent re-render.
      setLeaving(bookingId);
      await new Promise((resolve) => setTimeout(resolve, LEAVE_MS));
      await refetch(true);
    } catch {
      // silent — will be visible on next refetch
    } finally {
      setLeaving(null);
      setActing(null);
      setPaused(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="space-y-3 w-full max-w-lg px-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-white/[0.04] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">{error}</p>
      </div>
    );
  }

  const sessions = data?.sessions ?? [];
  const pending = data?.pending ?? [];
  const dateLabel = data?.date ? fmtDate(data.date) : '';

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-base">Hôm nay</h2>
          <p className="text-white/40 text-xs mt-0.5">{dateLabel}</p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all"
          aria-label="Làm mới"
        >
          <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Today's sessions */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-[#0F6B3E]" />
          <h3 className="text-white/70 text-xs font-semibold uppercase tracking-wider">
            Buổi tập hôm nay
          </h3>
          <span className="text-white/30 text-xs">{sessions.length} buổi</span>
        </div>

        {sessions.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-white/20 gap-1.5">
            <Calendar className="w-6 h-6" />
            <p className="text-sm">Hôm nay không có buổi tập nào.</p>
            <p className="text-xs text-white/15">Duyệt lịch chờ bên dưới hoặc đặt lịch mới trong tab Lịch đặt.</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {sessions.map((s, i) => (
              <div
                key={`${s.time}-${s.customer_id}`}
                className="flex items-center gap-3 bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3 animate-fade-up"
                style={{ '--stagger': i } as React.CSSProperties}
              >
                <div className="w-9 h-9 rounded-lg bg-[#0F6B3E]/15 border border-[#0F6B3E]/25 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-[#0F6B3E]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{s.customer_id}</p>
                  <p className="text-white/40 text-xs mt-0.5">{s.customer_goal || 'Chưa đặt mục tiêu'}</p>
                </div>
                <span className="text-white/60 text-sm font-mono tabular-nums shrink-0">
                  {fmtTime(s.time)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pending bookings */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-amber-400" />
          <h3 className="text-white/70 text-xs font-semibold uppercase tracking-wider">
            Chờ duyệt
          </h3>
          {pending.length > 0 && (
            <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {pending.length}
            </span>
          )}
        </div>

        {pending.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-white/20 gap-1.5">
            <Check className="w-6 h-6" />
            <p className="text-sm">Không có lịch chờ duyệt.</p>
            <p className="text-xs text-white/15">Tất cả đã được xử lý.</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {pending.map((p, i) => (
              <div
                key={p.id}
                className={`flex items-center gap-3 bg-amber-500/[0.04] border border-amber-400/15 rounded-xl px-4 py-3 ${
                  leaving === p.id ? 'animate-row-leave' : 'animate-fade-up'
                }`}
                style={{ '--stagger': i } as React.CSSProperties}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{p.customer_id}</p>
                  <p className="text-white/40 text-xs mt-0.5 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {fmtTime(p.time)}
                    {p.note && <span className="text-white/25">· {p.note}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    disabled={acting === p.id}
                    onClick={() => handleStatus(p.id, 'approved')}
                    className="p-2 rounded-lg border border-[#0F6B3E]/40 bg-[#0F6B3E]/10 text-[#0F6B3E] hover:bg-[#0F6B3E]/25 active:scale-[0.94] disabled:opacity-40 disabled:active:scale-100 transition-all duration-[var(--motion-fast)]"
                    title="Chấp nhận"
                    aria-label={`Chấp nhận lịch đặt của ${p.customer_id}`}
                  >
                    {acting === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    disabled={acting === p.id}
                    onClick={() => handleStatus(p.id, 'rejected')}
                    className="p-2 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 active:scale-[0.94] disabled:opacity-40 disabled:active:scale-100 transition-all duration-[var(--motion-fast)]"
                    title="Từ chối"
                    aria-label={`Từ chối lịch đặt của ${p.customer_id}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

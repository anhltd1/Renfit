/**
 * MemberHomeDashboard — data-driven landing for the member's dashboard (U16).
 * Replaces the static link cards with: next session hero, progress strip,
 * InBody snapshot, contextual AI Coach entry.
 */
import { useEffect, useState } from 'react';
import { Bot, Calendar, TrendingDown, TrendingUp, Weight } from 'lucide-react';
import type { AuthUser } from '../../../lib/auth';
import { fetchMyInbody } from '../../../lib/api/profile';
import { type Availability, fetchAvailability } from '../../../lib/api/bookings';
import { useCountUp } from '../../shared/hooks/useCountUp';

interface MemberHomeDashboardProps {
  user: AuthUser;
  onNavigateTab: (tab: string) => void;
}

interface NextSession {
  time: string;
  hour: number;
  dateLabel: string;
}

function pad(n: number) { return String(n).padStart(2, '0'); }

function getNextSession(data: Availability | null): NextSession | null {
  if (!data) return null;
  for (const day of data.days) {
    for (const slot of day.slots) {
      if (slot.my_status === 'approved' || slot.my_status === 'pending') {
        const [, m, d] = day.date.split('-');
        const dow = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][new Date(day.date).getDay()];
        return {
          time: slot.time,
          hour: slot.hour,
          dateLabel: `${dow} · ${d}/${m} · ${pad(slot.hour)}:00`,
        };
      }
    }
  }
  return null;
}

export function MemberHomeDashboard({ user, onNavigateTab }: MemberHomeDashboardProps) {
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [inbody, setInbody] = useState<{ weight: number; bfm: number; firstWeight: number; firstBfm: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [avail, records] = await Promise.all([
          fetchAvailability(user.id),
          fetchMyInbody(user.id),
        ]);
        setAvailability(avail);
        if (records && records.length > 0) {
          const first = records[0];
          const latest = records[records.length - 1];
          setInbody({
            weight: latest.weight,
            bfm: latest.BFM,
            firstWeight: first.weight,
            firstBfm: first.BFM,
          });
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user.id]);

  const nextSession = getNextSession(availability);
  const weightDelta = inbody ? inbody.weight - inbody.firstWeight : null;
  const bfmDelta = inbody ? inbody.bfm - inbody.firstBfm : null;
  // Numbers roll into place once the data lands instead of popping in.
  const weightShown = useCountUp(inbody?.weight ?? 0, 400);
  const bfmShown = useCountUp(inbody?.bfm ?? 0, 400);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 bg-white/[0.03] rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-5 space-y-4 max-w-2xl">
      {/* Next session hero */}
      {nextSession ? (
        <div className="bg-[#0F6B3E]/10 border border-[#0F6B3E]/25 rounded-xl p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#0F6B3E]/20 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 text-[#0F6B3E]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/50 text-xs">Buổi tập tiếp theo</p>
            <p className="text-white font-semibold text-sm mt-0.5">{nextSession.dateLabel}</p>
          </div>
          <button type="button" onClick={() => onNavigateTab('bookings')}
            className="px-3 py-1.5 rounded-lg text-xs text-[#0F6B3E] bg-[#0F6B3E]/15 border border-[#0F6B3E]/30 hover:bg-[#0F6B3E]/25 active:scale-[0.97] transition-all duration-[var(--motion-fast)] shrink-0">
            Xem lịch
          </button>
        </div>
      ) : (
        <div className="bg-white/[0.03] border border-white/8 rounded-xl p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 text-white/30" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/50 text-xs">Chưa có lịch tập</p>
            <p className="text-white/30 text-xs mt-0.5">Đặt lịch để bắt đầu tập luyện</p>
          </div>
          <button type="button" onClick={() => onNavigateTab('bookings')}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#0F6B3E] hover:bg-[#0F6B3E]/80 active:scale-[0.97] transition-all duration-[var(--motion-fast)] shrink-0">
            Đặt lịch tập
          </button>
        </div>
      )}

      {/* Progress strip */}
      {inbody && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/[0.03] border border-white/8 rounded-xl p-3 flex items-center gap-3">
            <Weight className="w-4 h-4 text-white/30 shrink-0" />
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider">Cân nặng</p>
              <p className="text-white font-semibold text-sm tabular-nums">{weightShown.toFixed(1)} kg</p>
              {weightDelta !== null && Math.abs(weightDelta) >= 0.1 && (
                <p className={`text-[10px] flex items-center gap-0.5 mt-0.5 ${weightDelta < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {weightDelta < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                  {weightDelta > 0 ? '+' : ''}{weightDelta.toFixed(1)} kg
                </p>
              )}
            </div>
          </div>
          <div className="bg-white/[0.03] border border-white/8 rounded-xl p-3 flex items-center gap-3">
            <Weight className="w-4 h-4 text-white/30 shrink-0" />
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider">Mỡ cơ thể</p>
              <p className="text-white font-semibold text-sm tabular-nums">{bfmShown.toFixed(1)} kg</p>
              {bfmDelta !== null && Math.abs(bfmDelta) >= 0.1 && (
                <p className={`text-[10px] flex items-center gap-0.5 mt-0.5 ${bfmDelta < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {bfmDelta < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                  {bfmDelta > 0 ? '+' : ''}{bfmDelta.toFixed(1)} kg
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Coach contextual entry */}
      <button type="button" onClick={() => onNavigateTab('chat')}
        className="w-full bg-white/[0.03] border border-white/8 rounded-xl p-4 flex items-center gap-3 hover:bg-white/[0.06] hover:border-[#0F6B3E]/20 active:scale-[0.99] transition-all duration-[var(--motion-fast)] text-left">
        <div className="w-10 h-10 rounded-full bg-[#0F6B3E]/15 border border-[#0F6B3E]/25 flex items-center justify-center shrink-0">
          <Bot className="w-5 h-5 text-[#0F6B3E]" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm">Hỏi AI Coach về kế hoạch tuần này</p>
          <p className="text-white/40 text-xs mt-0.5">Tư vấn tập luyện, kiểm tra tiến độ, đặt lịch</p>
        </div>
      </button>
    </div>
  );
}

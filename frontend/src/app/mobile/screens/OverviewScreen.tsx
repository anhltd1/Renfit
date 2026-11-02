/**
 * Root of the Overview tab (U16 — data-driven member home).
 * Shows next session hero, progress strip, InBody snapshot, and contextual
 * AI Coach entry — replaces the static link cards from U4.
 */
import { useEffect, useState } from 'react';
import { Bot, Calendar, TrendingDown, TrendingUp, Weight } from 'lucide-react';
import { NotificationBell } from '../../components/NotificationBell';
import { StackHeader } from '../shell/StackHeader';
import type { MobileTabKey } from '../shell/BottomTabBar';
import type { AuthUser } from '../../../lib/auth';
import { fetchMyInbody } from '../../../lib/api/profile';
import { fetchAvailability, type Availability } from '../../../lib/api/bookings';

export interface OverviewScreenProps {
  user: AuthUser;
  onNavigateTab: (tab: MobileTabKey) => void;
}

function pad(n: number) { return String(n).padStart(2, '0'); }

function getNextSession(data: Availability | null): { dateLabel: string } | null {
  if (!data) return null;
  for (const day of data.days) {
    for (const slot of day.slots) {
      if (slot.my_status === 'approved' || slot.my_status === 'pending') {
        const [, m, d] = day.date.split('-');
        const dow = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][new Date(day.date).getDay()];
        return { dateLabel: `${dow} · ${d}/${m} · ${pad(slot.hour)}:00` };
      }
    }
  }
  return null;
}

export function OverviewScreen({ user, onNavigateTab }: OverviewScreenProps) {
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [inbody, setInbody] = useState<{ weight: number; bfm: number; firstWeight: number; firstBfm: number } | null>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => { load(); }, [user.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const nextSession = getNextSession(availability);
  const weightDelta = inbody ? inbody.weight - inbody.firstWeight : null;
  const bfmDelta = inbody ? inbody.bfm - inbody.firstBfm : null;

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <StackHeader
        title={`Xin chào, ${user.id.split(' ').slice(-1)[0]}`}
        right={
          <div data-tour="mobile-header-notifications">
            <NotificationBell customerId={user.id} onNavigate={(tab) => onNavigateTab(tab as MobileTabKey)} />
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto overscroll-y-contain p-3 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-white/[0.03] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Next session hero */}
            {nextSession ? (
              <div className="bg-[#0F6B3E]/10 border border-[#0F6B3E]/25 rounded-xl p-4 flex items-center gap-3"
                onClick={() => onNavigateTab('booking')} role="button" tabIndex={0}>
                <div className="w-10 h-10 rounded-xl bg-[#0F6B3E]/20 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-[#0F6B3E]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/50 text-xs">Buổi tập tiếp theo</p>
                  <p className="text-white font-semibold text-sm mt-0.5">{nextSession.dateLabel}</p>
                </div>
              </div>
            ) : (
              <div className="bg-white/[0.03] border border-white/8 rounded-xl p-4 flex items-center gap-3"
                onClick={() => onNavigateTab('booking')} role="button" tabIndex={0}>
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-white/30" />
                </div>
                <div className="flex-1">
                  <p className="text-white/50 text-xs">Chưa có lịch tập</p>
                  <p className="text-white font-semibold text-sm mt-0.5">Đặt lịch tập</p>
                </div>
              </div>
            )}

            {/* Progress strip */}
            {inbody && (
              <div className="grid grid-cols-2 gap-2" onClick={() => onNavigateTab('profile')} role="button" tabIndex={0}>
                <div className="bg-white/[0.03] border border-white/8 rounded-xl p-3">
                  <p className="text-white/40 text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <Weight className="w-3 h-3" /> Cân nặng
                  </p>
                  <p className="text-white font-semibold text-sm mt-1">{inbody.weight.toFixed(1)} kg</p>
                  {weightDelta !== null && Math.abs(weightDelta) >= 0.1 && (
                    <p className={`text-[10px] flex items-center gap-0.5 mt-0.5 ${weightDelta < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {weightDelta < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                      {weightDelta > 0 ? '+' : ''}{weightDelta.toFixed(1)} kg
                    </p>
                  )}
                </div>
                <div className="bg-white/[0.03] border border-white/8 rounded-xl p-3">
                  <p className="text-white/40 text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <Weight className="w-3 h-3" /> Mỡ cơ thể
                  </p>
                  <p className="text-white font-semibold text-sm mt-1">{inbody.bfm.toFixed(1)} kg</p>
                  {bfmDelta !== null && Math.abs(bfmDelta) >= 0.1 && (
                    <p className={`text-[10px] flex items-center gap-0.5 mt-0.5 ${bfmDelta < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {bfmDelta < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                      {bfmDelta > 0 ? '+' : ''}{bfmDelta.toFixed(1)} kg
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* AI Coach contextual entry */}
            <div className="bg-white/[0.03] border border-white/8 rounded-xl p-4 flex items-center gap-3"
              onClick={() => onNavigateTab('coach')} role="button" tabIndex={0}>
              <div className="w-10 h-10 rounded-full bg-[#0F6B3E]/15 border border-[#0F6B3E]/25 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-[#0F6B3E]" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Hỏi AI Coach về kế hoạch tuần này</p>
                <p className="text-white/40 text-xs mt-0.5">Tư vấn tập luyện, kiểm tra tiến độ</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * MemberHomeDashboard — desktop member home (DESIGN.md v2).
 *
 * The screen's one question is "Khi nào tôi tập buổi tới?", answered by the
 * largest block (next session time at 48px). Beside it, the next open hours
 * with their capacity marks; below, body composition with deltas that name
 * their baseline, and the weight line behind them.
 */
import { useMemo } from 'react';
import { ArrowRight, RotateCw } from 'lucide-react';
import type { AuthUser } from '../../../lib/auth';
import { getNextSession, getOpenSlots, gymNow, summarizeInbody } from '../../shared/member/memberHomeModel';
import { useMemberHome } from '../../shared/member/useMemberHome';
import { InbodyFigures, NextSessionPanel, OpenSlotsList, PanelHeader, WeightTrend } from '../../shared/member/MemberHomeBlocks';
import { Skeleton } from '../../shared/primitives/Skeleton';

interface MemberHomeDashboardProps {
  user: AuthUser;
  onNavigateTab: (tab: string) => void;
}

export function MemberHomeDashboard({ user, onNavigateTab }: MemberHomeDashboardProps) {
  const { availability, records, loading, error, reload } = useMemberHome(user.id);
  const now = useMemo(() => gymNow(), [availability]); // eslint-disable-line react-hooks/exhaustive-deps
  const next = getNextSession(availability, now);
  const open = getOpenSlots(availability, now, 5);
  const inbody = summarizeInbody(records);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-4" aria-busy="true">
        <Skeleton className="h-64 lg:col-span-7 rounded-panel" />
        <Skeleton className="h-64 lg:col-span-5 rounded-panel" />
        <Skeleton className="h-56 lg:col-span-12 rounded-panel" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl space-y-4">
      {error && (
        <div role="status" className="flex items-center justify-between gap-3 rounded-control border border-error-text/30 bg-[#f87171]/[0.06] px-4 py-2.5">
          <p className="text-error-text text-sm">Không tải được dữ liệu mới nhất.</p>
          <button type="button" onClick={reload} className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white">
            <RotateCw className="w-3.5 h-3.5" aria-hidden="true" /> Thử lại
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <NextSessionPanel
          next={next}
          now={now}
          onOpenBookings={() => onNavigateTab('bookings')}
          className="lg:col-span-7 min-h-[260px]"
        />
        <OpenSlotsList
          slots={open}
          onPick={() => onNavigateTab('bookings')}
          onViewAll={() => onNavigateTab('bookings')}
          className="lg:col-span-5"
        />
      </div>

      <section className="bg-surface border border-line rounded-panel p-5 sm:p-6" data-testid="body-composition">
        <PanelHeader
          title="Thể trạng"
          meta={
            inbody
              ? inbody.baseline
                ? `đo lần cuối ${inbody.latestDate} · thay đổi so với lần đo đầu ${inbody.baseline}`
                : `đo ngày ${inbody.latestDate}`
              : undefined
          }
          action={
            <button type="button" onClick={() => onNavigateTab('overview')} className="text-sm text-white/64 hover:text-white transition-colors shrink-0">
              Chi tiết InBody
            </button>
          }
        />
        {inbody ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            <div className="lg:col-span-5">
              <InbodyFigures summary={inbody} />
            </div>
            <div className="lg:col-span-7">
              <WeightTrend points={inbody.weights} />
            </div>
          </div>
        ) : (
          <p className="text-white/64 text-sm leading-relaxed">
            Chưa có kết quả InBody. PT sẽ đo và cập nhật trong buổi tập — kết quả sẽ hiện ở đây.
          </p>
        )}
      </section>

      <button
        type="button"
        onClick={() => onNavigateTab('chat')}
        className="w-full flex items-center justify-between gap-4 rounded-panel border border-line px-5 py-4 text-left hover:bg-surface transition-colors"
      >
        <span className="min-w-0">
          <span className="block text-white text-sm font-semibold">Hỏi AI Coach về kế hoạch tuần này</span>
          <span className="block text-white/64 text-sm mt-0.5">
            {inbody ? 'Coach đọc được hồ sơ và kết quả InBody của bạn để gợi ý bài tập.' : 'Tư vấn bài tập, dinh dưỡng, hoặc đặt lịch giúp bạn.'}
          </span>
        </span>
        <ArrowRight className="w-4 h-4 text-white/64 shrink-0" aria-hidden="true" />
      </button>
    </div>
  );
}

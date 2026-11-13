/**
 * Root of the mobile Overview tab — member home (DESIGN.md v2).
 * Same question and blocks as the desktop home ("Khi nào tôi tập buổi
 * tới?"), stacked for one thumb: next session, open hours with capacity
 * marks, body composition as a label/value list, the AI Coach entry.
 */
import { useMemo } from 'react';
import { ChevronRight, RotateCw } from 'lucide-react';
import { NotificationBell } from '../../components/NotificationBell';
import { StackHeader } from '../shell/StackHeader';
import type { MobileTabKey } from '../shell/BottomTabBar';
import type { AuthUser } from '../../../lib/auth';
import { getNextSession, getOpenSlots, gymNow, summarizeInbody } from '../../shared/member/memberHomeModel';
import { useMemberHome } from '../../shared/member/useMemberHome';
import { InbodyFigures, NextSessionPanel, OpenSlotsList, PanelHeader } from '../../shared/member/MemberHomeBlocks';
import { Skeleton } from '../../shared/primitives/Skeleton';

export interface OverviewScreenProps {
  user: AuthUser;
  onNavigateTab: (tab: MobileTabKey) => void;
}

export function OverviewScreen({ user, onNavigateTab }: OverviewScreenProps) {
  const { availability, records, loading, error, reload } = useMemberHome(user.id);
  const now = useMemo(() => gymNow(), [availability]); // eslint-disable-line react-hooks/exhaustive-deps
  const next = getNextSession(availability, now);
  const open = getOpenSlots(availability, now, 4);
  const inbody = summarizeInbody(records);

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <StackHeader
        title="Tổng quan"
        right={
          <div data-tour="mobile-header-notifications">
            <NotificationBell customerId={user.id} onNavigate={(tab) => onNavigateTab(tab as MobileTabKey)} />
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 space-y-3">
        {loading ? (
          <div className="space-y-3" aria-busy="true">
            <Skeleton className="h-52 rounded-panel" />
            <Skeleton className="h-44 rounded-panel" />
            <Skeleton className="h-36 rounded-panel" />
          </div>
        ) : (
          <>
            {error && (
              <div role="status" className="flex items-center justify-between gap-3 rounded-control border border-error-text/30 bg-[#f87171]/[0.06] px-3 py-2.5">
                <p className="text-error-text text-sm">Không tải được dữ liệu mới nhất.</p>
                <button type="button" onClick={reload} className="tap-target inline-flex items-center gap-1.5 text-sm text-white/80">
                  <RotateCw className="w-3.5 h-3.5" aria-hidden="true" /> Thử lại
                </button>
              </div>
            )}

            <NextSessionPanel next={next} now={now} onOpenBookings={() => onNavigateTab('booking')} />
            <OpenSlotsList slots={open} onPick={() => onNavigateTab('booking')} onViewAll={() => onNavigateTab('booking')} />

            <section className="bg-surface border border-line rounded-panel p-5" data-testid="body-composition">
              <PanelHeader
                title="Thể trạng"
                meta={inbody ? (inbody.baseline ? `so với ${inbody.baseline}` : inbody.latestDate) : undefined}
                action={
                  <button type="button" onClick={() => onNavigateTab('profile')} className="tap-target text-sm text-white/64 shrink-0">
                    Chi tiết
                  </button>
                }
              />
              {inbody ? (
                <InbodyFigures summary={inbody} layout="list" />
              ) : (
                <p className="text-white/64 text-sm leading-relaxed">Chưa có kết quả InBody. PT sẽ cập nhật sau buổi đo.</p>
              )}
            </section>

            <button
              type="button"
              onClick={() => onNavigateTab('coach')}
              className="w-full flex items-center justify-between gap-3 rounded-panel border border-line px-4 py-3.5 text-left active:bg-surface transition-colors"
            >
              <span className="min-w-0">
                <span className="block text-white text-sm font-semibold">Hỏi AI Coach về kế hoạch tuần này</span>
                <span className="block text-white/64 text-sm mt-0.5">Bài tập, dinh dưỡng, đặt lịch</span>
              </span>
              <ChevronRight className="w-4 h-4 text-white/64 shrink-0" aria-hidden="true" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

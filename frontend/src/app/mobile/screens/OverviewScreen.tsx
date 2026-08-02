/**
 * Root of the Overview tab (U4 Trainee Mobile, TS-1).
 * New content — the old combined desktop page had no separate "overview
 * root" concept; this is the natural landing screen for a stacked mobile
 * nav: greets the trainee and surfaces quick entry points into the other
 * tabs, notification bell in the header (reused as-is).
 */
import { Bot, Calendar, User } from 'lucide-react';
import { Card } from '../../shared/primitives/Card';
import { NotificationBell } from '../../components/NotificationBell';
import { StackHeader } from '../shell/StackHeader';
import type { MobileTabKey } from '../shell/BottomTabBar';
import type { AuthUser } from '../../../lib/auth';

export interface OverviewScreenProps {
  user: AuthUser;
  onNavigateTab: (tab: MobileTabKey) => void;
}

export function OverviewScreen({ user, onNavigateTab }: OverviewScreenProps) {
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
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <Card
          hoverable
          compact
          onClick={() => onNavigateTab('coach')}
          className="cursor-pointer flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-[#0F6B3E]/20 border border-[#0F6B3E]/30 flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5 text-[#0F6B3E]" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Trò chuyện với AI Coach</p>
            <p className="text-white/40 text-xs mt-0.5">Tư vấn tập luyện, kiểm tra tiến độ, đặt lịch</p>
          </div>
        </Card>

        <Card
          hoverable
          compact
          onClick={() => onNavigateTab('booking')}
          className="cursor-pointer flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-[#0F6B3E]/20 border border-[#0F6B3E]/30 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 text-[#0F6B3E]" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Đặt lịch tập</p>
            <p className="text-white/40 text-xs mt-0.5">Xem khung giờ còn trống</p>
          </div>
        </Card>

        <Card
          hoverable
          compact
          onClick={() => onNavigateTab('profile')}
          className="cursor-pointer flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-[#0F6B3E]/20 border border-[#0F6B3E]/30 flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-[#0F6B3E]" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Hồ sơ & InBody</p>
            <p className="text-white/40 text-xs mt-0.5">Cập nhật thông tin và theo dõi tiến độ</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

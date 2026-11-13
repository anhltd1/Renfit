/**
 * Root of the Profile tab (U4 Trainee Mobile, TS-7, NAV-1).
 * Splits the desktop's single combined "Hồ sơ & InBody" tab into two
 * native-style stacked screens, entered from here.
 */
import { Activity, ChevronRight, LogOut, User } from 'lucide-react';
import { Card } from '../../shared/primitives/Card';
import { StackHeader } from '../shell/StackHeader';

export interface ProfileTabRootProps {
  onOpenProfile: () => void;
  onOpenProgress: () => void;
  onLogout: () => void;
}

export function ProfileTabRoot({ onOpenProfile, onOpenProgress, onLogout }: ProfileTabRootProps) {
  return (
    <div className="flex flex-col min-h-0 flex-1">
      <StackHeader title="Hồ sơ & InBody" />
      <div className="flex-1 overflow-y-auto overscroll-y-contain p-4 space-y-3">
        <Card
          hoverable
          compact
          onClick={onOpenProfile}
          data-testid="profile-tab-root-profile-entry"
          className="cursor-pointer flex items-center gap-3"
        >
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">Hồ sơ cá nhân</p>
            <p className="text-white/40 text-xs mt-0.5">Mục tiêu, sức khỏe, số đo cơ thể</p>
          </div>
          <ChevronRight className="w-4 h-4 text-white/64" />
        </Card>

        <Card
          hoverable
          compact
          onClick={onOpenProgress}
          data-testid="profile-tab-root-progress-entry"
          className="cursor-pointer flex items-center gap-3"
        >
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">Chỉ số InBody</p>
            <p className="text-white/40 text-xs mt-0.5">Theo dõi tiến độ theo thời gian</p>
          </div>
          <ChevronRight className="w-4 h-4 text-white/64" />
        </Card>

        <button
          type="button"
          data-testid="profile-tab-root-logout"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 text-white/40 hover:text-error-text py-3 text-sm transition-colors rounded-control hover:bg-red-400/5 mt-2"
        >
          <LogOut className="w-4 h-4" /> Đăng xuất
        </button>
      </div>
    </div>
  );
}

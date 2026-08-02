/**
 * Mobile dashboard shell (U4 Trainee Mobile, TS-1/TS-9).
 * Composes the bottom tab bar + a per-tab navigation stack + the active
 * screen, and wires the generalized OnboardingTour with mobile anchors.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { OnboardingTour, type OnboardingStep } from '../../components/OnboardingTour';
import { consumeNewAccountFlag, clearAuthUser } from '../../../lib/auth';
import { useProfile } from '../../shared/hooks/useProfile';
import { BottomTabBar, type MobileTabKey } from './BottomTabBar';
import { useStack } from './useStack';
import { OverviewScreen } from '../screens/OverviewScreen';
import { ProfileTabRoot } from '../screens/ProfileTabRoot';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { BookingScreen } from '../screens/BookingScreen';
import { CoachScreen } from '../screens/CoachScreen';

type ProfileStackScreen = 'root' | 'profile' | 'progress';

const MOBILE_ONBOARDING_STEPS: OnboardingStep<MobileTabKey>[] = [
  {
    title: 'Chào mừng đến với Renfit! 👋',
    description:
      'Cảm ơn bạn đã đăng ký. Hãy dành 1 phút để mình hướng dẫn nhanh các khu vực chính trong ứng dụng nhé.',
  },
  {
    target: 'mobile-tab-overview',
    tab: 'overview',
    title: 'Tổng quan',
    description: 'Đây là màn hình chính — truy cập nhanh vào AI Coach, đặt lịch, và hồ sơ của bạn.',
  },
  {
    target: 'mobile-tab-booking',
    tab: 'booking',
    title: 'Đặt lịch tập',
    description: 'Xem khung giờ còn trống và quản lý lịch tập của bạn tại đây.',
  },
  {
    target: 'mobile-tab-coach',
    tab: 'coach',
    title: 'AI Coach',
    description: 'Trò chuyện với AI Coach để được tư vấn tập luyện, xem tiến độ, hoặc đặt lịch tập.',
  },
  {
    target: 'mobile-tab-profile',
    tab: 'profile',
    title: 'Hồ sơ & InBody',
    description: 'Cập nhật thông tin cá nhân và theo dõi chỉ số InBody theo thời gian tại đây.',
  },
  {
    title: 'Vậy là xong! 🎉',
    description:
      'Bạn đã sẵn sàng bắt đầu hành trình với Renfit. Bạn có thể hỏi AI Coach bất cứ lúc nào nếu cần trợ giúp thêm.',
  },
];

export function MobileShell() {
  const navigate = useNavigate();
  const { user } = useProfile();
  const [activeTab, setActiveTab] = useState<MobileTabKey>('overview');
  const [chatKey, setChatKey] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const profileStack = useStack<ProfileStackScreen>('root');

  useEffect(() => {
    if (consumeNewAccountFlag()) setShowOnboarding(true);
  }, []);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    clearAuthUser();
    navigate('/');
  };

  let content: React.ReactNode;
  switch (activeTab) {
    case 'overview':
      content = <OverviewScreen user={user} onNavigateTab={setActiveTab} />;
      break;
    case 'booking':
      content = <BookingScreen customerId={user.id} />;
      break;
    case 'coach':
      content = <CoachScreen chatKey={chatKey} onNewChat={() => setChatKey((k) => k + 1)} />;
      break;
    case 'profile':
      if (profileStack.current === 'profile') {
        content = <ProfileScreen onBack={profileStack.pop} />;
      } else if (profileStack.current === 'progress') {
        content = <ProgressScreen customerId={user.id} onBack={profileStack.pop} />;
      } else {
        content = (
          <ProfileTabRoot
            onOpenProfile={() => profileStack.push('profile')}
            onOpenProgress={() => profileStack.push('progress')}
            onLogout={handleLogout}
          />
        );
      }
      break;
  }

  return (
    <div className="h-[100dvh] w-full flex flex-col overflow-hidden bg-[#0B0B0B] text-white">
      <div className="flex-1 min-h-0 flex flex-col">{content}</div>
      <BottomTabBar
        active={activeTab}
        onChange={(tab) => {
          setActiveTab(tab);
          if (tab !== 'profile') profileStack.reset('root');
        }}
      />

      {showOnboarding && (
        <OnboardingTour
          steps={MOBILE_ONBOARDING_STEPS}
          onTabChange={(tab) => setActiveTab(tab)}
          onFinish={() => {
            setShowOnboarding(false);
            setActiveTab('overview');
          }}
        />
      )}
    </div>
  );
}

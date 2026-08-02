/**
 * Thin device-split route entry for /dashboard (U3 Trainee Desktop, EN-1).
 * Picks the rebuilt desktop tree or the temporary mobile bridge (until U4
 * replaces the mobile tree with a real native-like rebuild).
 */
import { useDevice } from '../device/useDevice';
import { UserDashboardPage as DesktopUserDashboardPage } from '../desktop/pages/UserDashboardPage';
import { UserDashboardPage as MobileUserDashboardPage } from '../mobile/pages/UserDashboardPage';

export function DashboardRoute() {
  const { isMobile } = useDevice();
  return isMobile ? <MobileUserDashboardPage /> : <DesktopUserDashboardPage />;
}

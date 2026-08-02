/**
 * Thin device-split route entry for /admin/dashboard (U5 Trainer Desktop).
 * Picks the rebuilt desktop tree or the temporary mobile bridge (until U6
 * replaces the mobile tree with a real native-like rebuild).
 */
import { useDevice } from '../device/useDevice';
import { AdminDashboardPage as DesktopAdminDashboardPage } from '../desktop/pages/AdminDashboardPage';
import { AdminDashboardPage as MobileAdminDashboardPage } from '../mobile/pages/AdminDashboardPage';

export function AdminDashboardRoute() {
  const { isMobile } = useDevice();
  return isMobile ? <MobileAdminDashboardPage /> : <DesktopAdminDashboardPage />;
}

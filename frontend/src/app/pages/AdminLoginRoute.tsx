/**
 * Thin device-split route entry for /admin (U5 Trainer Desktop).
 * Picks the rebuilt desktop tree or the temporary mobile bridge (until U6
 * replaces the mobile tree with a real native-like rebuild).
 */
import { useDevice } from '../device/useDevice';
import { AdminLoginPage as DesktopAdminLoginPage } from '../desktop/pages/AdminLoginPage';
import { AdminLoginPage as MobileAdminLoginPage } from '../mobile/pages/AdminLoginPage';

export function AdminLoginRoute() {
  const { isMobile } = useDevice();
  return isMobile ? <MobileAdminLoginPage /> : <DesktopAdminLoginPage />;
}

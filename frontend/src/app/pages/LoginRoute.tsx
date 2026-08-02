/**
 * Thin device-split route entry for /login (U3 Trainee Desktop, EN-1).
 */
import { useDevice } from '../device/useDevice';
import { LoginPage as DesktopLoginPage } from '../desktop/pages/LoginPage';
import { LoginPage as MobileLoginPage } from '../mobile/pages/LoginPage';

export function LoginRoute() {
  const { isMobile } = useDevice();
  return isMobile ? <MobileLoginPage /> : <DesktopLoginPage />;
}

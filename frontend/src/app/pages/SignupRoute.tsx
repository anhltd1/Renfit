/**
 * Thin device-split route entry for /signup (U3 Trainee Desktop, EN-1).
 */
import { useDevice } from '../device/useDevice';
import { SignupPage as DesktopSignupPage } from '../desktop/pages/SignupPage';
import { SignupPage as MobileSignupPage } from '../mobile/pages/SignupPage';

export function SignupRoute() {
  const { isMobile } = useDevice();
  return isMobile ? <MobileSignupPage /> : <DesktopSignupPage />;
}

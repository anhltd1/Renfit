/**
 * Mobile customer dashboard (U4 Trainee Mobile, TS-1/TS-3/TS-5/TS-7/TS-9).
 * REPLACES the U3 temporary bridge (verbatim desktop-in-mobile-clothes copy)
 * with a real native-like mobile experience: bottom tabs, per-tab
 * navigation stacks, and sheet-based confirmations. See MobileShell.tsx for
 * the composition.
 */
import { MobileShell } from '../shell/MobileShell';

export function UserDashboardPage() {
  return <MobileShell />;
}

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { isAuthenticated } from '../../lib/auth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`, {
        replace: true,
      });
    }
  }, [navigate, location.pathname]);

  if (!isAuthenticated()) return null;

  return <>{children}</>;
}

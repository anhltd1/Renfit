import { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router';
import type { Page } from '../App';

interface LinkProps {
  to: Page;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}

export function Link({ to, className, children, onClick }: LinkProps) {
  return (
    <RouterLink to={to} className={className} onClick={onClick}>
      {children}
    </RouterLink>
  );
}

import React from 'react';
import { Navigate } from 'react-router';
import { isAdminAuthenticated } from '../../lib/adminAuth';

interface Props {
  children: React.ReactNode;
}

export function AdminGuard({ children }: Props) {
  if (!isAdminAuthenticated()) {
    return <Navigate to="/admin" replace />;
  }
  return <>{children}</>;
}

import React from 'react';
import { Navigate, Outlet } from 'react-router';
import { useUserStore } from '@/stores/userStore';
import type { Role } from '@/types/roles';

interface AuthGuardProps {
  /** Roles allowed to access the children routes. If empty, any authenticated role is accepted. */
  allowedRoles?: Role[];
  /** Where to redirect unauthenticated users. Defaults to '/' */
  redirectTo?: string;
}

/**
 * Protects routes behind authentication. Wrap route groups in the router config:
 *   { element: <AuthGuard allowedRoles={['lecturer','admin']} />, children: [...] }
 *
 * - Unauthenticated users → redirect to `redirectTo`.
 * - Wrong-role users → redirect to /access-denied with state describing required roles.
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({
  allowedRoles = [],
  redirectTo = '/',
}) => {
  const role = useUserStore(s => s.role);
  const authLoading = useUserStore(s => s.authLoading);

  // While Supabase auth is initialising, show a minimal loading indicator
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated at all
  if (!role) {
    return <Navigate to={redirectTo} replace />;
  }

  // Role-gated: check if the user's role is in the allow-list
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return (
      <Navigate
        to="/access-denied"
        replace
        state={{ requiredRoles: allowedRoles, from: globalThis.location?.pathname }}
      />
    );
  }

  return <Outlet />;
};

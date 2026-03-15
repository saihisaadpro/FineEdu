import React from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router';
import { ShieldAlert, Home, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useUserStore } from '@/stores/userStore';
import { ROLE_LABELS, ROLE_HOME_ROUTES, type Role } from '@/types/roles';

interface LocationState {
  requiredRoles?: Role[];
  from?: string;
}

/**
 * Shown when an authenticated user tries to access a route their role doesn't permit.
 * Displays what happened, the user's current role, and actionable next steps.
 */
export const AccessDeniedPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = useUserStore(s => s.role);
  const state = (location.state ?? {}) as LocationState;

  // No role at all — redirect to home instead of showing a confusing page
  if (!role) {
    return <Navigate to="/" replace />;
  }

  const currentLabel = ROLE_LABELS[role];
  const homeRoute = ROLE_HOME_ROUTES[role];
  const requiredLabels = state.requiredRoles?.map(r => ROLE_LABELS[r]).join(', ');

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-6">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">Access Denied</h1>
      <p className="text-slate-500 mb-2 max-w-md">
        Your current role (<span className="font-semibold text-slate-700">{currentLabel}</span>) does not
        have permission to view this page.
      </p>
      {requiredLabels && (
        <p className="text-sm text-slate-400 mb-6 max-w-md">
          Required role: <span className="font-medium text-slate-600">{requiredLabels}</span>
        </p>
      )}
      {!requiredLabels && (
        <p className="text-sm text-slate-400 mb-6 max-w-md">
          If you believe this is an error, try logging in with the correct account.
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={() => navigate(homeRoute)} size="md">
          <Home className="w-4 h-4 mr-2" />
          Go to My Dashboard
        </Button>
        <Button variant="secondary" onClick={() => navigate('/login?role=facilitator')} size="md">
          <LogIn className="w-4 h-4 mr-2" />
          Sign in as Staff
        </Button>
      </div>
    </div>
  );
};

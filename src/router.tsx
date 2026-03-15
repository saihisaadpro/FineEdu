import React, { Suspense } from 'react';
import { createBrowserRouter } from 'react-router';
import { RootLayout } from '@/layouts/RootLayout';
import { AuthGuard } from '@/components/AuthGuard';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import { LandingPage } from '@/pages/LandingPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { AccessDeniedPage } from '@/pages/AccessDeniedPage';
import { lazyWithRetry } from '@/utils/lazyWithRetry';
import { FACILITATOR_ROLES, MODULE_LEAD_ROLES, ALL_STAFF_ROLES } from '@/types/roles';

// Lazy-loaded routes with automatic retry on chunk-load failure
const LoginPage = lazyWithRetry(() => import('@/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const DashboardPage = lazyWithRetry(() => import('@/pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const ModulePage = lazyWithRetry(() => import('@/pages/ModulePage').then(m => ({ default: m.ModulePage })));
const TopicPage = lazyWithRetry(() => import('@/pages/TopicPage').then(m => ({ default: m.TopicPage })));
const AssessmentPage = lazyWithRetry(() => import('@/pages/AssessmentPage').then(m => ({ default: m.AssessmentPage })));
const PrivacyPage = lazyWithRetry(() => import('@/pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const ResumePage = lazyWithRetry(() => import('@/pages/ResumePage').then(m => ({ default: m.ResumePage })));
const FacilitatorDashboardPage = lazyWithRetry(() => import('@/pages/FacilitatorDashboardPage').then(m => ({ default: m.FacilitatorDashboardPage })));
const ModuleLeadDashboardPage = lazyWithRetry(() => import('@/pages/ModuleLeadDashboardPage').then(m => ({ default: m.ModuleLeadDashboardPage })));
const HealthCheckPage = lazyWithRetry(() => import('@/pages/HealthCheckPage').then(m => ({ default: m.HealthCheckPage })));

function LazyRoute({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>}>
      {children}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      /* ── Public routes ────────────────────── */
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <LazyRoute><LoginPage /></LazyRoute> },
      { path: 'resume', element: <LazyRoute><ResumePage /></LazyRoute> },
      { path: 'privacy', element: <LazyRoute><PrivacyPage /></LazyRoute> },
      { path: 'access-denied', element: <AccessDeniedPage /> },

      /* ── Authenticated routes (any role) ──── */
      {
        element: <AuthGuard />,
        errorElement: <RouteErrorBoundary />,
        children: [
          { path: 'dashboard', element: <LazyRoute><DashboardPage /></LazyRoute> },
          { path: 'module/:moduleId', element: <LazyRoute><ModulePage /></LazyRoute> },
          { path: 'topic/:topicId', element: <LazyRoute><TopicPage /></LazyRoute> },
          { path: 'topic/:topicId/assessment', element: <LazyRoute><AssessmentPage /></LazyRoute> },
        ],
      },

      /* ── Facilitator / admin routes ───────── */
      {
        element: <AuthGuard allowedRoles={[...FACILITATOR_ROLES]} />,
        errorElement: <RouteErrorBoundary />,
        children: [
          { path: 'facilitator', element: <LazyRoute><FacilitatorDashboardPage /></LazyRoute> },
        ],
      },

      /* ── Module lead / admin routes ───────── */
      {
        element: <AuthGuard allowedRoles={[...MODULE_LEAD_ROLES]} />,
        errorElement: <RouteErrorBoundary />,
        children: [
          { path: 'module-lead', element: <LazyRoute><ModuleLeadDashboardPage /></LazyRoute> },
        ],
      },

      /* ── Staff-only admin routes ───────────── */
      {
        element: <AuthGuard allowedRoles={[...ALL_STAFF_ROLES]} />,
        errorElement: <RouteErrorBoundary />,
        children: [
          { path: 'admin/health', element: <LazyRoute><HealthCheckPage /></LazyRoute> },
        ],
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

import React, { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router';
import { RootLayout } from '@/layouts/RootLayout';
import { AuthGuard } from '@/components/AuthGuard';
import { LandingPage } from '@/pages/LandingPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

// Lazy-loaded routes — keeps the initial bundle small
const LoginPage = lazy(() => import('@/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const ModulePage = lazy(() => import('@/pages/ModulePage').then(m => ({ default: m.ModulePage })));
const TopicPage = lazy(() => import('@/pages/TopicPage').then(m => ({ default: m.TopicPage })));
const AssessmentPage = lazy(() => import('@/pages/AssessmentPage').then(m => ({ default: m.AssessmentPage })));
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const ResumePage = lazy(() => import('@/pages/ResumePage').then(m => ({ default: m.ResumePage })));
const FacilitatorDashboardPage = lazy(() => import('@/pages/FacilitatorDashboardPage').then(m => ({ default: m.FacilitatorDashboardPage })));

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
    children: [
      /* ── Public routes ────────────────────── */
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <LazyRoute><LoginPage /></LazyRoute> },
      { path: 'resume', element: <LazyRoute><ResumePage /></LazyRoute> },
      { path: 'privacy', element: <LazyRoute><PrivacyPage /></LazyRoute> },

      /* ── Authenticated routes (any role) ──── */
      {
        element: <AuthGuard />,
        children: [
          { path: 'dashboard', element: <LazyRoute><DashboardPage /></LazyRoute> },
          { path: 'module/:moduleId', element: <LazyRoute><ModulePage /></LazyRoute> },
          { path: 'topic/:topicId', element: <LazyRoute><TopicPage /></LazyRoute> },
          { path: 'topic/:topicId/assessment', element: <LazyRoute><AssessmentPage /></LazyRoute> },
        ],
      },

      /* ── Facilitator / admin routes ───────── */
      {
        element: <AuthGuard allowedRoles={['facilitator', 'lecturer', 'admin']} />,
        children: [
          { path: 'facilitator', element: <LazyRoute><FacilitatorDashboardPage /></LazyRoute> },
        ],
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

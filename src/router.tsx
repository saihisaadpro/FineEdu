import React from 'react';
import { createBrowserRouter } from 'react-router';
import { RootLayout } from '@/layouts/RootLayout';
import { AuthGuard } from '@/components/AuthGuard';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ModulePage } from '@/pages/ModulePage';
import { TopicPage } from '@/pages/TopicPage';
import { AssessmentPage } from '@/pages/AssessmentPage';
import { PrivacyPage } from '@/pages/PrivacyPage';
import { ResumePage } from '@/pages/ResumePage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      /* ── Public routes ────────────────────── */
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'resume', element: <ResumePage /> },
      { path: 'privacy', element: <PrivacyPage /> },

      /* ── Authenticated routes (any role) ──── */
      {
        element: <AuthGuard />,
        children: [
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'module/:moduleId', element: <ModulePage /> },
          { path: 'topic/:topicId', element: <TopicPage /> },
          { path: 'topic/:topicId/assessment', element: <AssessmentPage /> },
        ],
      },

      /* ── Facilitator / admin routes ───────── */
      {
        element: <AuthGuard allowedRoles={['facilitator', 'lecturer', 'admin']} />,
        children: [
          // Future facilitator-only pages go here
        ],
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

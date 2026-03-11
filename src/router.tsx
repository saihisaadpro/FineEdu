import React from 'react';
import { createBrowserRouter } from 'react-router';
import { RootLayout } from '@/layouts/RootLayout';
import { LandingPage } from '@/pages/LandingPage';
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
      { index: true, element: <LandingPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'module/:moduleId', element: <ModulePage /> },
      { path: 'topic/:topicId', element: <TopicPage /> },
      { path: 'topic/:topicId/assessment', element: <AssessmentPage /> },
      { path: 'privacy', element: <PrivacyPage /> },
      { path: 'resume', element: <ResumePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

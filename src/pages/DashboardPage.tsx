import React from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { Module } from '@/types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userRole = (searchParams.get('role') as 'student' | 'lecturer') || 'student';

  const handleSelectModule = (module: Module) => {
    navigate(`/module/${module.id}?role=${userRole}`);
  };

  return <Dashboard userRole={userRole} onSelectModule={handleSelectModule} />;
};

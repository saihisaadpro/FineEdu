import React from 'react';
import { useNavigate } from 'react-router';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { Module } from '@/types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSelectModule = (module: Module) => {
    navigate(`/module/${module.id}`);
  };

  return <Dashboard onSelectModule={handleSelectModule} />;
};

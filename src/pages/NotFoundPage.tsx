import React from 'react';
import { useNavigate } from 'react-router';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Page Not Found</h1>
      <p className="text-slate-500 mb-8 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <Button onClick={() => navigate('/')} size="lg">
        Return Home
      </Button>
    </div>
  );
};

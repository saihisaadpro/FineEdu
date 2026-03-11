import React from 'react';
import { useNavigate } from 'react-router';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const PrivacyPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Privacy Notice</h1>
        </div>

        <div className="prose prose-sm text-slate-600 space-y-4">
          <p>
            WorkReady Finance (Finedu) is a UWE Bristol Knowledge Exchange project. We take your privacy seriously and comply with UK GDPR requirements.
          </p>

          <h2 className="text-lg font-bold text-slate-900">What we collect</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Anonymous session data (no personal identifiers)</li>
            <li>Learning progress and assessment scores</li>
            <li>Optional feedback responses</li>
          </ul>

          <h2 className="text-lg font-bold text-slate-900">How we use it</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To track your progress through the learning modules</li>
            <li>To generate aggregate analytics for facilitators</li>
            <li>To improve the educational content</li>
          </ul>

          <h2 className="text-lg font-bold text-slate-900">Data storage</h2>
          <p>
            All data is stored securely in the EU (London region) using Supabase infrastructure. Session data is automatically deleted after 90 days of inactivity.
          </p>

          <h2 className="text-lg font-bold text-slate-900">Your rights</h2>
          <p>
            You can request deletion of your data at any time by contacting your facilitator or the project team. As sessions are anonymous, data is identified by your session PIN only.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
      </div>
    </div>
  );
};

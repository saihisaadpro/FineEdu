import React from 'react';
import { useNavigate } from 'react-router';
import { ChevronRight, KeyRound, Layout, ShieldCheck, Target, Users } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const setRole = useUserStore(s => s.setRole);

  const handleLearnerEntry = () => {
    // useAuth hook has already created an anonymous Supabase session on app load.
    // We just need to assign the learner role and navigate.
    setRole('student');
    navigate('/dashboard');
  };

  const handleFacilitatorEntry = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-3xl animate-pulse" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-teal-600/20 blur-3xl" />
      </div>

      <div className="max-w-4xl w-full bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12 relative z-10 grid md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg mb-6">
              <Layout className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              WorkReady Finance <span className="text-blue-600">(Finedu)</span>
            </h1>
            <p className="text-slate-500 mt-2 font-medium">UWE Bristol Knowledge Exchange Project</p>
          </div>

          <div className="prose prose-sm text-slate-600 leading-relaxed">
            <p>
              A community-facing, gamified digital resource designed to translate UWE Bristol&apos;s expertise in finance into practical knowledge exchange.
            </p>
            <div className="space-y-4 mt-4">
              <div className="flex gap-3">
                <Target className="w-5 h-5 text-blue-600 shrink-0" />
                <span className="text-xs">
                  <strong>Objective:</strong> Strengthen financial capability, work readiness, and economic inclusion among underserved groups.
                </span>
              </div>
              <div className="flex gap-3">
                <Users className="w-5 h-5 text-indigo-600 shrink-0" />
                <span className="text-xs">
                  <strong>Community Focused:</strong> Deployed through charities, libraries, and employability services across the Southwest.
                </span>
              </div>
              <div className="flex gap-3">
                <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0" />
                <span className="text-xs">
                  <strong>Impact:</strong> Building confidence in managing income, pensions, tax, and digital financial tools.
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center border-l border-slate-100 pl-0 md:pl-12">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Start Your Mission</h2>
            <p className="text-sm text-slate-500">Enter the local learning dashboard and pick a finance topic to practise.</p>
          </div>

          <div className="space-y-4">
            <button
              type="button"
              onClick={handleLearnerEntry}
              className="group w-full py-4 px-6 bg-slate-900 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-blue-500/30 flex items-center justify-between"
            >
              <div className="text-left">
                <span className="block text-sm opacity-80 font-normal">I am a Learner</span>
                <span className="block text-lg">Enter Dashboard</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
            </button>
            <button
              type="button"
              onClick={handleFacilitatorEntry}
              className="group w-full py-4 px-6 bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-600 rounded-xl font-semibold transition-all flex items-center justify-between hover:shadow-md"
            >
              <div className="text-left">
                <span className="block text-sm opacity-60 font-normal">I am a Partner / Facilitator</span>
                <span className="block text-lg">Manage Content</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
            </button>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => navigate('/resume')}
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-blue-600 transition-colors"
            >
              <KeyRound className="w-4 h-4" />
              Resume a previous session with PIN
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Local Scenario-Based Learning</p>
          </div>
        </div>
      </div>
    </div>
  );
};

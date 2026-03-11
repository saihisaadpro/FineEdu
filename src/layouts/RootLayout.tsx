import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { BookOpen, ChevronRight, Layout, LogOut, UserCircle2 } from 'lucide-react';
import { clsx } from 'clsx';
import { MODULES } from '@/data/modules';
import { Module, Topic } from '@/types';
import { useUserStore } from '@/stores/userStore';

export const RootLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = useUserStore(s => s.role);
  const logout = useUserStore(s => s.logout);

  // Derive current module and topic from URL
  const pathParts = location.pathname.split('/').filter(Boolean);
  let currentModule: Module | null = null;
  let currentTopic: Topic | null = null;

  if (pathParts[0] === 'module' && pathParts[1]) {
    currentModule = MODULES.find(m => m.id === pathParts[1]) ?? null;
  }
  if (pathParts[0] === 'topic' && pathParts[1]) {
    for (const mod of MODULES) {
      const found = mod.topics.find(t => t.id === pathParts[1]);
      if (found) {
        currentTopic = found;
        currentModule = mod;
        break;
      }
    }
  }

  const isLoggedIn = location.pathname !== '/' && userRole !== null;
  const isAssessment = pathParts[2] === 'assessment';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleSelectTopic = (topic: Topic) => {
    navigate(`/topic/${topic.id}`);
  };

  // Don't show chrome on login page or during assessment
  if (!isLoggedIn) {
    return <Outlet />;
  }

  if (isAssessment) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans relative">
      <aside className="w-72 bg-white border-r border-slate-200 hidden md:flex flex-col fixed h-full z-20 shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <Layout className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-lg font-bold text-slate-900 tracking-tight leading-none">WorkReady</span>
            <span className="block text-xs font-medium text-blue-600">Finance (Finedu)</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {currentModule ? (
            <div className="animate-fade-in">
              <button
                type="button"
                onClick={handleBackToDashboard}
                className="mb-6 text-xs font-bold text-slate-400 hover:text-blue-600 uppercase tracking-wider flex items-center gap-1 transition-colors pl-2"
              >
                <ChevronRight className="w-3 h-3 rotate-180" /> All Modules
              </button>

              <div className="mb-4 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block mb-1">Active Module</span>
                <h3 className="font-bold text-blue-900 leading-tight">{currentModule.title}</h3>
              </div>

              <div className="mt-6 space-y-1">
                <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Missions</p>
                {currentModule.topics.map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => handleSelectTopic(topic)}
                    className={clsx(
                      'w-full text-left px-4 py-3 rounded-lg text-sm transition-all duration-200 flex items-center justify-between group',
                      currentTopic?.id === topic.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                    )}
                  >
                    <span className="truncate mr-2">{topic.title}</span>
                    {currentTopic?.id === topic.id && <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="px-4 py-8 text-center">
              <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Select a module from the dashboard to explore missions.</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600">
              <UserCircle2 className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 capitalize truncate">{userRole === 'lecturer' ? 'Facilitator' : 'Learner'}</p>
              <p className="text-xs text-slate-500 truncate">Session Active</p>
            </div>
            <button type="button" onClick={handleLogout} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 md:ml-72 p-4 md:p-10 overflow-y-auto min-h-screen">
        <div className="md:hidden flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Layout className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg text-slate-900">WorkReady</span>
          </div>
          <button type="button" onClick={handleLogout} className="text-sm font-medium text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
            Logout
          </button>
        </div>

        <Outlet />
      </main>
    </div>
  );
};

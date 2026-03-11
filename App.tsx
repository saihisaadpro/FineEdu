import React, { useState } from 'react';
import { BookOpen, ChevronRight, Layout, LogOut, ShieldCheck, Target, UserCircle2, Users } from 'lucide-react';
import { clsx } from 'clsx';
import { Dashboard } from './components/Dashboard';
import { Assessment } from './components/Assessment';
import { TopicDetail } from './components/TopicDetail';
import { MODULES } from './constants';
import { buildInitialTestBanks } from './content';
import { Module, Question, Role, Topic } from './types';

type View = 'login' | 'dashboard' | 'module' | 'topic' | 'assessment';

function App() {
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [view, setView] = useState<View>('login');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [testBanks, setTestBanks] = useState<Record<string, Question[]>>(() => buildInitialTestBanks(MODULES));

  const handleLogin = (role: Role) => {
    setUserRole(role);
    setCurrentModule(null);
    setCurrentTopic(null);
    setView('dashboard');
  };

  const handleSelectModule = (module: Module) => {
    setCurrentModule(module);
    setCurrentTopic(null);
    setView('module');
  };

  const handleSelectTopic = (topic: Topic) => {
    setCurrentTopic(topic);
    setView('topic');
  };

  const handleStartAssessment = (nextDifficulty: 'easy' | 'medium' | 'hard') => {
    setDifficulty(nextDifficulty);
    setView('assessment');
  };

  const handleUpdateTestBank = (questions: Question[]) => {
    if (!currentTopic) {
      return;
    }

    setTestBanks((previous) => ({ ...previous, [currentTopic.id]: questions }));
  };

  const handleBackToDashboard = () => {
    setCurrentModule(null);
    setCurrentTopic(null);
    setView('dashboard');
  };

  const handleBackToModule = () => {
    setCurrentTopic(null);
    setView('module');
  };

  const handleLogout = () => {
    setUserRole(null);
    setCurrentModule(null);
    setCurrentTopic(null);
    setView('login');
  };

  if (view === 'login') {
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
                onClick={() => handleLogin('student')}
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
                onClick={() => handleLogin('lecturer')}
                className="group w-full py-4 px-6 bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-600 rounded-xl font-semibold transition-all flex items-center justify-between hover:shadow-md"
              >
                <div className="text-left">
                  <span className="block text-sm opacity-60 font-normal">I am a Partner / Facilitator</span>
                  <span className="block text-lg">Manage Content</span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Local Scenario-Based Learning</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentTestBank = currentTopic ? testBanks[currentTopic.id] || [] : [];

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
            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
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

        {view === 'dashboard' && <Dashboard userRole={userRole!} onSelectModule={handleSelectModule} />}

        {view === 'module' && currentModule && (
          <div className="max-w-5xl mx-auto animate-in fade-in zoom-in-95 duration-300">
            <button type="button" onClick={handleBackToDashboard} className="md:hidden mb-6 text-sm font-medium text-slate-500 flex items-center">
              <ChevronRight className="w-4 h-4 rotate-180 mr-1" /> Back
            </button>
            <div className="mb-10">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wide mb-3">
                Module Lead: {currentModule.lead}
              </div>
              <h1 className="text-4xl font-extrabold text-slate-900 mb-4">{currentModule.title}</h1>
              <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">{currentModule.description}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {currentModule.topics.map((topic, index) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => handleSelectTopic(topic)}
                  className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-left cursor-pointer hover:border-blue-400 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300 ease-out relative overflow-hidden"
                >
                  <div className="absolute -top-6 -right-6 p-4 opacity-5 group-hover:opacity-10 transition-all transform group-hover:scale-110 group-hover:rotate-6 duration-700 ease-in-out pointer-events-none">
                    <BookOpen className="w-32 h-32" />
                  </div>
                  <div className="relative z-10">
                    <span className="text-xs font-bold text-slate-400 mb-2 block tracking-wider">MISSION {index + 1}</span>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">{topic.title}</h3>
                    <div className="flex items-center text-blue-600 font-medium text-sm mt-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out delay-75">
                      Start Mission <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {view === 'topic' && currentModule && currentTopic && (
          <TopicDetail
            topic={currentTopic}
            module={currentModule}
            onBack={handleBackToModule}
            onStartAssessment={handleStartAssessment}
            userRole={userRole!}
            testBankQuestions={currentTestBank}
            onUpdateTestBank={handleUpdateTestBank}
          />
        )}

        {view === 'assessment' && currentModule && currentTopic && (
          <Assessment
            topic={currentTopic}
            module={currentModule}
            initialDifficulty={difficulty}
            onExit={() => setView('topic')}
            userRole={userRole!}
            testBank={currentTestBank}
          />
        )}
      </main>
    </div>
  );
}

export default App;

import React from 'react';
import { MODULES } from '@/data/modules';
import { Module } from '@/types';
import { useUserStore } from '@/stores/userStore';
import { useProgressStore } from '@/stores/progressStore';
import { isLearnerRole, ROLE_LABELS } from '@/types/roles';
import { Calculator, TrendingUp, Briefcase, Cpu, ArrowRight, CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { BadgeShelf } from '@/components/gamification/BadgeShelf';

interface DashboardProps {
  onSelectModule: (module: Module) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Calculator: <Calculator className="w-8 h-8" />,
  TrendingUp: <TrendingUp className="w-8 h-8" />,
  Briefcase: <Briefcase className="w-8 h-8" />,
  Cpu: <Cpu className="w-8 h-8" />,
};

const gradientMap: Record<string, string> = {
  accounting: "from-emerald-500 to-teal-500",
  investment: "from-blue-500 to-indigo-500",
  management: "from-violet-500 to-purple-500",
  fintech: "from-pink-500 to-rose-500"
};

const bgMap: Record<string, string> = {
    accounting: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white",
    investment: "bg-blue-50 text-blue-600 group-hover:bg-blue-500 group-hover:text-white",
    management: "bg-violet-50 text-violet-600 group-hover:bg-violet-500 group-hover:text-white",
    fintech: "bg-pink-50 text-pink-600 group-hover:bg-pink-500 group-hover:text-white"
};

export const Dashboard: React.FC<DashboardProps> = ({ onSelectModule }) => {
  const userRole = useUserStore(s => s.role) ?? 'student';
  const isLearner = isLearnerRole(userRole);
  const roleLabel = ROLE_LABELS[userRole] ?? 'Learner';
  const topicProgress = useProgressStore(s => s.topicProgress);

  const getModuleProgress = (module: Module) => {
    const completed = module.topics.filter(t => topicProgress[t.id]?.completed).length;
    return { completed, total: module.topics.length, percent: Math.round((completed / module.topics.length) * 100) };
  };
  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8 sm:mb-12 text-center md:text-left">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2 sm:mb-3">
            Welcome, {roleLabel}
        </h1>
        <p className="text-lg text-slate-600 max-w-3xl">
            Select a WorkReady module to begin. These scenarios are designed to build financial confidence for employment and daily life.
        </p>
      </div>

      <div data-tour="module-cards" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 xl:gap-8">
        {MODULES.map((module) => {
          const progress = getModuleProgress(module);
          const isComplete = progress.completed === progress.total;
          const hasStarted = progress.completed > 0;
          return (
          <button
            key={module.id}
            type="button"
            onClick={() => onSelectModule(module)}
            className="group relative flex flex-col h-full text-left bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-2xl hover:border-slate-300 hover:-translate-y-2 hover:scale-[1.01] transition-all duration-300 ease-out overflow-hidden"
          >
            {/* Top Border Gradient */}
            <div className={clsx("h-1.5 w-full bg-gradient-to-r", gradientMap[module.id] || "from-slate-400 to-slate-500")}></div>
            
            <div className="p-5 sm:p-8 flex-1 flex flex-col relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className={clsx(
                        "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-3 shadow-sm",
                        bgMap[module.id] || "bg-slate-50 text-slate-600"
                    )}>
                      {iconMap[module.icon]}
                    </div>
                    {isComplete ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                        <CheckCircle className="w-3 h-3" /> Complete
                      </span>
                    ) : (
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-500 group-hover:bg-slate-200 transition-colors">
                        Lead: {module.lead}
                      </span>
                    )}
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-700 transition-colors duration-300">{module.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4 flex-1 group-hover:text-slate-600 transition-colors">{module.description}</p>

                {/* Progress bar */}
                {hasStarted && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 mb-1">
                      <span>{progress.completed}/{progress.total} stages</span>
                      <span>{progress.percent}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={clsx(
                          "h-full rounded-full transition-all duration-500",
                          isComplete ? "bg-emerald-500" : "bg-blue-500",
                        )}
                        style={{ width: `${progress.percent}%` }}
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex items-center text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors mt-auto">
                  {!isLearner ? 'Manage Curriculum' : hasStarted ? 'Continue' : 'Start Scenarios'} 
                  <ArrowRight className="ml-2 w-4 h-4 transform group-hover:translate-x-1.5 transition-transform duration-300 ease-out" />
                </div>
            </div>
            
            {/* Subtle background wash on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          </button>
          );
        })}
      </div>

      <BadgeShelf />
    </div>
  );
};

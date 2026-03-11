import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { BookOpen, ChevronRight } from 'lucide-react';
import { MODULES } from '@/data/modules';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const ModulePage: React.FC = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const module = MODULES.find(m => m.id === moduleId);

  if (!module) return <NotFoundPage />;

  const handleSelectTopic = (topicId: string) => {
    navigate(`/topic/${topicId}`);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="max-w-5xl mx-auto animate-zoom-in">
      <button type="button" onClick={handleBackToDashboard} className="md:hidden mb-6 text-sm font-medium text-slate-500 flex items-center">
        <ChevronRight className="w-4 h-4 rotate-180 mr-1" /> Back
      </button>
      <div className="mb-10">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wide mb-3">
          Module Lead: {module.lead}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3 sm:mb-4">{module.title}</h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">{module.description}</p>
      </div>

      <div data-tour="stage-list" className="grid gap-4 sm:grid-cols-2">
        {module.topics.map((topic, index) => (
          <button
            key={topic.id}
            type="button"
            onClick={() => handleSelectTopic(topic.id)}
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
  );
};

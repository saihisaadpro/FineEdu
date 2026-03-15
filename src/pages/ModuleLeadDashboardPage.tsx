import React, { useState } from 'react';
import { BookOpen, ChevronDown, Eye, FileText, BarChart3, AlertTriangle, Layers, Settings } from 'lucide-react';
import { clsx } from 'clsx';
import { ScenarioManager } from '@/components/dashboard/ScenarioManager';
import { QualityReviewQueue } from '@/components/dashboard/QualityReviewQueue';
import { ContentAnalytics } from '@/components/dashboard/ContentAnalytics';
import { ScenarioPreview } from '@/components/dashboard/ScenarioPreview';
import { TemplateViewer } from '@/components/dashboard/TemplateViewer';

interface BlockInfo {
  id: string;
  name: string;
  lead: string;
  colour: string;
}

const BLOCKS: BlockInfo[] = [
  { id: 'accounting', name: 'Accounting & Recording', lead: 'Rui', colour: 'from-blue-600 to-blue-700' },
  { id: 'investment', name: 'Investment & Risk', lead: 'Helen', colour: 'from-indigo-600 to-indigo-700' },
  { id: 'management', name: 'Management Accounting', lead: 'Yan', colour: 'from-teal-600 to-teal-700' },
  { id: 'fintech', name: 'FinTech & Digital Finance', lead: 'Xiaojun', colour: 'from-purple-600 to-purple-700' },
];

type Tab = 'scenarios' | 'templates' | 'analytics' | 'reviews' | 'preview';

export const ModuleLeadDashboardPage: React.FC = () => {
  const [selectedBlock, setSelectedBlock] = useState(BLOCKS[0]);
  const [blockMenuOpen, setBlockMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('scenarios');
  const [previewStage, setPreviewStage] = useState(1);

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'scenarios', label: 'Scenarios', icon: FileText },
    { id: 'templates', label: 'Templates', icon: Layers },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reviews', label: 'Review Queue', icon: AlertTriangle },
    { id: 'preview', label: 'Preview', icon: Eye },
  ];

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1 flex items-center gap-2">
              <BookOpen className="w-7 h-7 text-teal-600" />
              Module Leader Dashboard
            </h1>
            <p className="text-sm text-slate-500">
              Manage scenarios, review content quality, and track learner performance across your blocks.
            </p>
          </div>
          <Settings className="w-5 h-5 text-slate-300 mt-2" />
        </div>
      </div>

      {/* Block Selector */}
      <div className="mb-6">
        <div className="relative inline-block">
          <button
            type="button"
            onClick={() => setBlockMenuOpen(!blockMenuOpen)}
            className={clsx(
              'inline-flex items-center gap-3 px-4 py-3 rounded-xl text-white font-semibold bg-gradient-to-r shadow-md hover:shadow-lg transition-all',
              selectedBlock.colour,
            )}
          >
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="block text-sm font-bold">{selectedBlock.name}</span>
              <span className="block text-xs text-white/70">Lead: {selectedBlock.lead}</span>
            </div>
            <ChevronDown className={clsx('w-4 h-4 transition-transform', blockMenuOpen && 'rotate-180')} />
          </button>

          {blockMenuOpen && (
            <div className="absolute top-full mt-2 left-0 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 z-30 animate-slide-in-up overflow-hidden">
              {BLOCKS.map(block => (
                <button
                  key={block.id}
                  type="button"
                  onClick={() => { setSelectedBlock(block); setBlockMenuOpen(false); }}
                  className={clsx(
                    'w-full text-left px-4 py-3 flex items-center gap-3 transition-colors',
                    selectedBlock.id === block.id ? 'bg-blue-50' : 'hover:bg-slate-50',
                  )}
                >
                  <div className={clsx('w-3 h-3 rounded-full bg-gradient-to-r', block.colour)} />
                  <div>
                    <span className="block text-sm font-semibold text-slate-900">{block.name}</span>
                    <span className="block text-xs text-slate-400">Lead: {block.lead}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all whitespace-nowrap',
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700',
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'scenarios' && (
          <ScenarioManager blockId={selectedBlock.id} />
        )}

        {activeTab === 'templates' && (
          <TemplateViewer blockId={selectedBlock.id} />
        )}

        {activeTab === 'analytics' && (
          <ContentAnalytics blockId={selectedBlock.id} blockName={selectedBlock.name} />
        )}

        {activeTab === 'reviews' && (
          <QualityReviewQueue blockId={selectedBlock.id} />
        )}

        {activeTab === 'preview' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-semibold text-slate-700">Stage:</span>
              <div className="flex gap-1">
                {([1, 2, 3, 4] as const).map(stage => (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => setPreviewStage(stage)}
                    className={clsx(
                      'w-10 h-10 rounded-lg text-sm font-bold transition-all',
                      previewStage === stage
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
                    )}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            </div>
            <ScenarioPreview blockId={selectedBlock.id} stageNumber={previewStage} />
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { MODULES } from '@/data/modules';
import { StageView } from '@/components/stage/StageView';
import { BlockCompletionSummary } from '@/components/stage/BlockCompletionSummary';
import { ConfidenceSurvey } from '@/components/feedback/ConfidenceSurvey';
import { supabase } from '@/services/supabase';
import { useUserStore } from '@/stores/userStore';
import { NotFoundPage } from '@/pages/NotFoundPage';
import type { BlockId } from '@/types/content';

export const TopicPage: React.FC = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const userId = useUserStore((s) => s.supabaseUserId);

  const [view, setView] = useState<'pre-survey' | 'stage' | 'completion'>('stage');
  const [preSurveyChecked, setPreSurveyChecked] = useState(false);

  // Find the module and topic
  let foundModule = null;
  let foundTopic = null;
  for (const mod of MODULES) {
    const topic = mod.topics.find((t) => t.id === topicId);
    if (topic) {
      foundModule = mod;
      foundTopic = topic;
      break;
    }
  }

  const blockId = foundModule?.id as BlockId | undefined;

  // Check if user has already taken a pre-survey for this block
  useEffect(() => {
    if (!userId || !blockId || preSurveyChecked) return;

    supabase
      .from('survey_responses')
      .select('id')
      .eq('user_id', userId)
      .eq('block_id', blockId)
      .eq('survey_type', 'pre')
      .limit(1)
      .then(({ data }) => {
        setPreSurveyChecked(true);
        // If no pre-survey yet and this is stage 1, show the pre-survey
        if ((!data || data.length === 0) && topicId?.endsWith('_1')) {
          setView('pre-survey');
        }
      });
  }, [userId, blockId, topicId, preSurveyChecked]);

  if (!foundModule || !foundTopic || !topicId) return <NotFoundPage />;

  const handleBack = () => {
    navigate(`/module/${foundModule!.id}`);
  };

  const handleNextStage = (nextTopicId: string) => {
    navigate(`/topic/${nextTopicId}`);
  };

  const handleBlockComplete = () => {
    setView('completion');
  };

  // Pre-survey gate for first stage of a block
  if (view === 'pre-survey' && blockId) {
    return (
      <div className="max-w-4xl mx-auto py-8 animate-fade-in">
        <ConfidenceSurvey
          blockId={blockId}
          blockTitle={foundModule.title}
          surveyType="pre"
          onComplete={() => setView('stage')}
        />
      </div>
    );
  }

  // Block completion summary
  if (view === 'completion' && blockId) {
    return (
      <BlockCompletionSummary
        blockId={blockId}
        onReturnToDashboard={() => navigate('/dashboard')}
        onTryAnotherBlock={() => navigate('/dashboard')}
      />
    );
  }

  return (
    <StageView
      topicId={topicId}
      moduleTitle={foundModule.title}
      onBack={handleBack}
      onNextStage={handleNextStage}
      onBlockComplete={handleBlockComplete}
    />
  );
};

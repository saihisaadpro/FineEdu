import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { MODULES } from '@/data/modules';
import { StageView } from '@/components/stage/StageView';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const TopicPage: React.FC = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();

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

  if (!foundModule || !foundTopic || !topicId) return <NotFoundPage />;

  const handleBack = () => {
    navigate(`/module/${foundModule!.id}`);
  };

  const handleNextStage = (nextTopicId: string) => {
    navigate(`/topic/${nextTopicId}`);
  };

  const handleBlockComplete = () => {
    navigate(`/module/${foundModule!.id}`);
  };

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

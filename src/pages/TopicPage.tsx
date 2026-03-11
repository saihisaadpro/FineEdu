import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { MODULES } from '@/data/modules';
import { buildInitialTestBanks } from '@/data/content';
import { TopicDetail } from '@/components/topic/TopicDetail';
import { useUserStore } from '@/stores/userStore';
import { useContentStore } from '@/stores/contentStore';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const TopicPage: React.FC = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const userRole = useUserStore(s => s.role) ?? 'student';
  const testBanks = useContentStore(s => s.testBanks);
  const initTestBanks = useContentStore(s => s.initTestBanks);
  const updateTestBank = useContentStore(s => s.updateTestBank);

  // Initialize test banks once
  useEffect(() => {
    if (Object.keys(testBanks).length === 0) {
      initTestBanks(buildInitialTestBanks(MODULES));
    }
  }, [testBanks, initTestBanks]);

  // Find the module and topic
  let foundModule = null;
  let foundTopic = null;
  for (const mod of MODULES) {
    const topic = mod.topics.find(t => t.id === topicId);
    if (topic) {
      foundModule = mod;
      foundTopic = topic;
      break;
    }
  }

  if (!foundModule || !foundTopic) return <NotFoundPage />;

  const currentTestBank = testBanks[foundTopic.id] || [];

  const handleUpdateTestBank = (questions: typeof currentTestBank) => {
    updateTestBank(foundTopic!.id, questions);
  };

  const handleBack = () => {
    navigate(`/module/${foundModule!.id}`);
  };

  const handleStartAssessment = (difficulty: 'easy' | 'medium' | 'hard') => {
    navigate(`/topic/${topicId}/assessment?difficulty=${difficulty}`);
  };

  return (
    <TopicDetail
      topic={foundTopic}
      module={foundModule}
      onBack={handleBack}
      onStartAssessment={handleStartAssessment}
      userRole={userRole}
      testBankQuestions={currentTestBank}
      onUpdateTestBank={handleUpdateTestBank}
    />
  );
};

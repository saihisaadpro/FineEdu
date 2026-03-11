import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import { MODULES } from '@/data/modules';
import { buildInitialTestBanks } from '@/data/content';
import { TopicDetail } from '@/components/topic/TopicDetail';
import { Question } from '@/types';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const TopicPage: React.FC = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userRole = (searchParams.get('role') as 'student' | 'lecturer') || 'student';

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

  const [testBanks, setTestBanks] = useState<Record<string, Question[]>>(() => buildInitialTestBanks(MODULES));

  if (!foundModule || !foundTopic) return <NotFoundPage />;

  const currentTestBank = testBanks[foundTopic.id] || [];

  const handleUpdateTestBank = (questions: Question[]) => {
    setTestBanks(prev => ({ ...prev, [foundTopic!.id]: questions }));
  };

  const handleBack = () => {
    navigate(`/module/${foundModule!.id}?role=${userRole}`);
  };

  const handleStartAssessment = (difficulty: 'easy' | 'medium' | 'hard') => {
    navigate(`/topic/${topicId}/assessment?role=${userRole}&difficulty=${difficulty}`);
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

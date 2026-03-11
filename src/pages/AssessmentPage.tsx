import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import { MODULES } from '@/data/modules';
import { buildInitialTestBanks } from '@/data/content';
import { Assessment } from '@/components/assessment/Assessment';
import { Question } from '@/types';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const AssessmentPage: React.FC = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userRole = (searchParams.get('role') as 'student' | 'lecturer') || 'student';
  const difficulty = (searchParams.get('difficulty') as 'easy' | 'medium' | 'hard') || 'easy';

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

  const [testBanks] = useState<Record<string, Question[]>>(() => buildInitialTestBanks(MODULES));

  if (!foundModule || !foundTopic) return <NotFoundPage />;

  const currentTestBank = testBanks[foundTopic.id] || [];

  const handleExit = () => {
    navigate(`/topic/${topicId}?role=${userRole}`);
  };

  return (
    <div className="p-4 md:p-10">
      <Assessment
        topic={foundTopic}
        module={foundModule}
        initialDifficulty={difficulty}
        onExit={handleExit}
        userRole={userRole}
        testBank={currentTestBank}
      />
    </div>
  );
};

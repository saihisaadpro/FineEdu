import React, { useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import { MODULES } from '@/data/modules';
import { buildInitialTestBanks } from '@/data/content';
import { Assessment } from '@/components/assessment/Assessment';
import { useUserStore } from '@/stores/userStore';
import { useContentStore } from '@/stores/contentStore';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const AssessmentPage: React.FC = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userRole = useUserStore(s => s.role) ?? 'student';
  const difficulty = (searchParams.get('difficulty') as 'easy' | 'medium' | 'hard') || 'easy';
  const testBanks = useContentStore(s => s.testBanks);
  const initTestBanks = useContentStore(s => s.initTestBanks);

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

  const handleExit = () => {
    navigate(`/topic/${topicId}`);
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

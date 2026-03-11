import React, { useCallback, useEffect, useState } from 'react';
import Joyride, { ACTIONS, EVENTS, STATUS, type CallBackProps } from 'react-joyride';
import { useNavigate, useLocation } from 'react-router';
import { toast } from 'sonner';
import { DemoTooltip } from '@/components/ui/DemoTooltip';
import { DEMO_TOUR_STEPS } from '@/data/demoTourSteps';
import { DEMO_XP, DEMO_BADGES, DEMO_TOPIC_PROGRESS } from '@/data/demoSeedData';
import { useProgressStore } from '@/stores/progressStore';
import { useUserStore } from '@/stores/userStore';

interface DemoOverlayProps {
  onEnd: () => void;
}

export const DemoOverlay: React.FC<DemoOverlayProps> = ({ onEnd }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [stepIndex, setStepIndex] = useState(0);
  const [run, setRun] = useState(false);

  // Seed demo data on mount
  useEffect(() => {
    const progressState = useProgressStore.getState();
    const userState = useUserStore.getState();

    // Store originals for restoration
    const originalXP = progressState.xp;
    const originalBadges = [...progressState.badges];
    const originalProgress = { ...progressState.topicProgress };
    const originalRole = userState.role;

    // Seed demo data
    useProgressStore.setState({
      xp: DEMO_XP,
      badges: DEMO_BADGES,
      topicProgress: DEMO_TOPIC_PROGRESS as never,
    });

    // Set facilitator role so facilitator link is visible
    userState.setRole('facilitator');

    return () => {
      // Restore original state
      useProgressStore.setState({
        xp: originalXP,
        badges: originalBadges,
        topicProgress: originalProgress,
      });
      if (originalRole) {
        userState.setRole(originalRole);
      }
    };
  }, []);

  // Start the tour after seeding and navigating to first route
  useEffect(() => {
    const firstStep = DEMO_TOUR_STEPS[0];
    if (firstStep.route && location.pathname !== firstStep.route) {
      navigate(firstStep.route);
    }
    // Small delay for DOM to render target elements
    const timer = setTimeout(() => setRun(true), 500);
    return () => clearTimeout(timer);
  }, [navigate, location.pathname]);

  const handleCallback = useCallback(
    (data: CallBackProps) => {
      const { action, index, status, type } = data;

      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        setRun(false);
        toast.success('Tour complete! Ready to explore on your own?');
        onEnd();
        return;
      }

      if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
        const nextIndex = action === ACTIONS.PREV ? index - 1 : index + 1;

        if (nextIndex >= 0 && nextIndex < DEMO_TOUR_STEPS.length) {
          const nextStep = DEMO_TOUR_STEPS[nextIndex];

          if (nextStep.route && location.pathname !== nextStep.route) {
            setRun(false);
            navigate(nextStep.route);
            // Wait for navigation then resume
            setTimeout(() => {
              setStepIndex(nextIndex);
              setRun(true);
            }, 600);
          } else {
            setStepIndex(nextIndex);
          }
        }
      }
    },
    [location.pathname, navigate, onEnd],
  );

  return (
    <Joyride
      steps={DEMO_TOUR_STEPS}
      stepIndex={stepIndex}
      run={run}
      continuous
      showSkipButton
      scrollToFirstStep
      disableOverlayClose
      tooltipComponent={DemoTooltip}
      callback={handleCallback}
      styles={{
        options: {
          zIndex: 10000,
          overlayColor: 'rgba(0, 0, 0, 0.4)',
        },
      }}
      floaterProps={{
        styles: {
          floater: {
            filter: 'none',
          },
        },
      }}
    />
  );
};

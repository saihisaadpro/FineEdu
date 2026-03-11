import type { Step } from 'react-joyride';

/**
 * 7-step guided tour for the Showcase Demo Mode.
 * Each step targets a CSS selector that must exist on the page
 * at the time the step is active. The DemoOverlay navigates
 * to the correct route before showing each step.
 */
export const DEMO_TOUR_STEPS: (Step & { route?: string })[] = [
  {
    target: '[data-tour="hero"]',
    content:
      'Welcome to WorkReady Finance — a gamified financial literacy platform for community learners, funded by HEIF at UWE Bristol.',
    placement: 'center',
    disableBeacon: true,
    route: '/',
  },
  {
    target: '[data-tour="module-cards"]',
    content:
      'Learners choose from 4 financial literacy modules, each with AI-generated workplace scenarios.',
    placement: 'bottom',
    route: '/dashboard',
  },
  {
    target: '[data-tour="stage-list"]',
    content:
      'Each module has 4 scaffolded stages that build on each other — Record → Report → Analyse → Advise.',
    placement: 'right',
    route: '/module/accounting',
  },
  {
    target: '[data-tour="scenario-panel"]',
    content:
      'AI generates a unique scenario each time. No two sessions are the same.',
    placement: 'top',
    route: '/topic/acc_1',
  },
  {
    target: '[data-tour="ai-chat"]',
    content:
      'Stuck? The AI learning assistant helps without giving away answers.',
    placement: 'left',
    route: '/topic/acc_1',
  },
  {
    target: '[data-tour="xp-bar"]',
    content:
      'Learners earn XP and badges, keeping them motivated across sessions.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="facilitator-link"]',
    content:
      'Facilitators can monitor all sessions in real-time from their dashboard.',
    placement: 'right',
  },
];

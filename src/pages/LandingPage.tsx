import React, { useRef } from 'react';
import { useNavigate } from 'react-router';
import { BookOpen, ChevronRight, GraduationCap, KeyRound, Layout, Layers, Trophy, Users } from 'lucide-react';
import { clsx } from 'clsx';
import { useUserStore } from '@/stores/userStore';
import { supabase } from '@/services/supabase';
import { hasGDPRConsent } from '@/components/ui/ConsentBanner';
import { isLearnerRole, ROLE_HOME_ROUTES } from '@/types/roles';
import { useInView } from '@/hooks/useInView';

/* ── Scroll-reveal wrapper ─────────────────────────────────────────── */
const Reveal: React.FC<{ children: React.ReactNode; className?: string; delay?: string }> = ({
  children,
  className,
  delay = '0ms',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { threshold: 0.15 });
  return (
    <div
      ref={ref}
      className={clsx(
        'transition-all duration-700 ease-out',
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
        className,
      )}
      style={{ transitionDelay: delay }}
    >
      {children}
    </div>
  );
};

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const setRole = useUserStore(s => s.setRole);

  const handleLearnerEntry = async () => {
    // Don't overwrite staff roles — redirect to their existing dashboard
    const currentRole = useUserStore.getState().role;
    if (currentRole && !isLearnerRole(currentRole)) {
      navigate(ROLE_HOME_ROUTES[currentRole]);
      return;
    }
    // Ensure an anonymous Supabase session exists so learner data can persist
    if (hasGDPRConsent()) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        await supabase.auth.signInAnonymously();
      }
    }
    setRole('student');
    navigate('/dashboard');
  };

  const handleFacilitatorEntry = () => {
    navigate('/login?role=facilitator');
  };

  const handleModuleLeadEntry = () => {
    navigate('/login?role=module_lead');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero Section ──────────────────────────────────────────── */}
      <section data-tour="hero" className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-3xl animate-pulse" />
          <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] rounded-full bg-indigo-600/20 blur-3xl" />
          <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-teal-600/15 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 text-center">
          {/* Logos */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Layout className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-bold tracking-tight">UWE Bristol</span>
            </div>
            <span className="text-xs bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full font-medium">
              HEIF Funded
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
            Financial Literacy{' '}
            <span className="bg-gradient-to-r from-blue-200 to-teal-200 bg-clip-text text-transparent">
              for Everyone
            </span>
          </h1>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto mb-10">
            AI-powered workplace scenarios. Built for community learning.
          </p>

          {/* Quick stats */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {[
              { icon: BookOpen, label: '4 Financial Modules' },
              { icon: Layers, label: 'AI-Powered Scenarios' },
              { icon: Users, label: 'Built for Community Learning' },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium"
              >
                <Icon className="w-4 h-4 text-blue-300" />
                {label}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={handleLearnerEntry}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-900 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
          >
            Start Learning
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* ── Persona Cards ─────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <Reveal>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-4">
            Who is WorkReady Finance for?
          </h2>
          <p className="text-slate-500 text-center max-w-xl mx-auto mb-12">
            Whether you're a learner, a facilitator running sessions, or a module lead authoring content.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: GraduationCap,
              colour: 'bg-blue-50 text-blue-600',
              title: 'Learner',
              description: 'Explore financial scenarios at your own pace. No login needed.',
              cta: 'Start Learning',
              onClick: handleLearnerEntry,
            },
            {
              icon: Users,
              colour: 'bg-indigo-50 text-indigo-600',
              title: 'Facilitator',
              description: 'Monitor sessions and support learners in real-time at your venue.',
              cta: 'Facilitator Login',
              onClick: handleFacilitatorEntry,
            },
            {
              icon: BookOpen,
              colour: 'bg-teal-50 text-teal-600',
              title: 'Module Lead',
              description: 'Author scenarios, review AI-generated content, and track learner outcomes for your block.',
              cta: 'Module Lead Login',
              onClick: handleModuleLeadEntry,
            },
          ].map((card, i) => (
            <Reveal key={card.title} delay={`${i * 100}ms`}>
              <div className="bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 p-8 flex flex-col items-center text-center h-full">
                <div className={clsx('w-14 h-14 rounded-2xl flex items-center justify-center mb-5', card.colour)}>
                  <card.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{card.title}</h3>
                <p className="text-sm text-slate-500 mb-6 flex-1">{card.description}</p>
                <button
                  type="button"
                  onClick={card.onClick}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {card.cta}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────── */}
      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-12">
              How It Works
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-10 left-[16.5%] right-[16.5%] h-px border-t-2 border-dashed border-slate-300" />

            {[
              { icon: Layout, step: '1', title: 'Choose a Module', desc: 'Pick from 4 financial literacy modules — accounting, investment, management, or fintech.' },
              { icon: Layers, step: '2', title: 'Work Through 4 Stages', desc: 'Each module has 4 scaffolded stages with AI-generated workplace scenarios.' },
              { icon: Trophy, step: '3', title: 'Earn XP & Badges', desc: 'Track your progress, earn XP for correct answers, and collect achievement badges.' },
            ].map((item, i) => (
              <Reveal key={item.step} delay={`${i * 150}ms`}>
                <div className="text-center relative">
                  <div className="w-20 h-20 rounded-2xl bg-white shadow-md border border-slate-200 flex items-center justify-center mx-auto mb-5 relative z-10">
                    <item.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <span className="inline-block text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full mb-3">
                    Step {item.step}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500 max-w-xs mx-auto">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Partner Logos ──────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <Reveal>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest text-center mb-8">
            Trusted by Community Partners
          </h2>
        </Reveal>
        <Reveal delay="100ms">
          <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12">
            {['Smart Works', 'Women\'s Work Lab', 'One Front Door', 'Ways2Work'].map((partner) => (
              <div
                key={partner}
                className="px-6 py-3 rounded-lg border border-slate-200 text-sm font-semibold text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-colors"
              >
                {partner}
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── Resume session link ───────────────────────────────────── */}
      <section className="text-center pb-8">
        <button
          type="button"
          onClick={() => navigate('/resume')}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-blue-600 transition-colors"
        >
          <KeyRound className="w-4 h-4" />
          Resume a previous session with PIN
        </button>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>A HEIF-funded initiative by UWE Bristol Accounting &amp; Finance &bull; &copy; 2026</p>
          <button
            type="button"
            onClick={() => navigate('/privacy')}
            className="hover:text-blue-600 transition-colors"
          >
            Privacy Policy
          </button>
        </div>
      </footer>
    </div>
  );
};

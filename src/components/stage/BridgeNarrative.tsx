import React, { useEffect, useState } from 'react';
import { ArrowRight, UserCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/Button';
import type { StageNumber, BlockId } from '@/types/content';

interface BridgeNarrativeProps {
  blockId: BlockId;
  fromStage: StageNumber;
  stageTitle: string;
  scorePercent: number;
  fallbackText: string;
  isBlockComplete: boolean;
  onContinue: () => void;
}

const BLOCK_NAMES: Record<BlockId, string> = {
  accounting: 'Accounting in Practice',
  investment: 'Investment in Practice',
  management: 'Corporate Finance in Practice',
  fintech: 'Digital Finance & FinTech',
};

const BLOCK_COLOURS: Record<BlockId, { border: string; icon: string }> = {
  accounting: { border: 'border-l-blue-500', icon: 'text-blue-600' },
  investment: { border: 'border-l-emerald-500', icon: 'text-emerald-600' },
  management: { border: 'border-l-amber-500', icon: 'text-amber-600' },
  fintech: { border: 'border-l-violet-500', icon: 'text-violet-600' },
};

const BRIDGE_TIMEOUT_MS = 5_000;

export const BridgeNarrative: React.FC<BridgeNarrativeProps> = ({
  blockId,
  fromStage,
  stageTitle,
  scorePercent,
  fallbackText,
  isBlockComplete,
  onContinue,
}) => {
  const [narrative, setNarrative] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const timeout = setTimeout(() => {
      if (!cancelled && loading) {
        setNarrative(fallbackText);
        setLoading(false);
      }
    }, BRIDGE_TIMEOUT_MS);

    const fetchBridge = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        if (!apiUrl) {
          setNarrative(fallbackText);
          setLoading(false);
          return;
        }

        const toStage = (fromStage + 1) as StageNumber;
        const res = await fetch(`${apiUrl}/api/bridge`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            blockId,
            fromStage,
            toStage,
            previousScore: scorePercent,
            previousStageName: stageTitle,
            blockName: BLOCK_NAMES[blockId],
          }),
        });

        if (!cancelled) {
          if (res.ok) {
            const data = await res.json();
            setNarrative(data.narrative);
          } else {
            setNarrative(fallbackText);
          }
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setNarrative(fallbackText);
          setLoading(false);
        }
      }
    };

    fetchBridge();
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [blockId, fromStage, stageTitle, scorePercent, fallbackText, loading]);

  const colours = BLOCK_COLOURS[blockId];

  return (
    <div className="animate-[fade-in-up_0.6s_ease-out] space-y-6">
      <section
        className={clsx(
          'bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 border-l-4 p-8',
          colours.border,
        )}
      >
        <div className="flex items-start gap-4">
          <div className={clsx('shrink-0 mt-1', colours.icon)}>
            <UserCircle className="w-10 h-10" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-3">
              {isBlockComplete ? 'Block Complete' : 'Next Stage Preview'}
            </h3>
            {loading ? (
              <div className="space-y-3">
                <div className="h-5 w-full bg-blue-200/50 rounded animate-pulse" />
                <div className="h-5 w-4/5 bg-blue-200/50 rounded animate-pulse" />
                <div className="h-5 w-3/5 bg-blue-200/50 rounded animate-pulse" />
              </div>
            ) : (
              <p className="text-slate-700 leading-relaxed text-lg italic animate-[fade-in_0.4s_ease-out_0.2s_both]">
                {narrative}
              </p>
            )}
          </div>
        </div>
      </section>

      <Button onClick={onContinue} className="w-full justify-center" size="lg" disabled={loading}>
        {isBlockComplete ? 'Finish Block' : `Continue to Stage ${fromStage + 1}`}
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
};

import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, MessageSquare, RotateCcw, XCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/services/supabase';
import { useUserStore } from '@/stores/userStore';

interface ReviewItem {
  id: string;
  scenario_id: string;
  block_id: string;
  stage_number: number;
  flagged_by_role: string | null;
  flag_reason: string;
  status: 'pending' | 'approved' | 'revised' | 'retired';
  reviewer_notes: string | null;
  created_at: string;
  resolved_at: string | null;
}

interface QualityReviewQueueProps {
  blockId: string;
}

export const QualityReviewQueue: React.FC<QualityReviewQueueProps> = ({ blockId }) => {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'resolved'>('pending');
  const [resolveId, setResolveId] = useState<string | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');
  const userId = useUserStore(s => s.supabaseUserId);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const query = supabase
        .from('scenario_reviews')
        .select('*')
        .eq('block_id', blockId)
        .order('created_at', { ascending: false })
        .limit(30);

      const { data, error } = activeTab === 'pending'
        ? await query.eq('status', 'pending')
        : await query.neq('status', 'pending');

      if (error) throw error;
      setItems((data ?? []) as ReviewItem[]);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      toast.error('Failed to load review queue');
    } finally {
      setLoading(false);
    }
  }, [blockId, activeTab]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const resolveReview = async (reviewId: string, status: 'approved' | 'revised' | 'retired') => {
    try {
      const { error } = await supabase
        .from('scenario_reviews')
        .update({
          status,
          reviewer_id: userId,
          reviewer_notes: resolveNotes || null,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', reviewId);
      if (error) throw error;

      // If retired, also unpublish the scenario
      if (status === 'retired') {
        const item = items.find(i => i.id === reviewId);
        if (item?.scenario_id) {
          await supabase
            .from('generated_scenarios')
            .update({ is_published: false })
            .eq('id', item.scenario_id);
        }
      }

      setResolveId(null);
      setResolveNotes('');
      toast.success(`Review ${status}`);
      fetchReviews();
    } catch {
      toast.error('Failed to resolve review');
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'revised': return <RotateCcw className="w-4 h-4 text-blue-600" />;
      case 'retired': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Quality Review Queue
        </h3>
        <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
          {items.filter(i => i.status === 'pending').length} pending
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        {(['pending', 'resolved'] as const).map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'px-3 py-1.5 text-xs font-semibold rounded-md transition-colors capitalize',
              activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-10 text-slate-400">
          <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">{activeTab === 'pending' ? 'No items need review.' : 'No resolved reviews yet.'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <div
              key={item.id}
              className={clsx(
                'bg-white rounded-xl border p-4',
                item.status === 'pending' ? 'border-amber-200' : 'border-slate-200',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    {statusIcon(item.status)}
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      Stage {item.stage_number}
                    </span>
                    <span className="text-xs text-slate-400">
                      {item.flagged_by_role && `Flagged by ${item.flagged_by_role}`}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 flex items-start gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
                    {item.flag_reason}
                  </p>
                  {item.reviewer_notes && (
                    <p className="text-xs text-slate-500 mt-1 pl-5 italic">
                      Resolution: {item.reviewer_notes}
                    </p>
                  )}
                </div>
                {item.status === 'pending' && (
                  <div className="shrink-0">
                    {resolveId === item.id ? (
                      <div className="space-y-2 w-64 animate-fade-in">
                        <textarea
                          placeholder="Review notes (optional)..."
                          value={resolveNotes}
                          onChange={e => setResolveNotes(e.target.value)}
                          className="w-full text-xs border border-slate-200 rounded-lg p-2 h-16 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex gap-1.5">
                          <Button size="sm" variant="primary" onClick={() => resolveReview(item.id, 'approved')} className="text-xs flex-1">
                            Approve
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => resolveReview(item.id, 'revised')} className="text-xs flex-1">
                            Revise
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => resolveReview(item.id, 'retired')} className="text-xs flex-1">
                            Retire
                          </Button>
                        </div>
                        <button type="button" onClick={() => { setResolveId(null); setResolveNotes(''); }} className="text-xs text-slate-400 hover:text-slate-600">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => setResolveId(item.id)} className="text-xs">
                        Review
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

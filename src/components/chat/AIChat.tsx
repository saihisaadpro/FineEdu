import React, { useCallback, useRef, useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import { MessageCircle, Send, X, Loader2 } from 'lucide-react';
import { useBlockSessionStore } from '@/stores/blockSessionStore';
import type { BlockId, StageNumber } from '@/types/content';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatProps {
  blockId: BlockId;
  stageNumber: StageNumber;
  scenarioBrief: string;
}

const MAX_MESSAGES = 10;

export const AIChat: React.FC<AIChatProps> = ({ blockId, stageNumber, scenarioBrief }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState(MAX_MESSAGES);
  const [firstUsed, setFirstUsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeSession = useBlockSessionStore((s) => s.activeSession);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || loading || remaining <= 0) return;

    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl || !activeSession) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
    setLoading(true);

    if (!firstUsed) setFirstUsed(true);

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12_000);

      const totalXP = activeSession.totalXP ?? 0;
      const xpLevel = totalXP >= 200 ? 'intermediate' : 'beginner';

      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          blockId,
          stageNumber,
          scenarioContext: scenarioBrief.slice(0, 2000),
          userXPLevel: xpLevel,
          sessionId: activeSession.sessionId,
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      const data = await response.json() as { reply: string; remaining: number };
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      setRemaining(data.remaining);
      if (data.remaining <= 2 && data.remaining > 0) {
        toast.warning(`${data.remaining} message${data.remaining === 1 ? '' : 's'} remaining in this session.`);
      } else if (data.remaining === 0) {
        toast.info('No chat messages remaining. Ask your facilitator for help.');
      }
    } catch {
      toast.error('Chat assistant unavailable. Try again in a moment.');
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, the assistant is unavailable right now. Try again in a moment.' },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, remaining, activeSession, blockId, stageNumber, scenarioBrief, firstUsed]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const exhausted = remaining <= 0;

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2 bg-blue-600 text-white rounded-full px-4 sm:px-5 py-3 shadow-lg hover:bg-blue-700 transition-all hover:shadow-xl active:scale-95"
          aria-label="Open learning assistant"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-semibold hidden sm:inline">Need help?</span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-[360px] max-h-[85vh] sm:max-h-[520px] bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl border border-slate-200 flex flex-col animate-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Learning Assistant</h3>
              <p className="text-xs text-slate-400">{remaining} message{remaining !== 1 ? 's' : ''} remaining</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-slate-700 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[200px] max-h-[50vh] sm:min-h-[240px] sm:max-h-[360px]">
            {messages.length === 0 && (
              <div className="text-center text-sm text-slate-400 mt-8">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p>Ask a question about this stage.</p>
                <p className="text-xs mt-1">I won't give you quiz answers, but I can help you learn!</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={clsx(
                  'max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'ml-auto bg-blue-600 text-white'
                    : 'mr-auto bg-slate-100 text-slate-800',
                )}
              >
                {msg.content}
              </div>
            ))}

            {loading && (
              <div className="mr-auto flex items-center gap-2 text-slate-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Thinking...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-100 px-4 py-3">
            {exhausted ? (
              <p className="text-xs text-center text-amber-600 font-medium">
                No messages remaining. Review the learning points or ask your facilitator.
              </p>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  maxLength={500}
                  placeholder="Type your question..."
                  disabled={loading}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

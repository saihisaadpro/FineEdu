import { Router, type Request, type Response } from 'express';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';
import { anthropic, MODELS, TOKEN_LIMITS, TIMEOUTS } from '../services/anthropic.js';
import { chatRequestSchema } from '../validation/schemas.js';
import { buildChatPrompt } from '../services/promptBuilder.js';
import { config } from '../config.js';
import { logger } from '../logger.js';

const router = Router();
const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY);
const MAX_MESSAGES_PER_SESSION = 10;

// IP-based rate limiter: 60 requests per 15 minutes
const ipLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait.' },
});

/** Distributed session message counter (Supabase — shared across Cloud Run instances) */
const getSessionMessageCount = async (sessionId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('chat_messages')
    .select('*', { count: 'exact', head: true })
    .eq('session_id', sessionId);
  if (error) {
    logger.error({ error }, 'Failed to count session messages');
    return 0;
  }
  return count ?? 0;
};

const recordChatMessage = async (sessionId: string): Promise<void> => {
  await supabase.from('chat_messages').insert({
    session_id: sessionId,
    created_at: new Date().toISOString(),
  });
};

router.post('/', ipLimiter, async (req: Request, res: Response): Promise<void> => {
  // 1. Validate request
  const parsed = chatRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ error: 'Invalid request', details: parsed.error.issues });
    return;
  }
  const { message, blockId, stageNumber, scenarioContext, userXPLevel, sessionId } = parsed.data;

  // 2. Per-session limit check (distributed via Supabase)
  const count = await getSessionMessageCount(sessionId);
  if (count >= MAX_MESSAGES_PER_SESSION) {
    res.status(429).json({
      reply: `You've used all ${MAX_MESSAGES_PER_SESSION} chat messages for this session. Try reviewing the learning points, or ask your facilitator for help.`,
      remaining: 0,
    });
    return;
  }

  // 3. Build stage-aware system prompt
  const systemPrompt = buildChatPrompt(blockId, stageNumber, scenarioContext, userXPLevel);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUTS.CHAT);

    const response = await anthropic.messages.create({
      model: MODELS.CHAT,
      max_tokens: TOKEN_LIMITS.CHAT,
      system: systemPrompt,
      messages: [{ role: 'user', content: message }],
    }, { signal: controller.signal });

    clearTimeout(timer);

    const reply = response.content[0].type === 'text'
      ? response.content[0].text
      : "Sorry, I couldn't generate a response. Try rephrasing your question.";

    // Record message count (fire-and-forget)
    recordChatMessage(sessionId).catch(err =>
      logger.warn({ err, sessionId }, 'Failed to record chat message count')
    );

    res.json({ reply, remaining: MAX_MESSAGES_PER_SESSION - count - 1 });

  } catch (error: unknown) {
    const err = error as Error;
    logger.error({ error: err.message, sessionId, model: MODELS.CHAT }, 'Haiku 4.5 chat failed');
    res.json({
      reply: 'Sorry, the learning assistant is temporarily unavailable. Try again in a moment, or ask your facilitator.',
      remaining: MAX_MESSAGES_PER_SESSION - count,
    });
  }
});

export default router;

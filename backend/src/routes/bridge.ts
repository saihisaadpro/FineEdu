import { Router, type Request, type Response } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { anthropic, MODELS, TIMEOUTS } from '../services/anthropic.js';
import { buildBridgePrompt } from '../services/promptBuilder.js';
import { logger } from '../logger.js';

const router = Router();

// IP-based rate limiter: 30 requests per 15 minutes (bridge narratives are infrequent)
const ipLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait.' },
});

const bridgeRequestSchema = z.object({
  blockId: z.enum(['accounting', 'investment', 'management', 'fintech']),
  fromStage: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  toStage: z.union([z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  previousScore: z.number().min(0).max(100),
  previousStageName: z.string().max(200),
  blockName: z.string().max(200),
});

const BLOCK_NAMES: Record<string, string> = {
  accounting: 'Accounting in Practice',
  investment: 'Future Security & Investment',
  management: 'Household Financial Management',
  fintech: 'Digital Finance & FinTech',
};

router.post('/', ipLimiter, async (req: Request, res: Response): Promise<void> => {
  const parsed = bridgeRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ error: 'Invalid request', details: parsed.error.issues });
    return;
  }

  const { blockId, fromStage, toStage, previousScore, previousStageName, blockName } = parsed.data;

  try {
    const systemPrompt = buildBridgePrompt(
      blockName || BLOCK_NAMES[blockId] || blockId,
      fromStage,
      toStage,
      previousScore,
      previousStageName,
    );

    const response = await anthropic.messages.create({
      model: MODELS.CHAT,
      max_tokens: 200,
      system: systemPrompt,
      messages: [{ role: 'user', content: 'Generate the bridge narrative.' }],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    const narrative = textBlock?.text?.trim() ?? '';

    if (!narrative || narrative.length < 20) {
      res.status(500).json({ error: 'Bridge generation produced empty result' });
      return;
    }

    res.json({ narrative });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error({ err, blockId, fromStage, toStage }, 'Bridge narrative generation failed');
    res.status(500).json({ error: 'Bridge generation failed', message });
  }
});

export default router;

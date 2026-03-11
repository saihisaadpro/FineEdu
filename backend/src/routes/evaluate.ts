import { Router, type Request, type Response } from 'express';
import { anthropic, MODELS, TOKEN_LIMITS, TIMEOUTS } from '../services/anthropic.js';
import { evaluateRequestSchema, evaluationOutputSchema } from '../validation/schemas.js';
import { buildEvaluationPrompt } from '../services/promptBuilder.js';
import { logger } from '../logger.js';

const router = Router();

router.post('/', async (req: Request, res: Response): Promise<void> => {
  // 1. Validate request
  const parsed = evaluateRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ error: 'Invalid request', details: parsed.error.issues });
    return;
  }
  const { blockId, freeText, rubric, scenarioContext } = parsed.data;

  // 2. Build evaluation prompt for Sonnet 4.6
  const systemPrompt = buildEvaluationPrompt(blockId, rubric, scenarioContext);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUTS.EVALUATION);

    const response = await anthropic.messages.create({
      model: MODELS.EVALUATION,
      max_tokens: TOKEN_LIMITS.EVALUATION,
      system: systemPrompt,
      messages: [{ role: 'user', content: `LEARNER'S RESPONSE:\n\n${freeText}` }],
    }, { signal: controller.signal });

    clearTimeout(timer);

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonText = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();
    const rawOutput: unknown = JSON.parse(jsonText);

    // Validate Sonnet 4.6 output against schema
    const validated = evaluationOutputSchema.safeParse(rawOutput);
    if (!validated.success) {
      logger.warn({ blockId, issues: validated.error.issues }, 'Sonnet 4.6 evaluation output failed schema validation');
      res.status(500).json({
        error: 'evaluation_unavailable',
        message: 'AI evaluation returned an unexpected format. Your response has been saved — a facilitator can review it manually.',
        fallbackAction: 'facilitator_review',
      });
      return;
    }

    logger.info({ blockId, passed: validated.data.passed, model: MODELS.EVALUATION }, 'Evaluation completed');
    res.json(validated.data);

  } catch (error: unknown) {
    const err = error as Error;
    logger.error({ error: err.message, blockId, model: MODELS.EVALUATION }, 'Sonnet 4.6 evaluation failed');
    res.status(500).json({
      error: 'evaluation_unavailable',
      message: 'AI evaluation is temporarily unavailable. Your response has been saved — a facilitator can review it manually.',
      fallbackAction: 'facilitator_review',
    });
  }
});

export default router;

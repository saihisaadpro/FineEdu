import { Router, type Request, type Response } from 'express';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';
import { anthropic, MODELS, TOKEN_LIMITS, TIMEOUTS } from '../services/anthropic.js';
import { generateRequestSchema, generatedScenarioOutputSchema } from '../validation/schemas.js';
import { buildGenerationPrompt } from '../services/promptBuilder.js';
import { getCachedScenario, cacheScenario } from '../services/cache.js';
import { config } from '../config.js';
import { logger } from '../logger.js';

const router = Router();
const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY);

// Rate limit: 1 generation per template per 60 seconds
const generationLimiter = rateLimit({
  windowMs: 60_000,
  max: 1,
  keyGenerator: (req: Request) => `gen:${(req.body as Record<string, unknown>)?.templateId ?? 'unknown'}`,
  message: { error: 'Generation in progress — please wait' },
});

const BLOCK_MAP: Record<string, string> = {
  acc: 'accounting', inv: 'investment', mgt: 'management', fin: 'fintech',
};

router.post('/', generationLimiter, async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();

  // 1. Validate request body
  const parsed = generateRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ error: 'Invalid request', details: parsed.error.issues });
    return;
  }
  const { templateId, variables, sessionContext, stageNumber } = parsed.data;

  // 2. Check generation cache (keyed by templateId + sorted variable hash)
  const cacheKey = `${templateId}:${JSON.stringify(variables, Object.keys(variables).sort())}`;
  const cached = await getCachedScenario(cacheKey);
  if (cached) {
    logger.info({ templateId, cacheHit: true }, 'Serving cached scenario');
    res.json({ ...(cached as object), instanceId: crypto.randomUUID() });
    return;
  }

  // 3. Build the three-part generation prompt
  const systemPrompt = buildGenerationPrompt(templateId, variables, sessionContext);

  // 4. Call Claude Haiku 4.5 with retry (2 attempts: 10s → 15s timeout)
  for (let attempt = 0; attempt < 2; attempt++) {
    const timeoutMs = attempt === 0 ? TIMEOUTS.GENERATION_FIRST : TIMEOUTS.GENERATION_RETRY;

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const response = await anthropic.messages.create({
        model: MODELS.GENERATION,
        max_tokens: TOKEN_LIMITS.GENERATION,
        system: systemPrompt,
        messages: [{ role: 'user', content: 'Generate the scenario now. Output ONLY valid JSON — no markdown fences, no commentary.' }],
      }, { signal: controller.signal });

      clearTimeout(timer);

      // 5. Extract text content
      const text = response.content[0].type === 'text' ? response.content[0].text : null;
      if (!text) {
        logger.warn({ templateId, attempt }, 'Empty response from Haiku 4.5');
        if (attempt === 0) continue;
        res.status(500).json({ error: 'Empty response — use fallback' });
        return;
      }

      // 6. Strip markdown code fences if present
      const jsonText = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();

      // 7. Parse JSON
      let rawOutput: unknown;
      try {
        rawOutput = JSON.parse(jsonText);
      } catch {
        logger.warn({ templateId, attempt, textLength: text.length }, 'Haiku 4.5 returned invalid JSON');
        if (attempt === 0) continue;
        res.status(500).json({ error: 'Invalid JSON — use fallback' });
        return;
      }

      // 8. Validate against output schema
      const validated = generatedScenarioOutputSchema.safeParse(rawOutput);
      if (!validated.success) {
        logger.warn({ templateId, attempt, issues: validated.error.issues }, 'Haiku 4.5 output failed schema validation');
        if (attempt === 0) continue;
        res.status(500).json({ error: 'Schema validation failed — use fallback' });
        return;
      }

      // 9. Build the full GeneratedScenario response
      const prefix = templateId.split('_stage_')[0];
      const scenario = {
        instanceId: crypto.randomUUID(),
        templateId,
        blockId: BLOCK_MAP[prefix] ?? prefix,
        stageNumber,
        scenarioBrief: validated.data.scenario_brief,
        taskData: validated.data.task_data,
        questions: validated.data.questions,
        bridgeText: validated.data.bridge_text,
        variablesUsed: variables,
        generatedAt: new Date().toISOString(),
        isStatic: false,
      };

      // 10. Cache and record metrics
      await cacheScenario(cacheKey, scenario);
      const latencyMs = Date.now() - startTime;

      await recordMetrics(templateId, latencyMs, true, null, false).catch(() => {});

      logger.info({ templateId, attempt, latencyMs, model: MODELS.GENERATION }, 'Generation succeeded');
      res.json(scenario);
      return;

    } catch (error: unknown) {
      const err = error as Error & { name?: string };
      const isAbort = err.name === 'AbortError';
      const latencyMs = Date.now() - startTime;
      logger.error({ templateId, attempt, timeout: isAbort, latencyMs, error: err.message }, 'Generation attempt failed');

      if (attempt === 0) continue;

      await recordMetrics(templateId, latencyMs, false, isAbort ? 'timeout' : 'api_error', false).catch(() => {});

      res.status(isAbort ? 503 : 500).json({ error: 'Generation failed — use fallback' });
      return;
    }
  }
});

/** Record generation metrics for quality monitoring */
async function recordMetrics(
  templateId: string,
  latencyMs: number,
  success: boolean,
  failureReason: string | null,
  cacheHit: boolean,
): Promise<void> {
  await supabase.from('generation_metrics').insert({
    template_id: templateId,
    prompt_version: config.PROMPT_VERSION,
    model: MODELS.GENERATION,
    latency_ms: latencyMs,
    success,
    failure_reason: failureReason,
    cache_hit: cacheHit,
  });
}

export default router;

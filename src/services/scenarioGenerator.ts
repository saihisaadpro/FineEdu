import type { ScenarioTemplate, VariablePool, GeneratedScenario, BlockSession } from '@/types/content';

/**
 * Draw one random value per parameter from the variable pool.
 */
const drawVariables = (pool: VariablePool): Record<string, string> => {
  const drawn: Record<string, string> = {};
  for (const param of pool.parameters) {
    const randomIndex = Math.floor(Math.random() * param.values.length);
    drawn[param.name] = String(param.values[randomIndex].value);
  }
  return drawn;
};

/**
 * Build the generation prompt by interpolating drawn variables into the template skeleton.
 */
const buildGenerationPrompt = (
  template: ScenarioTemplate,
  drawnVariables: Record<string, string>,
  blockSession: BlockSession,
): string => {
  let prompt = template.promptSkeleton;
  for (const [key, value] of Object.entries(drawnVariables)) {
    prompt = prompt.replaceAll(`{{${key}}}`, value);
  }

  const sessionContext = blockSession.generatedContext;
  if (Object.keys(sessionContext).length > 0) {
    prompt += `\n\nContext from previous stages:\n${JSON.stringify(sessionContext, null, 2)}`;
  }

  return prompt;
};

/**
 * Basic schema validation for a generated scenario.
 */
const validateScenarioSchema = (scenario: unknown): scenario is GeneratedScenario => {
  if (!scenario || typeof scenario !== 'object') return false;
  const s = scenario as Record<string, unknown>;
  return (
    typeof s.instanceId === 'string' &&
    typeof s.templateId === 'string' &&
    typeof s.scenarioBrief === 'string' &&
    typeof s.taskData === 'object' &&
    Array.isArray(s.questions) &&
    s.questions.length > 0 &&
    typeof s.bridgeText === 'string'
  );
};

/**
 * Generate a scenario by calling the backend AI endpoint.
 * Falls back to the static hand-authored scenario if generation fails.
 */
export const generateScenario = async (
  template: ScenarioTemplate,
  variablePool: VariablePool,
  blockSession: BlockSession,
  fallback: GeneratedScenario,
): Promise<GeneratedScenario> => {
  const drawnVariables = drawVariables(variablePool);
  // Prompt is sent to the backend for generation context
  const _prompt = buildGenerationPrompt(template, drawnVariables, blockSession);

  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) {
    // No backend configured — use fallback immediately
    return fallback;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const response = await fetch(`${apiUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId: template.templateId,
        variables: drawnVariables,
        sessionContext: blockSession.generatedContext,
        stageNumber: template.stageNumber,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) throw new Error(`Generation failed: ${response.status}`);

    const generated: unknown = await response.json();

    if (!validateScenarioSchema(generated)) {
      console.warn('Generated scenario failed schema validation, using fallback');
      return fallback;
    }

    return generated;
  } catch (error) {
    // Retry once with a longer timeout
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15_000);

      const response = await fetch(`${apiUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: template.templateId,
          variables: drawnVariables,
          sessionContext: blockSession.generatedContext,
          stageNumber: template.stageNumber,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) throw new Error(`Retry failed: ${response.status}`);

      const generated: unknown = await response.json();

      if (!validateScenarioSchema(generated)) {
        console.warn('Retry: scenario failed validation, using fallback');
        return fallback;
      }

      return generated;
    } catch {
      console.error('Scenario generation failed after retry, using fallback:', error);
      return fallback;
    }
  }
};

import { GoogleGenAI, GenerateContentParameters, GenerateContentResponse, ThinkingLevel } from '@google/genai';

/**
 * Resilient Gemini Content Generation with automated fallback
 * Handles temporary spikes/503s on gemini-3.8-flash by falling back to gemini-flash-latest,
 * and sets ThinkingLevel.LOW for responsive sub-3s latency.
 */
export async function generateGeminiContentWithFallback(
  ai: GoogleGenAI,
  options: {
    contents: GenerateContentParameters['contents'];
    config?: GenerateContentParameters['config'];
    preferredModel?: string;
    fallbackModel?: string;
    timeoutMs?: number;
  }
): Promise<GenerateContentResponse> {
  const models = options.preferredModel
    ? [options.preferredModel, options.fallbackModel || 'gemini-3.1-flash-lite', 'gemini-flash-latest']
    : ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

  const timeoutMs = options.timeoutMs || 18000;
  let lastError: any = null;

  for (const model of models) {
    let timerId: NodeJS.Timeout | null = null;
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        timerId = setTimeout(() => reject(new Error(`LLM call timeout after ${timeoutMs}ms on ${model}`)), timeoutMs);
      });

      const mergedConfig: any = {
        ...options.config
      };
      if (model.startsWith('gemini-3')) {
        mergedConfig.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
      }

      const generatePromise = ai.models.generateContent({
        model,
        contents: options.contents,
        config: mergedConfig
      });

      let response: GenerateContentResponse;
      try {
        response = await Promise.race([generatePromise, timeoutPromise]);
      } finally {
        if (timerId) clearTimeout(timerId);
      }

      return response;
    } catch (err: any) {
      lastError = err;
      // Try the next candidate model
      continue;
    }
  }

  throw lastError || new Error('All Gemini model candidates failed');
}

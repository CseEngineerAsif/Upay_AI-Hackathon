import { GoogleGenAI } from '@google/genai';
import { generateGeminiContentWithFallback } from './geminiHelper';
import { UserHabitsInput, BundleOptimizationResult, OperatorPack } from '../src/types/bundleOptimizer';
import { MOCK_OPERATOR_PACKS, getClientFallbackRecommendation } from '../src/utils/bundleOptimizerManager';

export async function generateBundleRecommendationAi(
  aiClient: GoogleGenAI | null,
  habits: UserHabitsInput
): Promise<BundleOptimizationResult> {
  const fallback = getClientFallbackRecommendation(habits);

  if (!aiClient) {
    return fallback;
  }

  try {
    const operatorPacks = MOCK_OPERATOR_PACKS.filter((p) => p.operator === habits.operator);
    const candidatePacks = operatorPacks.length > 0 ? operatorPacks : MOCK_OPERATOR_PACKS;

    const prompt = `
You are an expert telecom tariff & mobile recharge savings AI for Bangladesh mobile users (Grameenphone, Robi, Banglalink, Airtel, Teletalk).

User's Monthly Usage Habits:
- Operator: ${habits.operator.toUpperCase()}
- Monthly Data Needed: ${habits.monthlyDataGB} GB
- Monthly Voice Minutes Needed: ${habits.monthlyMinutes} Minutes
- Monthly SMS: ${habits.monthlySms}

Available Packs for this Operator:
${JSON.stringify(candidatePacks, null, 2)}

Instructions:
1. Select the lowest-cost, best-fit pack that comfortably covers user's needs without unnecessary overspending.
2. Calculate estimated monthly savings in BDT compared to buying separate data/talktime cards.
3. Write a crisp, friendly, natural Bangla explanation (2-3 sentences) explaining specifically why this pack is the cheapest and ideal for this user.

Respond in strict JSON format:
{
  "recommendedPackId": "${candidatePacks[0].id}",
  "monthlySavingsEstimate": 180,
  "banglaExplanation": "আপনার মাসিক ব্যবহারের জন্য..."
}
`;

    const response = await generateGeminiContentWithFallback(aiClient, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || '';
    const parsed = JSON.parse(text);

    const recommended = candidatePacks.find((p) => p.id === parsed.recommendedPackId) || fallback.recommendedPack;

    return {
      recommendedPack: recommended,
      monthlySavingsEstimate: Number(parsed.monthlySavingsEstimate) || fallback.monthlySavingsEstimate,
      banglaExplanation: parsed.banglaExplanation || fallback.banglaExplanation,
      alternativePacks: candidatePacks.filter((p) => p.id !== recommended.id).slice(0, 2),
      isAiGenerated: true
    };
  } catch (err) {
    console.warn('Gemini bundle optimization error, falling back:', err);
    return fallback;
  }
}

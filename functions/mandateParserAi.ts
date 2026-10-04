import { GoogleGenAI } from '@google/genai';
import { generateGeminiContentWithFallback } from './geminiHelper';
import { ParsedMandateRule } from '../src/types/mandateWallet';
import { parseInstructionHeuristic } from '../src/utils/mandateWalletEngine';

export async function parseMandateInstructionWithGemini(
  aiClient: GoogleGenAI | null,
  instruction: string
): Promise<ParsedMandateRule> {
  const fallback = parseInstructionHeuristic(instruction);

  if (!aiClient || !instruction.trim()) {
    return fallback;
  }

  try {
    const prompt = `
You are an AI Payment Mandate parser for a mobile wallet in Bangladesh.
The user provides a natural language instruction in Bengali or English for an automatic payment permission rule.
CRITICAL INSTRUCTION: You ONLY parse the text into a structured mandate rule. You MUST NOT execute any payment.

User Instruction: "${instruction}"

Extract the following JSON fields:
- billerNameBn: Name of the biller / utility / recipient in Bengali (e.g. "তিতাস গ্যাস", "ডেসকো বিদ্যুৎ", "কার্নিভাল ইন্টারনেট", "মা")
- billerCategory: "utility" | "internet" | "family" | "subscription" | "other"
- conditionBn: A concise condition in Bengali (e.g. "বিলের পরিমাণ সর্বোচ্চ ১৫০০ টাকার নিচে বা সমান হলে")
- maxAmount: Number representing the hard ceiling limit in BDT (e.g. 1500)
- frequency: "monthly" | "weekly" | "daily" | "one_time"
- frequencyBn: Frequency in Bengali (e.g. "প্রতি মাসে (Monthly)")
- startDate: Start date/day in Bengali (e.g. "চলতি মাসের ১লা তারিখ থেকে")
- explanationBn: A 1-2 sentence Bengali explanation of this mandate rule and its spending ceiling.

Strict JSON format only:
{
  "billerNameBn": "তিতাস গ্যাস (Titas Gas)",
  "billerCategory": "utility",
  "conditionBn": "বিলের পরিমাণ সর্বোচ্চ ১৫০০ টাকার নিচে বা সমান হলে",
  "maxAmount": 1500,
  "frequency": "monthly",
  "frequencyBn": "প্রতি মাসে (Monthly)",
  "startDate": "১লা তারিখ থেকে কার্যকর",
  "explanationBn": "তিতাস গ্যাস বিলের জন্য প্রতি মাসে সর্বোচ্চ ১৫০০ টাকা পর্যন্ত স্বয়ংক্রিয় পরিশোধের ম্যান্ডেট।"
}
`;

    const response = await generateGeminiContentWithFallback(aiClient, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      billerNameBn: parsed.billerNameBn || fallback.billerNameBn,
      billerCategory: parsed.billerCategory || fallback.billerCategory,
      conditionBn: parsed.conditionBn || fallback.conditionBn,
      maxAmount: Number(parsed.maxAmount) || fallback.maxAmount,
      frequency: parsed.frequency || fallback.frequency,
      frequencyBn: parsed.frequencyBn || fallback.frequencyBn,
      startDate: parsed.startDate || fallback.startDate,
      explanationBn: parsed.explanationBn || fallback.explanationBn,
      isAiParsed: true
    };
  } catch (err) {
    console.warn('Gemini mandate parsing error, using fallback:', err);
    return fallback;
  }
}

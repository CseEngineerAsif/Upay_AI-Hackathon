import { GoogleGenAI } from '@google/genai';
import { DialectVoiceIntent } from '../src/types/dialectVoice';
import { parseDialectHeuristic } from '../src/utils/dialectVoiceManager';

export async function normalizeDialectWithGemini(
  aiClient: GoogleGenAI | null,
  spokenText: string
): Promise<DialectVoiceIntent> {
  const fallback = parseDialectHeuristic(spokenText);

  if (!aiClient || !spokenText.trim()) {
    return fallback;
  }

  try {
    const prompt = `
You are a Bangladesh regional dialect specialist and NLP parser for financial voice commands.
Input Spoken Command in Bengali (could be Standard Bangla, Chattogram, Sylhet, Noakhali, or Rangpur dialect):
"${spokenText}"

Task:
1. Identify the dialect region: "standard", "chattogram", "sylhet", "noakhali", or "rangpur".
2. Extract the intent:
   - action: "send_money", "cash_out", or "mobile_recharge"
   - recipientName: name of the person or entity
   - amount: number in BDT (e.g. 500, 1000, 250)
3. Generate normalized standard Bengali sentence (e.g., "রহিমকে ৫০০ টাকা সেন্ড মানি করা হবে").

Respond in strict JSON format:
{
  "detectedDialect": "chattogram",
  "detectedDialectBn": "চাটগাঁইয়া (Chattogram)",
  "action": "send_money",
  "actionBn": "সেন্ড মানি (Send Money)",
  "recipientName": "রহিম",
  "amount": 500,
  "normalizedSentenceBn": "রহিমকে ৫০০ টাকা পাঠানো হবে",
  "confidenceScore": 0.98
}
`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      rawSpokenText: spokenText,
      detectedDialect: parsed.detectedDialect || fallback.detectedDialect,
      detectedDialectBn: parsed.detectedDialectBn || fallback.detectedDialectBn,
      action: parsed.action || fallback.action,
      actionBn: parsed.actionBn || fallback.actionBn,
      recipientName: parsed.recipientName || fallback.recipientName,
      amount: Number(parsed.amount) || fallback.amount,
      normalizedSentenceBn: parsed.normalizedSentenceBn || fallback.normalizedSentenceBn,
      confidenceScore: Number(parsed.confidenceScore) || 0.95,
      isAiParsed: true
    };
  } catch (err) {
    console.warn('Gemini dialect normalization error, using fallback:', err);
    return fallback;
  }
}

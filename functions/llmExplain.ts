import { GoogleGenAI, Type } from '@google/genai';
import { z } from 'zod';
import { RiskRuleSignal } from '../src/types';

// Zod schema for validation
export const RiskExplanationSchema = z.object({
  explanationBn: z.string().min(10),
  explanationEn: z.string().min(10),
  actionAdviceBn: z.string().min(5),
  actionAdviceEn: z.string().min(5)
});

export type RiskExplanation = z.infer<typeof RiskExplanationSchema>;

// Mask personal phone numbers (e.g., 01794809461 -> 017***461)
export function maskPhoneNumber(phone?: string): string {
  if (!phone) return '01X***XXXX';
  const clean = phone.replace(/[\s-]/g, '');
  if (clean.length < 8) return '01X***';
  return clean.slice(0, 3) + '***' + clean.slice(-3);
}

// Mask personal names (e.g., MD. AL-MAYNUL HASAN -> M*** H***)
export function maskName(name?: string): string {
  if (!name) return 'গ্রাহক';
  const parts = name.trim().split(/\s+/);
  return parts.map(p => (p.length > 1 ? p[0] + '***' : p)).join(' ');
}

// Prompt Injection Sanitizer
export function sanitizeUserText(text?: string): string {
  if (!text) return '';
  return text
    .replace(/[<>{}[\]\\]/g, ' ')
    .replace(/(system prompt|ignore previous|delete all|eval\(|drop table|api_key)/gi, '[REDACTED]')
    .slice(0, 150);
}

// Fallback templates if Gemini is unavailable or validation fails
export function getFallbackExplanation(
  riskLevel: 'low' | 'medium' | 'high',
  signals: RiskRuleSignal[],
  amount: number
): RiskExplanation {
  if (riskLevel === 'high') {
    return {
      explanationBn: `এই লেনদেনে উচ্চ ঝুঁকি পাওয়া গেছে। টাকার পরিমাণ (৳${amount.toLocaleString()}) স্বাভাবিকের চেয়ে অনেক বেশি অথবা এটি একটি নতুন/সন্দেহজনক প্রাপক নম্বর। প্রতারকরা অনেক সময় জরুরি বা লটারির অজুহাতে দ্রুত টাকা পাঠাতে চাপ দেয়।`,
      explanationEn: `High risk detected. The transaction amount (৳${amount.toLocaleString()}) deviates heavily from your normal baseline, or the recipient is unverified. Fraudsters frequently urge immediate transfers using fabricated emergencies.`,
      actionAdviceBn: `পিন দেওয়ার আগে প্রাপকের সাথে সরাসরি ফোনে কথা বলুন। প্রয়োজনে প্রথমে ৳১০ টেস্ট পেমেন্ট পাঠিয়ে নিশ্চিত হোন। সম্পূর্ণ যাচাই না করে টাকা পাঠাবেন না।`,
      actionAdviceEn: `Call the recipient directly before entering your PIN. Consider sending a ৳10 test payment first. Never proceed under pressure.`
    };
  }

  if (riskLevel === 'medium') {
    return {
      explanationBn: `লেনদেনে মাঝারি মাত্রার ঝুঁকি পরিলক্ষিত হয়েছে। প্রাপকটি আপনার জন্য নতুন বা লেনদেনের সময়/পরিমাণে কিছু ব্যতিক্রম লক্ষ্য করা গেছে।`,
      explanationEn: `Moderate risk signals detected. The recipient is new to your account, or the transaction deviates slightly from your normal pattern.`,
      actionAdviceBn: `প্রাপকের নম্বর এবং পাঠানো টাকার অংক পুনরায় মিলিয়ে নিন। কোনো প্রলোভন বা অযাচিত কলের প্রেক্ষিতে টাকা পাঠাচ্ছেন না তো?`,
      actionAdviceEn: `Double-check the recipient number and amount. Ensure this payment was not triggered by an unverified phone call or prize claim.`
    };
  }

  return {
    explanationBn: `লেনদেনটি আপনার নিয়মিত লেনদেন প্যাটার্নের সাথে সামঞ্জস্যপূর্ণ। কোনো অস্বাভাবিক ঝুঁকি পাওয়া যায়নি।`,
    explanationEn: `This transaction aligns well with your verified spending baseline. No significant anomalies were detected.`,
    actionAdviceBn: `আপনার পিন সবসময় গোপন রাখুন। নিরাপদে পিন প্রদান করে লেনদেন সম্পন্ন করুন।`,
    actionAdviceEn: `Always keep your PIN confidential. Proceed safely to complete the transaction.`
  };
}

export async function generateLlmRiskExplanation(params: {
  maskedRecipient: string;
  maskedRecipientName?: string;
  amount: number;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  signals: RiskRuleSignal[];
  sanitizedNote?: string;
}): Promise<RiskExplanation> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return getFallbackExplanation(params.riskLevel, params.signals, params.amount);
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const signalSummary = params.signals
      .map(s => `- [${s.rule}] ${s.labelBn} (${s.points} pts): ${s.detailsBn}`)
      .join('\n');

    const prompt = `You are "Upay Safe AI", a trusted financial guardian for a Bangladeshi mobile financial service (MFS).
Analyze the structured risk evidence below and produce a clear, warm, plain-language Bangla warning and advice for the user, plus an English translation.
REMEMBER: YOU NEVER BLOCK OR APPROVE TRANSACTIONS. The human user always makes the final decision. You only advise objectively.

Structured Evidence:
- Risk Score: ${params.riskScore} / 100 (${params.riskLevel.toUpperCase()})
- Amount: BDT ${params.amount}
- Masked Recipient: ${params.maskedRecipient} (${params.maskedRecipientName || 'Unknown'})
- Sanitized Note: "${params.sanitizedNote || 'None'}"
- Triggered Signals:
${signalSummary}

Return STRICT JSON matching the schema:
{
  "explanationBn": "Short, clear Bangla explanation (2-3 sentences) why this transaction was flagged or why it is safe.",
  "explanationEn": "Short, clear English equivalent explanation.",
  "actionAdviceBn": "Concrete, actionable safety advice in Bengali (e.g., call recipient, test payment 10 tk, verify offline).",
  "actionAdviceEn": "Concrete, actionable safety advice in English."
}`;

    // Add a 5-second timeout to prevent hanging on slow connections
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('LLM call timeout')), 5000)
    );

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanationBn: { type: Type.STRING },
            explanationEn: { type: Type.STRING },
            actionAdviceBn: { type: Type.STRING },
            actionAdviceEn: { type: Type.STRING }
          },
          required: ['explanationBn', 'explanationEn', 'actionAdviceBn', 'actionAdviceEn']
        }
      }
    });

    const response = await Promise.race([generatePromise, timeoutPromise]);

    const rawText = response.text?.trim() || '';
    const parsed = JSON.parse(rawText);
    const validated = RiskExplanationSchema.parse(parsed);
    return validated;
  } catch (err) {
    console.warn('Gemini risk explanation fallback invoked:', err);
    return getFallbackExplanation(params.riskLevel, params.signals, params.amount);
  }
}

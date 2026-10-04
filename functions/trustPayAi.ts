import { GoogleGenAI } from '@google/genai';
import { generateGeminiContentWithFallback } from './geminiHelper';

export interface SellerProfileInput {
  sellerName: string;
  sellerPhone: string;
  fCommercePage?: string;
  totalOrders: number;
  successfulDeliveries: number;
  disputeCount: number;
  averageDeliveryDays: number;
  customerRating: number; // 1-5
  accountAgeMonths: number;
}

export interface SellerTrustResult {
  trustLevel: 'high' | 'medium' | 'caution';
  trustScore: number; // 0-100
  badgeTitleBn: string;
  badgeTitleEn: string;
  explanationBn: string;
  explanationEn: string;
  riskWarningBn?: string;
  riskWarningEn?: string;
  keySignals: {
    labelBn: string;
    labelEn: string;
    status: 'positive' | 'neutral' | 'negative';
  }[];
}

export async function analyzeSellerTrustAi(
  aiClient: GoogleGenAI | null,
  profile: SellerProfileInput
): Promise<SellerTrustResult> {
  const {
    sellerName,
    totalOrders,
    successfulDeliveries,
    disputeCount,
    averageDeliveryDays,
    customerRating,
    accountAgeMonths
  } = profile;

  const successRate = totalOrders > 0 ? (successfulDeliveries / totalOrders) * 100 : 80;
  const disputeRate = totalOrders > 0 ? (disputeCount / totalOrders) * 100 : 0;

  // Local rule-based baseline determination
  let defaultLevel: 'high' | 'medium' | 'caution' = 'medium';
  let defaultScore = 75;

  if (totalOrders >= 50 && successRate >= 95 && disputeRate <= 2 && accountAgeMonths >= 6) {
    defaultLevel = 'high';
    defaultScore = 95;
  } else if (disputeRate >= 15 || (totalOrders < 10 && disputeCount >= 1) || customerRating < 3.2) {
    defaultLevel = 'caution';
    defaultScore = 42;
  } else {
    defaultLevel = 'medium';
    defaultScore = 78;
  }

  const fallbackResult: SellerTrustResult = {
    trustLevel: defaultLevel,
    trustScore: defaultScore,
    badgeTitleBn:
      defaultLevel === 'high'
        ? 'সবুজ ভেরিফাইড (উচ্চ বিশ্বস্ত)'
        : defaultLevel === 'medium'
        ? 'হলুদ ব্যাজ (মধ্যম বিশ্বস্ত)'
        : 'লাল সতর্কতা (উচ্চ ঝুঁকি)',
    badgeTitleEn:
      defaultLevel === 'high'
        ? 'High Trust Seller'
        : defaultLevel === 'medium'
        ? 'Moderate Trust Seller'
        : 'Caution / High Risk',
    explanationBn:
      defaultLevel === 'high'
        ? `এই বিক্রেতার ${totalOrders}টি অর্ডারের মধ্যে ৯৫%+ সফল ডেলিভারির ট্র্যাক রেকর্ড রয়েছে। ডিসপ্যুট রেট অত্যন্ত কম এবং গড় ডেলিভারি সময় ${averageDeliveryDays} দিন।`
        : defaultLevel === 'medium'
        ? `বিক্রেতার অ্যাকাউন্টের বয়স ${accountAgeMonths} মাস এবং অর্ডার ইতিহাস সন্তোষজনক। তবে পণ্য হাতে পাওয়ার পর টাকা ছাড়ার পরামর্শ দেওয়া হচ্ছে।`
        : `সতর্কতা: এই পেজ বা নম্বরে ${disputeCount}টি ডিসপ্যুট অভিযোগ পাওয়া গেছে। কোনো অবস্থাতেই পণ্য বুঝে পাওয়ার আগে সরাসরি অগ্রিম টাকা পাঠাবেন না।`,
    explanationEn:
      defaultLevel === 'high'
        ? `Verified seller with over 95% completion rate across ${totalOrders} orders. Low dispute frequency.`
        : defaultLevel === 'medium'
        ? `Moderate transaction volume. Buyer confirmation required before escrow release.`
        : `High risk detected due to unfulfilled deliveries or dispute complaints. Use TrustPay escrow hold strictly.`,
    riskWarningBn:
      defaultLevel === 'caution'
        ? 'অগ্রিম সম্পূর্ণ পেমেন্ট করার ঝুঁকি রয়েছে। ডেলিভারি পাওয়ার পরেই কেবল টাকা রিলিজ করুন।'
        : undefined,
    riskWarningEn:
      defaultLevel === 'caution'
        ? 'High risk of advance payment fraud. Never release funds until package is inspected.'
        : undefined,
    keySignals: [
      {
        labelBn: `সফল ডেলিভারি: ${successfulDeliveries}/${totalOrders} টি`,
        labelEn: `Successful deliveries: ${successfulDeliveries}/${totalOrders}`,
        status: successRate >= 90 ? 'positive' : successRate >= 75 ? 'neutral' : 'negative'
      },
      {
        labelBn: `অভিযোগ/ডিসপ্যুট: ${disputeCount} টি`,
        labelEn: `Disputes: ${disputeCount}`,
        status: disputeCount === 0 ? 'positive' : disputeCount <= 2 ? 'neutral' : 'negative'
      },
      {
        labelBn: `গড় ডেলিভারি সময়: ${averageDeliveryDays} দিন`,
        labelEn: `Avg delivery time: ${averageDeliveryDays} days`,
        status: averageDeliveryDays <= 3 ? 'positive' : 'neutral'
      }
    ]
  };

  if (!aiClient) {
    return fallbackResult;
  }

  try {
    const prompt = `You are Upay Safe AI's TrustPay F-Commerce Risk Engine in Bangladesh.
Evaluate this Facebook / Instagram (F-commerce) online seller profile:
- Seller / Page: "${sellerName}"
- Total Historical Orders: ${totalOrders}
- Successful Deliveries: ${successfulDeliveries}
- Customer Disputes / Complaints: ${disputeCount}
- Average Delivery Time: ${averageDeliveryDays} days
- Customer Rating: ${customerRating} / 5.0
- Account Active Duration: ${accountAgeMonths} months

Requirements:
1. Determine trustLevel: "high" | "medium" | "caution"
2. Calculate trustScore (0-100)
3. Provide concise Bangla badge title and 2-sentence explanation of reasons in Bengali and English.
4. If caution, provide a risk warning advising buyer against direct advance payments.
5. Return JSON strictly matching:
{
  "trustLevel": "high" | "medium" | "caution",
  "trustScore": number,
  "badgeTitleBn": string,
  "badgeTitleEn": string,
  "explanationBn": string,
  "explanationEn": string,
  "riskWarningBn": string,
  "riskWarningEn": string
}`;

    const response = await generateGeminiContentWithFallback(aiClient, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const raw = response.text?.trim() || '';
    const clean = raw.replace(/^```json/i, '').replace(/```$/i, '').trim();
    const parsed = JSON.parse(clean);

    return {
      ...fallbackResult,
      trustLevel: parsed.trustLevel || fallbackResult.trustLevel,
      trustScore: parsed.trustScore || fallbackResult.trustScore,
      badgeTitleBn: parsed.badgeTitleBn || fallbackResult.badgeTitleBn,
      badgeTitleEn: parsed.badgeTitleEn || fallbackResult.badgeTitleEn,
      explanationBn: parsed.explanationBn || fallbackResult.explanationBn,
      explanationEn: parsed.explanationEn || fallbackResult.explanationEn,
      riskWarningBn: parsed.riskWarningBn || fallbackResult.riskWarningBn,
      riskWarningEn: parsed.riskWarningEn || fallbackResult.riskWarningEn
    };
  } catch (err) {
    console.warn('AI seller trust analysis fallback triggered:', err);
    return fallbackResult;
  }
}

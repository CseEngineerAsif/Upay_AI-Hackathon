import {
  OperatorPack,
  OperatorType,
  UserHabitsInput,
  BundleOptimizationResult,
  ActivePackTracker
} from '../types/bundleOptimizer';

export const MOCK_OPERATOR_PACKS: OperatorPack[] = [
  // Grameenphone
  {
    id: 'gp_monthly_30gb',
    operator: 'gp',
    operatorNameBn: 'গ্রামীণফোন (GP)',
    nameBn: 'জিপি অল-ইন-ওয়ান মান্থলি ৩০ জিবি',
    price: 499,
    validityDays: 30,
    dataGB: 30,
    voiceMinutes: 450,
    smsCount: 100,
    tagBn: 'বেস্টসেলার',
    badgeColor: 'bg-sky-600 text-white'
  },
  {
    id: 'gp_monthly_15gb',
    operator: 'gp',
    operatorNameBn: 'গ্রামীণফোন (GP)',
    nameBn: 'জিপি রেগুলার মান্থলি ১৫ জিবি',
    price: 349,
    validityDays: 30,
    dataGB: 15,
    voiceMinutes: 250,
    smsCount: 50,
    tagBn: 'সাশ্রয়ী',
    badgeColor: 'bg-slate-700 text-white'
  },
  {
    id: 'gp_heavy_50gb',
    operator: 'gp',
    operatorNameBn: 'গ্রামীণফোন (GP)',
    nameBn: 'জিপি প্রো আনলিমিটেড ৫০ জিবি',
    price: 699,
    validityDays: 30,
    dataGB: 50,
    voiceMinutes: 800,
    smsCount: 200,
    tagBn: 'পাওয়ার ইউজার',
    badgeColor: 'bg-indigo-700 text-white'
  },

  // Robi
  {
    id: 'robi_combo_25gb',
    operator: 'robi',
    operatorNameBn: 'রবি (Robi)',
    nameBn: 'রবি সুপার কম্বো ২৫ জিবি',
    price: 429,
    validityDays: 30,
    dataGB: 25,
    voiceMinutes: 350,
    smsCount: 100,
    tagBn: 'সেরা মান',
    badgeColor: 'bg-rose-600 text-white'
  },
  {
    id: 'robi_voice_focus',
    operator: 'robi',
    operatorNameBn: 'রবি (Robi)',
    nameBn: 'রবি টকটাইম কিং ১০ জিবি + ৫০০ মিনিট',
    price: 399,
    validityDays: 30,
    dataGB: 10,
    voiceMinutes: 500,
    smsCount: 100,
    tagBn: 'কলিং স্পেশাল',
    badgeColor: 'bg-rose-700 text-white'
  },
  {
    id: 'robi_max_45gb',
    operator: 'robi',
    operatorNameBn: 'রবি (Robi)',
    nameBn: 'রবি আল্ট্রা ৪৫ জিবি মেগা প্যাক',
    price: 599,
    validityDays: 30,
    dataGB: 45,
    voiceMinutes: 600,
    smsCount: 150,
    tagBn: 'হেভি প্যাক',
    badgeColor: 'bg-purple-700 text-white'
  },

  // Banglalink
  {
    id: 'bl_power_20gb',
    operator: 'banglalink',
    operatorNameBn: 'বাংলালিংক (Banglalink)',
    nameBn: 'বাংলালিংক পাওয়ার বান্ডেল ২০ জিবি',
    price: 389,
    validityDays: 30,
    dataGB: 20,
    voiceMinutes: 300,
    smsCount: 50,
    tagBn: 'বাজেট প্যাক',
    badgeColor: 'bg-amber-600 text-white'
  },
  {
    id: 'bl_smart_35gb',
    operator: 'banglalink',
    operatorNameBn: 'বাংলালিংক (Banglalink)',
    nameBn: 'বাংলালিংক স্মার্ট প্লাস ৩৫ জিবি',
    price: 469,
    validityDays: 30,
    dataGB: 35,
    voiceMinutes: 400,
    smsCount: 100,
    tagBn: 'জনপ্রিয়',
    badgeColor: 'bg-amber-700 text-white'
  },

  // Airtel
  {
    id: 'airtel_vibe_30gb',
    operator: 'airtel',
    operatorNameBn: 'এয়ারটেল (Airtel)',
    nameBn: 'এয়ারটেল ভাইব ৩০ জিবি মেগা কম্বো',
    price: 449,
    validityDays: 30,
    dataGB: 30,
    voiceMinutes: 500,
    smsCount: 150,
    tagBn: 'তারুণ্যের প্যাক',
    badgeColor: 'bg-red-600 text-white'
  },

  // Teletalk
  {
    id: 'teletalk_shadhin_35gb',
    operator: 'teletalk',
    operatorNameBn: 'টেলিটক (Teletalk)',
    nameBn: 'টেলিটক বর্ণমালা/স্বাধীনতা ৩৫ জিবি',
    price: 340,
    validityDays: 30,
    dataGB: 35,
    voiceMinutes: 200,
    smsCount: 100,
    tagBn: 'সর্বোচ্চ সাশ্রয়',
    badgeColor: 'bg-emerald-600 text-white'
  }
];

export const INITIAL_ACTIVE_TRACKER: ActivePackTracker = {
  packNameBn: 'রবি সুপার কম্বো ২৫ জিবি',
  operatorNameBn: 'রবি (Robi)',
  totalDataGB: 25,
  usedDataGB: 18.5,
  remainingDataGB: 6.5,
  totalMinutes: 350,
  usedMinutes: 260,
  remainingMinutes: 90,
  totalDays: 30,
  daysLeft: 14,
  isAtRiskOfBurnout: true,
  burnoutEstimatedDays: 5,
  suggestedBooster: {
    id: 'boost_5gb',
    nameBn: 'সাশ্রয়ী বুস্টার টপ-আপ (৫ জিবি + ১০০ মিনিট)',
    price: 78,
    dataGB: 5,
    validityDays: 7
  }
};

export function getClientFallbackRecommendation(habits: UserHabitsInput): BundleOptimizationResult {
  // Find matching operator packs or all packs for operator
  const opPacks = MOCK_OPERATOR_PACKS.filter((p) => p.operator === habits.operator);
  const candidatePacks = opPacks.length > 0 ? opPacks : MOCK_OPERATOR_PACKS;

  // Filter packs that cover at least 80% of data and minutes
  const suitable = candidatePacks.filter(
    (p) => p.dataGB >= habits.monthlyDataGB * 0.8 && p.voiceMinutes >= habits.monthlyMinutes * 0.8
  );

  const sorted = (suitable.length > 0 ? suitable : candidatePacks).sort((a, b) => a.price - b.price);
  const best = sorted[0] || candidatePacks[0];

  const estimatedPayAsYouGo = Math.round(habits.monthlyDataGB * 20 + habits.monthlyMinutes * 0.6);
  const savings = Math.max(120, estimatedPayAsYouGo - best.price);

  const banglaExplanation = `আপনার মাসিক ${habits.monthlyDataGB} জিবি ডেটা ও ${habits.monthlyMinutes} মিনিট টকটাইমের ব্যবহারের জন্য "${best.nameBn}" প্যাকটি সবচেয়ে সাশ্রয়ী। আলাদাভাবে রেগুলার পে-অ্যাজ-ইউ-গো রিচার্জ করলে খরচ হতো প্রায় ৳${estimatedPayAsYouGo}, কিন্তু এই অপ্টিমাইজড বান্ডেলে আপনি পাচ্ছেন মাত্র ৳${best.price}-এ—ফলে প্রতি মাসে সরাসরি আনুমানিক ৳${savings} সাশ্রয় হবে!`;

  return {
    recommendedPack: best,
    monthlySavingsEstimate: savings,
    banglaExplanation,
    alternativePacks: sorted.slice(1, 3),
    isAiGenerated: false
  };
}

export async function optimizeBundleWithAi(habits: UserHabitsInput): Promise<BundleOptimizationResult> {
  try {
    const res = await fetch('/api/bundle/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(habits)
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.recommendedPack) {
        return data as BundleOptimizationResult;
      }
    }
  } catch (err) {
    console.warn('AI Bundle optimization server call failed, using client fallback:', err);
  }

  return getClientFallbackRecommendation(habits);
}

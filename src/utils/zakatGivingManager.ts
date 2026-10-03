import {
  ZakatAssetsBreakdown,
  VerifiedCharity,
  ChildEidEnvelope
} from '../types/zakatGiving';

const ENVELOPES_STORAGE_KEY = 'upay_child_eid_envelopes_v1';

// Default Nisab based on Silver standard (52.5 Tola Silver in BDT)
export const DEFAULT_SILVER_NISAB_BDT = 120000;

export const VERIFIED_CHARITIES: VerifiedCharity[] = [
  {
    id: 'char_assunnah',
    nameBn: 'আস-সুন্নাহ ফাউন্ডেশন (As-Sunnah Foundation)',
    categoryBn: 'যাকাত ও দরিদ্র পুনর্বাসন',
    registrationNumber: 'রেজিস্ট্রেশন: এস-০৯৮১২/২০১৭',
    isVerified: true,
    avatarIcon: '🕌',
    bannerColor: 'bg-emerald-600',
    descriptionBn: 'দেশজুড়ে চরম দরিদ্র পরিবারকে স্বাবলম্বী করা, বিনামূল্যে শিক্ষা ও এতিম লালন-পালন।',
    totalDonationsReceivedBn: '৳৪.৮ কোটি সংগৃহীত'
  },
  {
    id: 'char_czm',
    nameBn: 'সেন্টার ফর যাকাত ম্যানেজমেন্ট (CZM)',
    categoryBn: 'প্রাতিষ্ঠানিক যাকাত ব্যবস্থাপনা',
    registrationNumber: 'রেজিস্ট্রেশন: সি-০৪৫১২/২০০৮',
    isVerified: true,
    avatarIcon: '⚖️',
    bannerColor: 'bg-blue-600',
    descriptionBn: 'কোরআনিক নিয়মানুযায়ী যাকাতের ৮টি খাতে স্বচ্ছ হিসাব ও টেকসই জীবিকায়ন কর্মসূচি।',
    totalDonationsReceivedBn: '৳৩.২ কোটি সংগৃহীত'
  },
  {
    id: 'char_anjuman',
    nameBn: 'আঞ্জুমান মুফিদুল ইসলাম (Anjuman Mufidul Islam)',
    categoryBn: 'এতিমখানা ও মানবিক সেবা',
    registrationNumber: 'রেজিস্ট্রেশন: ঐতিহাসিক চ্যারিটি-০১১০২',
    isVerified: true,
    avatarIcon: '🤝',
    bannerColor: 'bg-teal-600',
    descriptionBn: 'ঐতিহাসিক ১০০ বছরের দাতব্য সংস্থা—বেওয়ারিশ দাফন-কাফন এবং শত শত এতিমের শিক্ষা।',
    totalDonationsReceivedBn: '৳২.১ কোটি সংগৃহীত'
  },
  {
    id: 'char_bidyanondo',
    nameBn: 'বিদ্যানন্দ ফাউন্ডেশন (Bidyanondo Foundation)',
    categoryBn: 'শিক্ষা ও খাদ্য সহায়তা',
    registrationNumber: 'রেজিস্ট্রেশন: বি-০৮৮৪১/২০১৬',
    isVerified: true,
    avatarIcon: '🍲',
    bannerColor: 'bg-amber-600',
    descriptionBn: 'এক টাকায় আহার, সুবিধাবঞ্চিত পথশিশুদের স্কুল ও দুর্যোগকালে জরুরি ত্রাণ সামগ্রী বিতরণ।',
    totalDonationsReceivedBn: '৳৩.৯ কোটি সংগৃহীত'
  },
  {
    id: 'char_quantum',
    nameBn: 'কোয়ান্টাম ফাউন্ডেশন (Quantum Foundation)',
    categoryBn: 'স্বাস্থ্য ও রক্তদান',
    registrationNumber: 'রেজিস্ট্রেশন: কিউ-০৩৩২১/১৯৯৯',
    isVerified: true,
    avatarIcon: '🩸',
    bannerColor: 'bg-rose-600',
    descriptionBn: 'জরুরি রক্তদান সেবা, বিনামূল্যে চিকিৎসাসেবা ও মানবিক পুনর্বাসন ক্যাম্প।',
    totalDonationsReceivedBn: '৳১.৫ কোটি সংগৃহীত'
  }
];

export const INITIAL_ENVELOPES: ChildEidEnvelope[] = [
  {
    id: 'env_1',
    childName: 'সামিয়া আক্তার (১০ বছর)',
    childPhoneMasked: '০১৭**-***৯৮২',
    salamiAmount: 1000,
    envelopeTheme: 'gold',
    customGreetingBn: 'ঈদ মোবারক আমার প্রিয় মামণি! সালামি দিয়ে পছন্দের বই ও উপহার কিনে নিও।',
    dailySpendingLimit: 200,
    requireParentApproval: true,
    receivedAt: 'আজ, সকাল ৯:৩০',
    isOpened: false,
    senderName: 'বাবা (আসিফ রহমান)'
  }
];

export function calculateZakat(
  assets: ZakatAssetsBreakdown,
  nisabThreshold: number
): {
  totalWealth: number;
  netWealthAboveDebts: number;
  isEligibleForZakat: boolean;
  zakatPayable: number;
  zakatRatePct: number;
} {
  const totalWealth =
    assets.walletBalance +
    assets.cashOnHand +
    assets.goldSilverValue +
    assets.businessGoodsValue +
    assets.otherSavings;

  const netWealthAboveDebts = Math.max(0, totalWealth - assets.deductibleDebts);
  const isEligibleForZakat = netWealthAboveDebts >= nisabThreshold;
  const zakatRatePct = 2.5;
  const zakatPayable = isEligibleForZakat ? Math.round(netWealthAboveDebts * 0.025) : 0;

  return {
    totalWealth,
    netWealthAboveDebts,
    isEligibleForZakat,
    zakatPayable,
    zakatRatePct
  };
}

export function getEnvelopes(): ChildEidEnvelope[] {
  try {
    const raw = localStorage.getItem(ENVELOPES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ENVELOPES_STORAGE_KEY, JSON.stringify(INITIAL_ENVELOPES));
      return INITIAL_ENVELOPES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_ENVELOPES;
  } catch (e) {
    return INITIAL_ENVELOPES;
  }
}

export function saveEnvelopes(items: ChildEidEnvelope[]): void {
  try {
    localStorage.setItem(ENVELOPES_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save envelopes:', e);
  }
}

export function createChildEnvelope(params: {
  childName: string;
  childPhoneMasked?: string;
  salamiAmount: number;
  envelopeTheme: 'gold' | 'emerald' | 'crimson';
  customGreetingBn: string;
  dailySpendingLimit: number;
  requireParentApproval: boolean;
  senderName: string;
}): ChildEidEnvelope {
  const all = getEnvelopes();
  const newEnv: ChildEidEnvelope = {
    id: `env_${Date.now()}`,
    ...params,
    receivedAt: 'এইমাত্র',
    isOpened: false
  };
  all.unshift(newEnv);
  saveEnvelopes(all);
  return newEnv;
}

export function markEnvelopeOpened(id: string): void {
  const all = getEnvelopes();
  const item = all.find((e) => e.id === id);
  if (item) {
    item.isOpened = true;
    saveEnvelopes(all);
  }
}

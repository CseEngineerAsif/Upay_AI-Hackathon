import {
  IncomeSourceSummary,
  IncomePassportToken,
  PassportPurpose
} from '../types/incomePassport';

const PASSPORT_STORAGE_KEY = 'recursion_pay_income_passports_v1';

export const AGGREGATED_INCOME_SOURCES: IncomeSourceSummary[] = [
  {
    id: 'src_salary',
    category: 'salary',
    categoryBn: 'মাসিক বেতন',
    sourceNameBn: 'কর্পোরেট পেরোল (সফটওয়্যার লিমিটেড)',
    monthlyAverage: 45000,
    percentageOfTotal: 48,
    walletProviderBn: 'রিকার্শন পে পেরোল ওয়ালেট',
    icon: '💼',
    color: '#0B4DA2'
  },
  {
    id: 'src_freelance',
    category: 'freelance',
    categoryBn: 'ফ্রিল্যান্সিং ও কনসালটেন্সি',
    sourceNameBn: 'আন্তর্জাতিক রিমোট ইনকাম (Upwork/Fiverr)',
    monthlyAverage: 22000,
    percentageOfTotal: 23,
    walletProviderBn: 'রিকার্শন পে ফ্রিল্যান্সার হাব',
    icon: '💻',
    color: '#10B981'
  },
  {
    id: 'src_remittance',
    category: 'remittance',
    categoryBn: 'প্রবাসী রেমিট্যান্স',
    sourceNameBn: 'পরিবারের সহায়তা (মধ্যপ্রাচ্য)',
    monthlyAverage: 15000,
    percentageOfTotal: 16,
    walletProviderBn: 'রিকার্শন পে রেমিট্যান্স পে',
    icon: '🌍',
    color: '#F59E0B'
  },
  {
    id: 'src_business',
    category: 'business',
    categoryBn: 'অনলাইন শপ ও ব্যবসা',
    sourceNameBn: 'ডিজিটাল মার্চেন্ট বিক্রয়',
    monthlyAverage: 12000,
    percentageOfTotal: 13,
    walletProviderBn: 'রিকার্শন পে মার্চেন্ট ওয়ালেট',
    icon: '🏪',
    color: '#8B5CF6'
  }
];

export const INITIAL_PASSPORTS: IncomePassportToken[] = [
  {
    id: 'pass_1',
    referenceCode: 'RPAY-PASS-9102-RENT',
    purpose: 'house_rent',
    purposeBn: 'বাড়ি ভাড়া চুক্তি যাচাইকরণ',
    recipientEntity: 'বাড়িওয়ালা (বাশারের বাড়ি, ধানমন্ডি ৫/এ)',
    averageMonthlyRangeBn: '৳৮০,০০০ - ৳৯৫,০০০ / মাস',
    consecutiveMonthsCount: 28,
    stabilityScore: 96,
    stabilityRatingBn: 'অত্যন্ত উচ্চ স্থিতিশীলতা (A+)',
    createdAt: 'আজ, সকাল ১০:১৫',
    expiresAt: 'আগামীকাল সকাল ১০:১৫ (২৪ ঘণ্টা)',
    expiryHours: 24,
    status: 'active',
    qrPayload: 'https://recursionpay.com.bd/verify/pass/RPAY-PASS-9102-RENT',
    sharedFieldsBn: [
      'মাসিক আয়ের সামগ্রিক রেঞ্জ (৳৮০,০০০ - ৳৯৫,০০০)',
      'ধারাবাহিক আয় প্রবাহের মাস সংখ্যা (টানা ২৮ মাস)',
      'ডিজিটাল ইনকাম স্থিতিশীলতা স্কোর (৯৬/১০০)'
    ],
    hiddenFieldsBn: [
      'কোনো অ্যাকাউন্ট ব্যালেন্স নয়',
      'কোনো নির্দিষ্ট ব্যাংক স্টেটমেন্ট বা ট্রানজেকশন হিস্ট্রি নয়',
      'প্রেরকদের পরিচয় বা ব্যক্তিগত লেনদেনের বিবরণ নয়'
    ]
  }
];

export function getIncomeSources(): IncomeSourceSummary[] {
  return AGGREGATED_INCOME_SOURCES;
}

export function getPassportTokens(): IncomePassportToken[] {
  try {
    const raw = localStorage.getItem(PASSPORT_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PASSPORT_STORAGE_KEY, JSON.stringify(INITIAL_PASSPORTS));
      return INITIAL_PASSPORTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PASSPORTS;
  } catch (e) {
    return INITIAL_PASSPORTS;
  }
}

export function savePassportTokens(tokens: IncomePassportToken[]): void {
  try {
    localStorage.setItem(PASSPORT_STORAGE_KEY, JSON.stringify(tokens));
  } catch (e) {
    console.error('Failed to save passports:', e);
  }
}

export function createPassportToken(params: {
  purpose: PassportPurpose;
  recipientEntity: string;
  expiryHours: number;
}): IncomePassportToken {
  const all = getPassportTokens();
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const purposeTag =
    params.purpose === 'house_rent'
      ? 'RENT'
      : params.purpose === 'school_admission'
      ? 'SCH'
      : params.purpose === 'microloan'
      ? 'LOAN'
      : 'VISA';

  const refCode = `RPAY-PASS-${randNum}-${purposeTag}`;
  const now = new Date();
  const expiryDate = new Date(now.getTime() + params.expiryHours * 3600 * 1000);

  const purposeBn =
    params.purpose === 'house_rent'
      ? 'বাড়ি ভাড়া চুক্তি যাচাইকরণ'
      : params.purpose === 'school_admission'
      ? 'স্কুল/কলেজ ভর্তি ফি যাচাইকরণ'
      : params.purpose === 'microloan'
      ? 'ক্ষুদ্রঋণ / মাইক্রোলোন আবেদন'
      : 'ভিসা ও আর্থিক নিশ্চয়তা';

  const token: IncomePassportToken = {
    id: `pass_${Date.now()}`,
    referenceCode: refCode,
    purpose: params.purpose,
    purposeBn,
    recipientEntity: params.recipientEntity || 'যাচাইকারী কর্তৃপক্ষ',
    averageMonthlyRangeBn: '৳৮০,০০০ - ৳৯৫,০০০ / মাস',
    consecutiveMonthsCount: 28,
    stabilityScore: 96,
    stabilityRatingBn: 'অত্যন্ত উচ্চ স্থিতিশীলতা (A+)',
    createdAt: now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
    expiresAt: `${params.expiryHours} ঘণ্টা মেয়াদী`,
    expiryHours: params.expiryHours,
    status: 'active',
    qrPayload: `https://upay.com.bd/verify/pass/${refCode}`,
    sharedFieldsBn: [
      'মাসিক আয়ের সামগ্রিক রেঞ্জ (৳৮০,০০০ - ৳৯৫,০০০)',
      'ধারাবাহিক আয় প্রবাহের মাস সংখ্যা (টানা ২৮ মাস)',
      'ডিজিটাল ইনকাম স্থিতিশীলতা স্কোর (৯৬/১০০)'
    ],
    hiddenFieldsBn: [
      'কোনো অ্যাকাউন্ট ব্যালেন্স নয়',
      'কোনো নির্দিষ্ট ব্যাংক স্টেটমেন্ট বা ট্রানজেকশন হিস্ট্রি নয়',
      'প্রেরকদের পরিচয় বা ব্যক্তিগত লেনদেনের বিবরণ নয়'
    ]
  };

  all.unshift(token);
  savePassportTokens(all);
  return token;
}

export function revokePassportToken(tokenId: string): boolean {
  const all = getPassportTokens();
  const item = all.find((p) => p.id === tokenId);
  if (item) {
    item.status = 'revoked';
    savePassportTokens(all);
    return true;
  }
  return false;
}

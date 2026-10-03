import {
  PaymentMandate,
  MandateExecutionLog,
  ParsedMandateRule,
  MandateFrequency
} from '../types/mandateWallet';

const MANDATES_STORAGE_KEY = 'upay_payment_mandates_v1';
const MANDATE_LOGS_STORAGE_KEY = 'upay_mandate_logs_v1';

export const INITIAL_MANDATES: PaymentMandate[] = [
  {
    id: 'man_gas_1',
    titleBn: 'তিতাস গ্যাস বিল অটো-পে',
    billerNameBn: 'তিতাস গ্যাস (Titas Gas)',
    billerCategory: 'utility',
    conditionBn: 'বিলের পরিমাণ সর্বোচ্চ ১৫০০ টাকা বা তার নিচে হলে',
    maxAmount: 1500,
    frequency: 'monthly',
    frequencyBn: 'প্রতি মাসে (Monthly)',
    startDate: '১লা তারিখ',
    status: 'active',
    createdAt: '১৫ দিন আগে',
    totalExecutions: 2,
    totalPaidAmount: 1080
  },
  {
    id: 'man_net_2',
    titleBn: 'কার্নিভাল ইন্টারনেট বিল',
    billerNameBn: 'কার্নিভাল ইন্টারনেট (Carnival Internet)',
    billerCategory: 'internet',
    conditionBn: 'বিলের পরিমাণ সর্বোচ্চ ১২০০ টাকা পর্যন্ত হলে',
    maxAmount: 1200,
    frequency: 'monthly',
    frequencyBn: 'প্রতি মাসে (Monthly)',
    startDate: '৫ই তারিখ',
    status: 'active',
    createdAt: '১০ দিন আগে',
    totalExecutions: 1,
    totalPaidAmount: 1200
  },
  {
    id: 'man_desco_3',
    titleBn: 'ডেসকো বিদ্যুৎ বিল সুরক্ষা',
    billerNameBn: 'ডেসকো বিদ্যুৎ (DESCO)',
    billerCategory: 'utility',
    conditionBn: 'বিলের পরিমাণ সর্বোচ্চ ২০০০ টাকার নিচে হলে',
    maxAmount: 2000,
    frequency: 'monthly',
    frequencyBn: 'প্রতি মাসে (Monthly)',
    startDate: '১০ই তারিখ',
    status: 'paused',
    createdAt: '১ মাস আগে',
    totalExecutions: 1,
    totalPaidAmount: 0
  }
];

export const INITIAL_LOGS: MandateExecutionLog[] = [
  {
    id: 'log_1',
    mandateId: 'man_gas_1',
    mandateTitleBn: 'তিতাস গ্যাস বিল অটো-পে',
    attemptedAmount: 1080,
    status: 'paid',
    statusBn: 'পরিশোধিত ✓',
    reasonBn: 'শর্ত পূরণ হয়েছে (৳১,০৮০ <= সর্বোচ্চ সীমা ৳১,৫০০)',
    executedAt: 'আজ, সকাল ১০:১৫'
  },
  {
    id: 'log_2',
    mandateId: 'man_gas_1',
    mandateTitleBn: 'তিতাস গ্যাস বিল অটো-পে',
    attemptedAmount: 1850,
    status: 'blocked',
    statusBn: 'ব্লক করা হয়েছে ✕',
    reasonBn: 'সীমা অতিক্রম করেছে (প্রয়োজন ৳১,৮৫০, অনুমোদিত সর্বোচ্চ ৳১,৫০০)',
    executedAt: 'গতকাল, বিকাল ৪:২০'
  },
  {
    id: 'log_3',
    mandateId: 'man_desco_3',
    mandateTitleBn: 'ডেসকো বিদ্যুৎ বিল সুরক্ষা',
    attemptedAmount: 1500,
    status: 'blocked',
    statusBn: 'ব্লক করা হয়েছে ✕',
    reasonBn: 'ম্যান্ডেট স্থগিত (Paused) রয়েছে, ব্যবহারকারীর সক্রিয় অনুমোদন প্রয়োজন',
    executedAt: '৩ দিন আগে'
  }
];

export function getStoredMandates(): PaymentMandate[] {
  try {
    const raw = localStorage.getItem(MANDATES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(MANDATES_STORAGE_KEY, JSON.stringify(INITIAL_MANDATES));
      return INITIAL_MANDATES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_MANDATES;
  } catch (e) {
    return INITIAL_MANDATES;
  }
}

export function saveStoredMandates(items: PaymentMandate[]): void {
  try {
    localStorage.setItem(MANDATES_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save mandates:', e);
  }
}

export function getStoredLogs(): MandateExecutionLog[] {
  try {
    const raw = localStorage.getItem(MANDATE_LOGS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(MANDATE_LOGS_STORAGE_KEY, JSON.stringify(INITIAL_LOGS));
      return INITIAL_LOGS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_LOGS;
  } catch (e) {
    return INITIAL_LOGS;
  }
}

export function saveStoredLogs(logs: MandateExecutionLog[]): void {
  try {
    localStorage.setItem(MANDATE_LOGS_STORAGE_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save mandate logs:', e);
  }
}

// ----------------------------------------------------
// DETERMINISTIC RULE ENGINE (Strict Code, No AI)
// ----------------------------------------------------
export function evaluateMandateBill(
  mandateId: string,
  incomingBillAmount: number
): {
  isAllowed: boolean;
  statusBn: string;
  reasonBn: string;
  updatedMandate?: PaymentMandate;
  newLog: MandateExecutionLog;
} {
  const mandates = getStoredMandates();
  const mandate = mandates.find((m) => m.id === mandateId);

  if (!mandate) {
    throw new Error('Mandate not found');
  }

  let isAllowed = false;
  let status: 'paid' | 'blocked' = 'blocked';
  let statusBn = 'ব্লক করা হয়েছে ✕';
  let reasonBn = '';

  // 1. Strict status check
  if (mandate.status !== 'active') {
    isAllowed = false;
    status = 'blocked';
    statusBn = 'ব্লক করা হয়েছে ✕';
    reasonBn = 'ম্যান্ডেটটি বর্তমানে স্থগিত (Paused) রয়েছে';
  } else if (incomingBillAmount > mandate.maxAmount) {
    // 2. Strict maximum threshold check
    isAllowed = false;
    status = 'blocked';
    statusBn = 'ব্লক করা হয়েছে ✕';
    reasonBn = `সীমা অতিক্রম করেছে (বিলের পরিমাণ ৳${incomingBillAmount.toLocaleString()} > অনুমোদিত সর্বোচ্চ ৳${mandate.maxAmount.toLocaleString()})`;
  } else if (incomingBillAmount <= 0) {
    isAllowed = false;
    status = 'blocked';
    statusBn = 'ব্লক করা হয়েছে ✕';
    reasonBn = 'অকার্যকর বিলের পরিমাণ';
  } else {
    // 3. All deterministic rules passed
    isAllowed = true;
    status = 'paid';
    statusBn = 'পরিশোধিত ✓';
    reasonBn = `শর্ত পূরণ হয়েছে (বিলের পরিমাণ ৳${incomingBillAmount.toLocaleString()} <= সর্বোচ্চ সীমা ৳${mandate.maxAmount.toLocaleString()})`;

    // Update mandate metrics
    mandate.totalExecutions += 1;
    mandate.totalPaidAmount += incomingBillAmount;
    saveStoredMandates(mandates);
  }

  // Create new log entry
  const newLog: MandateExecutionLog = {
    id: `log_${Date.now()}`,
    mandateId: mandate.id,
    mandateTitleBn: mandate.titleBn,
    attemptedAmount: incomingBillAmount,
    status,
    statusBn,
    reasonBn,
    executedAt: 'এইমাত্র'
  };

  const logs = getStoredLogs();
  logs.unshift(newLog);
  saveStoredLogs(logs);

  return {
    isAllowed,
    statusBn,
    reasonBn,
    updatedMandate: mandate,
    newLog
  };
}

// ----------------------------------------------------
// Heuristic Fallback Parser for Mandate Instructions
// ----------------------------------------------------
export function parseInstructionHeuristic(instruction: string): ParsedMandateRule {
  const text = instruction.trim();

  // Biller / Category
  let billerNameBn = 'ইউটিলিটি বিল';
  let billerCategory: 'utility' | 'internet' | 'family' | 'subscription' | 'other' = 'utility';

  if (text.includes('গ্যাস') || text.includes('তিতাস')) {
    billerNameBn = 'তিতাস গ্যাস (Titas Gas)';
    billerCategory = 'utility';
  } else if (text.includes('বিদ্যুৎ') || text.includes('ডেসকো') || text.includes('নেসকো') || text.includes('পল্লী')) {
    billerNameBn = 'বিদ্যুৎ বিল (DESCO/DPDC)';
    billerCategory = 'utility';
  } else if (text.includes('পানি') || text.includes('ওয়াসা') || text.includes('ওয়াসা')) {
    billerNameBn = 'ঢাকা ওয়াসা (DWASA)';
    billerCategory = 'utility';
  } else if (text.includes('ইন্টারনেট') || text.includes('ওয়াইফাই') || text.includes('ওয়াইফাই')) {
    billerNameBn = 'ব্রডব্যান্ড ইন্টারনেট বিল';
    billerCategory = 'internet';
  } else if (text.includes('মা') || text.includes('আম্মা') || text.includes('বাবা') || text.includes('পরিবার')) {
    billerNameBn = 'পরিবারের খরচ / হাতখরচ';
    billerCategory = 'family';
  }

  // Max Amount
  let maxAmount = 1500;
  const numMatch = text.match(/\d+/);
  if (numMatch) {
    maxAmount = parseInt(numMatch[0], 10);
  } else if (text.includes('পনেরো শত') || text.includes('১৫০০') || text.includes('দেড় হাজার')) {
    maxAmount = 1500;
  } else if (text.includes('হাজার') || text.includes('১০০০') || text.includes('এক হাজার')) {
    maxAmount = 1000;
  } else if (text.includes('দুই হাজার') || text.includes('২০০০')) {
    maxAmount = 2000;
  }

  // Frequency
  let frequency: MandateFrequency = 'monthly';
  let frequencyBn = 'প্রতি মাসে (Monthly)';
  if (text.includes('সপ্তাহ') || text.includes('সাপ্তাহিক')) {
    frequency = 'weekly';
    frequencyBn = 'প্রতি সপ্তাহে (Weekly)';
  } else if (text.includes('দিন') || text.includes('দৈনিক')) {
    frequency = 'daily';
    frequencyBn = 'প্রতিদিন (Daily)';
  }

  return {
    billerNameBn,
    billerCategory,
    conditionBn: `বিলের পরিমাণ সর্বোচ্চ ${maxAmount.toLocaleString()} টাকার নিচে বা সমান হলে`,
    maxAmount,
    frequency,
    frequencyBn,
    startDate: '১লা তারিখ থেকে কার্যকর',
    explanationBn: `নির্দেশনা অনুযায়ী এআই নিয়ম তৈরি করেছে: "${billerNameBn}"-এর জন্য প্রতি মাসে সর্বোচ্চ ৳${maxAmount.toLocaleString()} সীমা নির্ধারণ করা হয়েছে। বিল এই সীমার মধ্যে থাকলে স্বয়ংক্রিয়ভাবে অনুমোদিত হবে, অন্যথায় ব্লক করা হবে।`,
    isAiParsed: false
  };
}

export async function parseInstructionWithAi(instruction: string): Promise<ParsedMandateRule> {
  try {
    const res = await fetch('/api/mandate/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instruction })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.billerNameBn && data.maxAmount) {
        return data as ParsedMandateRule;
      }
    }
  } catch (err) {
    console.warn('AI Mandate Parser failed, using heuristic fallback:', err);
  }

  return parseInstructionHeuristic(instruction);
}

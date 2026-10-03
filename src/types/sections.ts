export type SectionId =
  | 'fraud_prevention'
  | 'agent_cash'
  | 'savings_somiti'
  | 'zakat_giving'
  | 'eid_envelopes'
  | 'smart_payment'
  | 'income_workers'
  | 'disaster_support';

export type FeatureTab =
  | 'trustpay'
  | 'crosswallet'
  | 'fee_auditor'
  | 'somiti'
  | 'zakat_calculator'
  | 'zakat_charities'
  | 'zakat_giving'
  | 'eid_envelope'
  | 'child_wallet'
  | 'mandate_wallet'
  | 'liquidity'
  | 'payslip_orchestrator'
  | 'climateshield'
  | 'income_passport'
  | 'dialect_voice'
  | 'bundle_optimizer';

export interface SectionFeature {
  id: string;
  tab: FeatureTab;
  titleBn: string;
  titleEn: string;
  descBn: string;
  descEn: string;
  badgeBn?: string;
  badgeEn?: string;
  iconBg: string;
  icon: string;
}

export interface SectionConfig {
  id: SectionId;
  titleBn: string;
  titleEn: string;
  subtitleBn: string; // Description under title
  subtitleEn: string;
  taglineBn: string;  // Bold yellow tagline
  taglineEn: string;
  iconBadge: string;
  bannerTitleBn?: string;
  bannerTitleEn?: string;
  features: SectionFeature[];
}

export const SECTIONS_DATA: Record<SectionId, SectionConfig> = {
  fraud_prevention: {
    id: 'fraud_prevention',
    titleBn: 'প্রতারণা প্রতিরোধ',
    titleEn: 'Fraud Prevention',
    subtitleBn: 'ফ্রড ও স্ক্যাম থেকে সুরক্ষা',
    subtitleEn: 'Protection from Frauds & Scams',
    taglineBn: 'গোপনীয়তা রক্ষা করে প্রতারক চক্র শনাক্ত',
    taglineEn: 'Identify Fraud Networks with Zero Data Leakage',
    iconBadge: '🛡️',
    features: [
      {
        id: 'crosswallet',
        tab: 'crosswallet',
        titleBn: 'ক্রস-ওয়ালেট',
        titleEn: 'Cross-Wallet Risk',
        descBn: 'ক্রস-ওয়ালেট রিস্ক এক্সচেঞ্জ',
        descEn: 'Cross-Wallet Risk Exchange',
        badgeBn: 'ফেডারেটেড এআই',
        badgeEn: 'Federated AI',
        iconBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        icon: '🌐'
      },
      {
        id: 'trustpay',
        tab: 'trustpay',
        titleBn: 'ট্রাস্টপে',
        titleEn: 'TrustPay',
        descBn: 'এসক্রো + সেলার ট্রাস্ট ব্যাজ',
        descEn: 'Escrow + Seller Trust Badge',
        badgeBn: 'এসক্রো সুরক্ষা',
        badgeEn: 'Escrow Protected',
        iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: '🤝'
      }
    ]
  },
  agent_cash: {
    id: 'agent_cash',
    titleBn: 'এজেন্ট ও ক্যাশ',
    titleEn: 'Agent & Cash',
    subtitleBn: 'এজেন্ট ও নগদ টাকার সেবা',
    subtitleEn: 'Agent & Cash Services',
    taglineBn: 'ক্যাশ-আউটে নিশ্চয়তা, এজেন্টে স্বচ্ছতা',
    taglineEn: 'Cashout Certainty & Agent Transparency',
    iconBadge: '🏧',
    features: [
      {
        id: 'liquidity',
        tab: 'liquidity',
        titleBn: 'লিকুইডিটি',
        titleEn: 'Liquidity Network',
        descBn: 'ক্যাশ স্লট বুকিং + এজেন্ট ফ্লোট এক্সচেঞ্জ',
        descEn: 'Cash Slot Booking + Agent Float Exchange',
        badgeBn: 'ক্যাশ স্লট',
        badgeEn: 'Cash Slot',
        iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: '⚡'
      },
      {
        id: 'fee_auditor',
        tab: 'fee_auditor',
        titleBn: 'ফি অডিটর',
        titleEn: 'Fee Auditor',
        descBn: 'এজেন্ট ওভারচার্জ রাডার',
        descEn: 'Agent Overcharge Radar',
        badgeBn: 'অ্যান্টি-ওভারচার্জ',
        badgeEn: 'Radar',
        iconBg: 'bg-blue-50 text-[#0B4DA2] border-blue-200',
        icon: '⚖️'
      }
    ]
  },
  savings_somiti: {
    id: 'savings_somiti',
    titleBn: 'সঞ্চয় ও সমিতি',
    titleEn: 'Savings & Somiti',
    subtitleBn: 'দলবদ্ধ সঞ্চয়',
    subtitleEn: 'Collaborative Group Savings',
    taglineBn: 'স্বচ্ছ খতিয়ান, ন্যায্য পেআউট ক্রম',
    taglineEn: 'Transparent Ledgers & Fair AI Payouts',
    iconBadge: '👥',
    features: [
      {
        id: 'somiti',
        tab: 'somiti',
        titleBn: 'ডিজিটাল সমিতি',
        titleEn: 'Digital Somiti',
        descBn: 'বিশ্বস্ত গ্রুপ ওয়ালেট ও ডিজিটাল সমিতি',
        descEn: 'Trusted Group Savings & ROSCA',
        badgeBn: 'AI সমিতি',
        badgeEn: 'AI Somiti',
        iconBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        icon: '👥'
      }
    ]
  },
  zakat_giving: {
    id: 'zakat_giving',
    titleBn: 'যাকাত ও দান',
    titleEn: 'Zakat & Giving',
    subtitleBn: 'যাকাত ও দান সহকারী',
    subtitleEn: 'Zakat & Donation Assistant',
    taglineBn: 'সঠিক হিসাব, যাচাইকৃত প্রতিষ্ঠানে দান',
    taglineEn: 'Accurate Calculation, Verified Charity Giving',
    iconBadge: '🌙',
    features: [
      {
        id: 'zakat_calculator',
        tab: 'zakat_calculator',
        titleBn: 'যাকাত ক্যালকুলেটর',
        titleEn: 'Zakat Calculator',
        descBn: 'শরীয়াহ সম্মত সঠিক যাকাত হিসাব ও নেসাব নির্দেশিকা',
        descEn: 'Accurate Shariah Zakat Calculator & Nisab Threshold',
        badgeBn: '২.৫% নেসাব',
        badgeEn: '2.5% Nisab',
        iconBg: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: '🌙'
      },
      {
        id: 'zakat_charities',
        tab: 'zakat_charities',
        titleBn: 'দান (যাচাইকৃত প্রতিষ্ঠান)',
        titleEn: 'Charity Giving',
        descBn: 'যাচাইকৃত দাতব্য সংস্থায় সরাসরি অনুদান ও রসিদ',
        descEn: 'Direct Verified Charity Donation & Receipts',
        badgeBn: 'যাচাইকৃত এনজিও',
        badgeEn: 'Verified NGO',
        iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: '🤲'
      }
    ]
  },
  eid_envelopes: {
    id: 'eid_envelopes',
    titleBn: 'ঈদ খাম',
    titleEn: 'Eid Envelopes',
    subtitleBn: 'ঈদ খাম ও ডিজিটাল সালামি',
    subtitleEn: 'Eid Gift Envelopes & Digital Salami',
    taglineBn: 'আনন্দ ভাগ করুন, শিশুদের ওয়ালেট অভিভাবকের হাতে',
    taglineEn: 'Share Joy, Kids Wallets in Parents Control',
    iconBadge: '🎁',
    features: [
      {
        id: 'eid_envelope',
        tab: 'eid_envelope',
        titleBn: 'ডিজিটাল সালামি / ঈদ খাম',
        titleEn: 'Digital Salami / Eid Gift',
        descBn: 'ডিজিটাল ঈদ খামে সালামি প্রেরণ ও শুভেচ্ছা বার্তা',
        descEn: 'Send Digital Eid Salami with Custom Greeting',
        badgeBn: 'ঈদ খাম',
        badgeEn: 'Eid Salami',
        iconBg: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: '💌'
      },
      {
        id: 'child_wallet',
        tab: 'child_wallet',
        titleBn: 'শিশুদের ওয়ালেট (অভিভাবকের নিয়ন্ত্রণে)',
        titleEn: 'Child Wallet Controls',
        descBn: 'অভিভাবক নিয়ন্ত্রিত খরচ সীমা ও লেনদেন অনুমোদন',
        descEn: 'Parent-Controlled Spending Limit & Approvals',
        badgeBn: 'প্যারেন্টাল কন্ট্রোল',
        badgeEn: 'Parental Control',
        iconBg: 'bg-teal-50 text-teal-700 border-teal-200',
        icon: '🧒'
      }
    ]
  },
  smart_payment: {
    id: 'smart_payment',
    titleBn: 'স্মার্ট পেমেন্ট',
    titleEn: 'Smart Payment',
    subtitleBn: 'স্মার্ট ও সহজ পেমেন্ট',
    subtitleEn: 'Smart & Seamless Payments',
    taglineBn: 'আপনার নিয়মে অটো পেমেন্ট, কথায় লেনদেন, কম খরচে রিচার্জ',
    taglineEn: 'Automated Bills, Voice Banking & Saver Recharges',
    iconBadge: '⚡',
    features: [
      {
        id: 'mandate_wallet',
        tab: 'mandate_wallet',
        titleBn: 'ম্যান্ডেট পে (অটো বিল পেমেন্ট)',
        titleEn: 'Mandate Pay (Auto Bill Pay)',
        descBn: 'এআই অনুমোদিত শর্তযুক্ত স্বয়ংক্রিয় বিল পেমেন্ট',
        descEn: 'AI-Permissioned Auto Payments with Limit Rules',
        badgeBn: 'অটো বিল',
        badgeEn: 'Auto Bill',
        iconBg: 'bg-cyan-50 text-cyan-800 border-cyan-200',
        icon: '📜'
      },
      {
        id: 'dialect_voice',
        tab: 'dialect_voice',
        titleBn: 'ভয়েস পে (আঞ্চলিক ভাষা-সচেতন)',
        titleEn: 'Voice Pay (Dialect-aware)',
        descBn: 'চাটগাঁইয়া, সিলেটি, নোয়াখাইল্লা ও রংপুরিয়া উপভাষায় নিরাপদ পেমেন্ট',
        descEn: 'Bangla Dialects Recognition with Voice Confirmation',
        badgeBn: 'কথ্য ভাষা',
        badgeEn: 'Bangla Dialects',
        iconBg: 'bg-blue-50 text-blue-900 border-blue-200',
        icon: '🎙️'
      },
      {
        id: 'bundle_optimizer',
        tab: 'bundle_optimizer',
        titleBn: 'বান্ডেল অপ্টিমাইজার',
        titleEn: 'Bundle Optimizer',
        descBn: 'আপনার ব্যবহারের ধরনে সবচেয়ে কম খরচের রিচার্জ প্যাক ও মেয়াদ সুরক্ষা',
        descEn: 'AI-Powered Lowest Cost Mobile Recharge & Mid-Month Protection',
        badgeBn: 'সাশ্রয়ী রিচার্জ',
        badgeEn: 'Data Saver',
        iconBg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        icon: '📶'
      }
    ]
  },
  income_workers: {
    id: 'income_workers',
    titleBn: 'আয় ও কর্মজীবী',
    titleEn: 'Income & Workers',
    subtitleBn: 'আয় ও বেতনের স্বচ্ছতা',
    subtitleEn: 'Income & Salary Transparency',
    taglineBn: 'বেতন যাচাই, আয়ের নিরাপদ প্রমাণ',
    taglineEn: 'Salary Verification & Zero-Statement Income Proof',
    iconBadge: '👷',
    features: [
      {
        id: 'payslip_orchestrator',
        tab: 'payslip_orchestrator',
        titleBn: 'পে-স্লিপ অডিট (ওয়েজ-ডে অর্কেস্ট্রেটর)',
        titleEn: 'Payslip Audit (Wage-Day)',
        descBn: 'শ্রমিকদের পে-স্লিপ নির্ভুলতা অডিট ও বেতন দিনে ভিড়হীন ক্যাশ-আউট',
        descEn: 'Garment Worker Payslip Auditor & Staggered Cashout',
        badgeBn: 'বেতন যাচাই',
        badgeEn: 'Wage Day',
        iconBg: 'bg-emerald-50 text-emerald-900 border-emerald-200',
        icon: '👔'
      },
      {
        id: 'income_passport',
        tab: 'income_passport',
        titleBn: 'ইনকাম পাসপোর্ট',
        titleEn: 'Income Passport',
        descBn: 'স্টেটমেন্ট ছাড়া আয়ের নির্ভরযোগ্যতা ও নিয়মিততার ডিজিটাল প্রমাণ',
        descEn: 'Verifiable Income Regularity Proof for Rent & Microloans',
        badgeBn: 'ভেরিফাইড',
        badgeEn: 'Verified',
        iconBg: 'bg-teal-50 text-teal-800 border-teal-200',
        icon: '🛂'
      }
    ]
  },
  disaster_support: {
    id: 'disaster_support',
    titleBn: 'দুর্যোগ সহায়তা',
    titleEn: 'Disaster Support',
    subtitleBn: 'দুর্যোগকালীন আর্থিক সহায়তা',
    subtitleEn: 'Emergency Disaster Relief',
    taglineBn: 'বন্যা-ঘূর্ণিঝড়ে দ্রুত ত্রাণ ও ক্যাশ প্রস্তুতি',
    taglineEn: 'Fast Relief Disbursements & Cash Readiness in Floods/Cyclones',
    iconBadge: '🌦️',
    features: [
      {
        id: 'climateshield',
        tab: 'climateshield',
        titleBn: 'ক্লাইমেট শিল্ড',
        titleEn: 'Climate Shield',
        descBn: 'বন্যা ও ঘূর্ণিঝড় দুর্যোগে জরুরি ওয়ালেট ও ত্রাণ বিতরণ',
        descEn: 'Emergency Disaster Wallet & Relief Disbursement',
        badgeBn: 'ত্রাণ সহায়তা',
        badgeEn: 'Relief Active',
        iconBg: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: '🌊'
      }
    ]
  }
};

export const FEATURE_TO_SECTION_MAP: Record<FeatureTab, SectionId> = {
  crosswallet: 'fraud_prevention',
  trustpay: 'fraud_prevention',
  liquidity: 'agent_cash',
  fee_auditor: 'agent_cash',
  somiti: 'savings_somiti',
  zakat_calculator: 'zakat_giving',
  zakat_charities: 'zakat_giving',
  zakat_giving: 'zakat_giving',
  eid_envelope: 'eid_envelopes',
  child_wallet: 'eid_envelopes',
  mandate_wallet: 'smart_payment',
  dialect_voice: 'smart_payment',
  bundle_optimizer: 'smart_payment',
  payslip_orchestrator: 'income_workers',
  income_passport: 'income_workers',
  climateshield: 'disaster_support'
};

export type Language = 'bn' | 'en';

export type UserRole = 'user' | 'analyst' | 'admin' | 'guardian';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  balance: number;
  pin: string; // "1234" for demo / hashed
  isBiometricEnabled: boolean;
  role: UserRole;
  guardianPhone?: string;
  guardianName?: string;
  guardianStatus?: 'none' | 'pending' | 'connected';
  language: Language;
  simpleMode: boolean;
  aiConsentGiven: boolean;
  accountTier: string;
  joinedDate: string;
}

export type TransactionType =
  | 'send_money'
  | 'cash_out'
  | 'mobile_recharge'
  | 'pay_bill'
  | 'add_money'
  | 'savings'
  | 'fund_transfer'
  | 'request_money'
  | 'make_payment'
  | 'npsb';

export type TransactionCategory =
  | 'খাবার'
  | 'ট্রান্সপোর্ট'
  | 'বিল'
  | 'ক্যাশ-আউট'
  | 'শপিং'
  | 'অন্যান্য';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  recipient: string;
  recipientName?: string;
  amount: number;
  fee: number;
  total: number;
  note?: string;
  category: TransactionCategory;
  categoryEn: string;
  roundUpAmount?: number;
  timestamp: string;
  status: 'completed' | 'flagged' | 'blocked' | 'in_review';
  riskScore?: number;
  riskLevel?: 'low' | 'medium' | 'high';
  riskSignals?: string[];
  feedbackGiven?: 'helpful' | 'unhelpful';
  isScamConfirmed?: boolean;
}

export interface RiskRuleSignal {
  rule: string;
  labelBn: string;
  labelEn: string;
  points: number;
  severity: 'low' | 'medium' | 'high';
  detailsBn: string;
}

export interface RiskAssessment {
  transactionId: string;
  riskScore: number; // 0 - 100
  riskLevel: 'low' | 'medium' | 'high';
  signals: RiskRuleSignal[];
  explanationBn: string;
  explanationEn: string;
  actionAdviceBn: string;
  actionAdviceEn: string;
  coolingPeriodSeconds: number;
  suggestSmallTest: boolean;
  baselineDiffPct: number;
  recipientTrustScore: number; // 0 - 100
}

export interface SavingsGoal {
  id: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  durationMonths: number;
  monthlySavings: number;
  roundUpActive: boolean;
  category: string;
}

export interface ScamCheckResult {
  riskScore: number;
  riskLevel: 'safe' | 'suspicious' | 'danger';
  verdictBn: string;
  verdictEn: string;
  explanationBn: string;
  detectedTriggers: string[];
  matchedKeywords: string[];
  suspiciousUrls: string[];
  recommendedActionBn: string;
}

export interface AnalystQueueItem {
  id: string;
  transactionId: string;
  userName: string;
  userPhone: string;
  recipientPhone: string;
  recipientName: string;
  amount: number;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  signals: string[];
  status: 'pending' | 'reviewed' | 'dismissed' | 'escalated';
  analystNotes?: string;
  timestamp: string;
  userFeedback?: 'helpful' | 'unhelpful';
  isScamConfirmed?: boolean;
}

export interface GuardianAlert {
  id: string;
  guardianPhone: string;
  wardName: string;
  wardPhone: string;
  amount: number;
  riskScore: number;
  riskLevel: 'medium' | 'high';
  timestamp: string;
  status: 'pending' | 'acknowledged' | 'warned';
  adviceBn: string;
}

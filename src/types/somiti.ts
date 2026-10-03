export type SomitiRole = 'admin' | 'member';

export interface SomitiMember {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  role: SomitiRole;
  payoutCycle: number; // Cycle number when this member receives the full lump-sum pool (1, 2, 3...)
  payoutDate: string;
  hasPaidCurrentCycle: boolean;
  earlyWarningRisk?: 'low' | 'warning' | 'critical';
  earlyWarningReason?: string;
  isCurrentUser?: boolean;
}

export interface SomitiLedgerEntry {
  id: string;
  somitiId: string;
  type: 'contribution' | 'payout' | 'emergency_relief';
  memberId: string;
  memberName: string;
  memberPhone?: string;
  cycleNumber: number;
  amount: number;
  date: string;
  time: string;
  immutableHash: string; // Anti-fraud cryptographic hash proof
  verifiedBy: 'system_escrow' | 'bank_contract';
  note?: string;
}

export interface SomitiPayoutFactor {
  titleBn: string;
  titleEn: string;
  descriptionBn: string;
  descriptionEn: string;
}

export interface SomitiPayoutExplanation {
  algorithm: string;
  rationaleBn: string;
  rationaleEn: string;
  fairnessScore: number; // e.g. 98%
  factors: SomitiPayoutFactor[];
  transparencyHash: string;
  generatedAt: string;
}

export interface SomitiEarlyWarningAlert {
  id: string;
  somitiId: string;
  memberId: string;
  memberName: string;
  memberPhone: string;
  severity: 'low' | 'warning' | 'critical';
  dueDate: string;
  daysRemaining: number;
  amountDue: number;
  messageBn: string;
  messageEn: string;
  isRead: boolean;
  reminderSent?: boolean;
}

export interface DigitalSomiti {
  id: string;
  name: string;
  description?: string;
  category: 'friends' | 'business' | 'family' | 'neighborhood' | 'colleagues';
  adminId: string;
  adminName: string;
  adminPhone: string;
  monthlyContribution: number;
  totalCycles: number;
  currentCycle: number;
  poolAmountPerCycle: number; // monthlyContribution * members.length
  totalPotCollectedCurrentCycle: number;
  startDate: string;
  nextPayoutDate: string;
  status: 'active' | 'completed' | 'forming';
  members: SomitiMember[];
  payoutExplanation: SomitiPayoutExplanation;
  ledger: SomitiLedgerEntry[];
  earlyWarnings: SomitiEarlyWarningAlert[];
  createdAt: string;
}

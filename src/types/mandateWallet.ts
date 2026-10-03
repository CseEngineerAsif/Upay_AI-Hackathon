export type MandateFrequency = 'monthly' | 'weekly' | 'daily' | 'one_time';

export type MandateStatus = 'active' | 'paused';

export interface PaymentMandate {
  id: string;
  titleBn: string;
  billerNameBn: string;
  billerCategory: 'utility' | 'internet' | 'family' | 'subscription' | 'other';
  conditionBn: string;
  maxAmount: number;
  frequency: MandateFrequency;
  frequencyBn: string;
  startDate: string;
  status: MandateStatus;
  createdAt: string;
  totalExecutions: number;
  totalPaidAmount: number;
}

export interface MandateExecutionLog {
  id: string;
  mandateId: string;
  mandateTitleBn: string;
  attemptedAmount: number;
  status: 'paid' | 'blocked';
  statusBn: string;
  reasonBn: string;
  executedAt: string;
}

export interface ParsedMandateRule {
  billerNameBn: string;
  billerCategory: 'utility' | 'internet' | 'family' | 'subscription' | 'other';
  conditionBn: string;
  maxAmount: number;
  frequency: MandateFrequency;
  frequencyBn: string;
  startDate: string;
  explanationBn: string;
  isAiParsed: boolean;
}

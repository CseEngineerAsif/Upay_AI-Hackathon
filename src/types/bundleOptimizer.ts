export type OperatorType = 'gp' | 'robi' | 'banglalink' | 'airtel' | 'teletalk';

export interface OperatorPack {
  id: string;
  operator: OperatorType;
  operatorNameBn: string;
  nameBn: string;
  price: number;
  validityDays: number;
  dataGB: number;
  voiceMinutes: number;
  smsCount: number;
  tagBn?: string;
  badgeColor?: string;
}

export interface UserHabitsInput {
  monthlyDataGB: number;
  monthlyMinutes: number;
  monthlySms: number;
  operator: OperatorType;
}

export interface BundleOptimizationResult {
  recommendedPack: OperatorPack;
  monthlySavingsEstimate: number;
  banglaExplanation: string;
  alternativePacks: OperatorPack[];
  isAiGenerated: boolean;
}

export interface ActivePackTracker {
  packNameBn: string;
  operatorNameBn: string;
  totalDataGB: number;
  usedDataGB: number;
  remainingDataGB: number;
  totalMinutes: number;
  usedMinutes: number;
  remainingMinutes: number;
  totalDays: number;
  daysLeft: number;
  isAtRiskOfBurnout: boolean;
  burnoutEstimatedDays: number;
  suggestedBooster: {
    id: string;
    nameBn: string;
    price: number;
    dataGB: number;
    validityDays: number;
  };
}

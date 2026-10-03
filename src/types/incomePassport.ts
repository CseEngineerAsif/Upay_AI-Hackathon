export type IncomeSourceCategory = 'salary' | 'freelance' | 'remittance' | 'business';

export interface IncomeSourceSummary {
  id: string;
  category: IncomeSourceCategory;
  categoryBn: string;
  sourceNameBn: string;
  monthlyAverage: number;
  percentageOfTotal: number;
  walletProviderBn: string;
  icon: string;
  color: string;
}

export type PassportPurpose = 'house_rent' | 'school_admission' | 'microloan' | 'visa_guarantor';

export interface IncomePassportToken {
  id: string;
  referenceCode: string; // e.g. UPAY-PASS-8891-RENT
  purpose: PassportPurpose;
  purposeBn: string;
  recipientEntity: string; // e.g., বাড়িওয়ালা (House Owner), উত্তরা হাই স্কুল
  averageMonthlyRangeBn: string; // e.g., ৳৭০,০০০ - ৳৮৫,০০০
  consecutiveMonthsCount: number; // e.g., ২৪ মাস
  stabilityScore: number; // e.g., ৯৪/১০০
  stabilityRatingBn: string; // e.g., চমৎকার (A+)
  createdAt: string;
  expiresAt: string;
  expiryHours: number;
  status: 'active' | 'revoked' | 'expired';
  qrPayload: string;
  sharedFieldsBn: string[];
  hiddenFieldsBn: string[];
}

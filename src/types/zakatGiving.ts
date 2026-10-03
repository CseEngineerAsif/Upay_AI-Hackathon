export interface ZakatAssetsBreakdown {
  walletBalance: number;
  cashOnHand: number;
  goldSilverValue: number;
  businessGoodsValue: number;
  otherSavings: number;
  deductibleDebts: number;
}

export interface VerifiedCharity {
  id: string;
  nameBn: string;
  categoryBn: string;
  registrationNumber: string;
  isVerified: boolean;
  avatarIcon: string;
  bannerColor: string;
  descriptionBn: string;
  totalDonationsReceivedBn: string;
}

export interface ChildEidEnvelope {
  id: string;
  childName: string;
  childPhoneMasked?: string;
  salamiAmount: number;
  envelopeTheme: 'gold' | 'emerald' | 'crimson';
  customGreetingBn: string;
  dailySpendingLimit: number;
  requireParentApproval: boolean;
  receivedAt: string;
  isOpened: boolean;
  senderName: string;
}

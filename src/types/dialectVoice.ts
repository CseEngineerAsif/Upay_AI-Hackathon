export type DialectRegion = 'standard' | 'chattogram' | 'sylhet' | 'noakhali' | 'rangpur';

export interface DialectVoiceIntent {
  rawSpokenText: string;
  detectedDialect: DialectRegion;
  detectedDialectBn: string;
  action: 'send_money' | 'cash_out' | 'mobile_recharge' | 'unknown';
  actionBn: string;
  recipientName: string;
  recipientPhoneMasked?: string;
  amount: number;
  normalizedSentenceBn: string;
  confidenceScore: number;
  isAiParsed: boolean;
}

export interface DialectSamplePhrase {
  region: DialectRegion;
  regionBn: string;
  phrase: string;
  meaningBn: string;
  expectedAmount: number;
  expectedRecipient: string;
}

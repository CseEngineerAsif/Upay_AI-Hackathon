export interface MfsFederatedNode {
  id: string;
  nameBn: string;
  nameEn: string;
  brandColor: string;
  localModelVersion: string;
  localSamplesTrained: string;
  encryptionStatusBn: string;
  lastGradientSync: string;
}

export interface FraudHopNode {
  step: number;
  walletHash: string; // Anonymized SHA-256 hash
  providerNameBn: string;
  amount: number;
  timestamp: string;
  suspiciousActionBn: string;
}

export interface FraudRingAlert {
  id: string;
  ringCode: string; // e.g., RING-FD-8921
  titleBn: string;
  threatTypeBn: string;
  riskScore: number; // 0-100
  walletsInvolvedCount: number;
  providersInvolvedCount: number;
  totalVolume: number;
  detectedPatternBn: string;
  recommendedActionBn: string;
  status: 'active_threat' | 'monitoring' | 'mitigated';
  hops: FraudHopNode[];
  federatedConsensusScore: number;
  createdAt: string;
}

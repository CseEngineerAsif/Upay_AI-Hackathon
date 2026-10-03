export interface CashOutAuditRecord {
  id: string;
  cashOutAmount: number;
  officialFee: number;
  actualFeeCharged: number;
  difference: number;
  isOvercharged: boolean;
  agentName: string;
  agentPhone: string;
  locationBn: string;
  timestamp: string;
  reportedAnonymously: boolean;
}

export interface OverchargeHotspot {
  id: string;
  zoneNameBn: string;
  cityBn: string;
  riskLevel: 'high' | 'medium' | 'low';
  totalReportsCount: number;
  averageOverchargeBn: string;
  coordinatesLabel: string;
  flaggedAgentsCount: number;
}

export type AdminInvestigationStatus = 'new' | 'under_review' | 'resolved';

export interface AgentInvestigationItem {
  id: string;
  agentCode: string;
  agentNameBn: string;
  phoneMasked: string;
  outletAddressBn: string;
  reportsCount: number;
  lastReportedTime: string;
  status: AdminInvestigationStatus;
  penaltyWarningIssued: boolean;
  notesBn?: string;
}

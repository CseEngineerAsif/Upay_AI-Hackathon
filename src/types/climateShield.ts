export type DisasterType = 'flood' | 'cyclone' | 'none';

export type ReliefStatus = 'pending' | 'sent' | 'received';

export interface AffectedDistrictDemand {
  districtBn: string;
  districtEn: string;
  alertLevel: 'danger' | 'warning' | 'standby';
  signalNumberBn: string; // e.g., বিপদ সংকেত ৮
  expectedDemandSurgePct: number; // e.g., +320%
  recommendedAgentFloatBn: string;
  emergencyAgentCount: number;
}

export interface ReliefDisbursementItem {
  id: string;
  programNameBn: string;
  organizationBn: string;
  organizationType: 'govt' | 'ngo' | 'un';
  amount: number;
  disbursedDate: string;
  status: ReliefStatus;
  beneficiaryNidMasked: string;
  referenceNumber: string;
}

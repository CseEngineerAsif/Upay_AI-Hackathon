export interface MockPayslip {
  id: string;
  workerName: string;
  workerRole: string;
  factoryName: string;
  monthYear: string;
  basicSalary: number;
  houseRentAllowance: number;
  medicalAllowance: number;
  conveyanceAllowance: number;
  overtimeHours: number;
  overtimeRatePerHourPaid: number;
  overtimePayTotal: number;
  providentFundDeduction: number;
  unexplainedDeductions: number;
  advanceDeduction: number;
  grossSalary: number;
  netPayableSalary: number;
}

export interface PayslipAuditResult {
  hasInconsistencies: boolean;
  legalHourlyOtRate: number;
  isOvertimeUnderpaid: boolean;
  unexplainedDeductionDetected: boolean;
  simpleExplanationBn: string;
  overtimeAnalysisBn: string;
  deductionAnalysisBn: string;
  warningAlertsBn: string[];
  recommendationBn: string;
  isAiGenerated: boolean;
}

export interface WorkerCashoutSlot {
  slotId: string;
  timeWindowBn: string;
  agentNameBn: string;
  agentLocationBn: string;
  agentPhone: string;
  assignedWorkersCount: number;
  isCurrentUserSlot: boolean;
  crowdLevel: 'low' | 'moderate' | 'high';
  crowdLevelBn: string;
}

export interface AgentTimeSlotDemand {
  slotId: string;
  timeRangeBn: string;
  expectedWorkersCount: number;
  expectedCashDemandBdt: number;
  isCashPrepared: boolean;
  statusBn: string;
}

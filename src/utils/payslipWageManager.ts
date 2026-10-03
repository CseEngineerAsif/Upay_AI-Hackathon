import {
  MockPayslip,
  PayslipAuditResult,
  WorkerCashoutSlot,
  AgentTimeSlotDemand
} from '../types/payslipWageOrchestrator';

export const MOCK_PAYSLIPS: MockPayslip[] = [
  {
    id: 'ps_flagged_1',
    workerName: 'মোঃ রফিক',
    workerRole: 'কোয়ালিটি চেকার',
    factoryName: 'নোভাস গার্মেন্টস লিঃ, গাজীপুর',
    monthYear: 'মার্চ ২০২৬',
    basicSalary: 10500,
    houseRentAllowance: 5250,
    medicalAllowance: 1000,
    conveyanceAllowance: 500,
    overtimeHours: 45,
    overtimeRatePerHourPaid: 67, // Underpaid! Legal rate is ~101
    overtimePayTotal: 3015,
    providentFundDeduction: 600,
    unexplainedDeductions: 750, // Flagged!
    advanceDeduction: 0,
    grossSalary: 20265,
    netPayableSalary: 18915
  },
  {
    id: 'ps_clean_2',
    workerName: 'আনোয়ারা বেগম',
    workerRole: 'সিনিয়র সুইং অপারেটর',
    factoryName: 'অ্যাপেক্স টেক্সটাইল, কোনাবাড়ী',
    monthYear: 'মার্চ ২০২৬',
    basicSalary: 12500,
    houseRentAllowance: 6250,
    medicalAllowance: 1000,
    conveyanceAllowance: 500,
    overtimeHours: 35,
    overtimeRatePerHourPaid: 120.19, // Fair legal rate
    overtimePayTotal: 4206,
    providentFundDeduction: 600,
    unexplainedDeductions: 0,
    advanceDeduction: 0,
    grossSalary: 24456,
    netPayableSalary: 23856
  },
  {
    id: 'ps_flagged_3',
    workerName: 'নাসিমা আক্তার',
    workerRole: 'কাটিং হেল্পার',
    factoryName: 'স্ট্যান্ডার্ড গ্রুপ, সাভার',
    monthYear: 'মার্চ ২০২৬',
    basicSalary: 9000,
    houseRentAllowance: 4500,
    medicalAllowance: 800,
    conveyanceAllowance: 400,
    overtimeHours: 50,
    overtimeRatePerHourPaid: 60, // Underpaid! Legal rate is 86.54
    overtimePayTotal: 3000,
    providentFundDeduction: 450,
    unexplainedDeductions: 600, // Unexplained delay penalty
    advanceDeduction: 0,
    grossSalary: 17700,
    netPayableSalary: 16650
  }
];

export const INITIAL_WORKER_SLOTS: WorkerCashoutSlot[] = [
  {
    slotId: 'slot_1',
    timeWindowBn: 'আজ দুপুর ২:০০ - ২:৪৫',
    agentNameBn: 'সোহাগ টেলিকম ও উপায় পয়েন্ট',
    agentLocationBn: 'মেইন গেট সংলগ্ন, কোনাবাড়ী',
    agentPhone: '০১৭**-***১১৩',
    assignedWorkersCount: 45,
    isCurrentUserSlot: false,
    crowdLevel: 'moderate',
    crowdLevelBn: 'স্বাভাবিক ভিড়'
  },
  {
    slotId: 'slot_2',
    timeWindowBn: 'আজ বিকাল ৩:০০ - ৩:৪৫',
    agentNameBn: 'বিসমিল্লাহ এন্টারপ্রাইজ',
    agentLocationBn: 'স্টেশন রোড, কোনাবাড়ী',
    agentPhone: '০১৮**-***৮৯২',
    assignedWorkersCount: 70,
    isCurrentUserSlot: false,
    crowdLevel: 'high',
    crowdLevelBn: 'বেশি ভিড়'
  },
  {
    slotId: 'slot_3',
    timeWindowBn: 'আজ বিকাল ৪:১৫ - ৪:৪৫',
    agentNameBn: 'মা টেলিকম অ্যান্ড ভ্যারাইটিজ',
    agentLocationBn: 'কোনাবাড়ী গেট-২, গাজীপুর',
    agentPhone: '০১৬**-***৪৫১',
    assignedWorkersCount: 30,
    isCurrentUserSlot: true, // User's assigned slot!
    crowdLevel: 'low',
    crowdLevelBn: 'ভিড় নেই (নির্ধারিত)'
  },
  {
    slotId: 'slot_4',
    timeWindowBn: 'আজ বিকাল ৫:০০ - ৫:৪৫',
    agentNameBn: 'জননী ট্রেডার্স',
    agentLocationBn: 'বাজার মোড়, কোনাবাড়ী',
    agentPhone: '০১৯**-***৭৭৪',
    assignedWorkersCount: 50,
    isCurrentUserSlot: false,
    crowdLevel: 'moderate',
    crowdLevelBn: 'স্বাভাবিক ভিড়'
  }
];

export const INITIAL_AGENT_DEMANDS: AgentTimeSlotDemand[] = [
  {
    slotId: 'agent_slot_1',
    timeRangeBn: 'দুপুর ২:০০ - ৩:০০',
    expectedWorkersCount: 60,
    expectedCashDemandBdt: 720000,
    isCashPrepared: true,
    statusBn: 'ক্যাশ রেডি আছে ✓'
  },
  {
    slotId: 'agent_slot_2',
    timeRangeBn: 'বিকাল ৩:০০ - ৪:০০',
    expectedWorkersCount: 85,
    expectedCashDemandBdt: 1020000,
    isCashPrepared: true,
    statusBn: 'ক্যাশ রেডি আছে ✓'
  },
  {
    slotId: 'agent_slot_3',
    timeRangeBn: 'বিকাল ৪:০০ - ৫:০০ (পিক আওয়ার)',
    expectedWorkersCount: 110,
    expectedCashDemandBdt: 1320000,
    isCashPrepared: false,
    statusBn: 'অতিরিক্ত ৳৩.২ লাখ ক্যাশ প্রয়োজন!'
  },
  {
    slotId: 'agent_slot_4',
    timeRangeBn: 'বিকাল ৫:০০ - ৬:০০',
    expectedWorkersCount: 65,
    expectedCashDemandBdt: 780000,
    isCashPrepared: true,
    statusBn: 'ক্যাশ রেডি আছে ✓'
  }
];

// Labor law rule: Hourly Basic = Basic / 208. Overtime Hourly = Hourly Basic * 2.
export function auditPayslipHeuristic(payslip: MockPayslip): PayslipAuditResult {
  const legalHourlyOtRate = Math.round(((payslip.basicSalary / 208) * 2) * 100) / 100;
  const isOvertimeUnderpaid = payslip.overtimeRatePerHourPaid < (legalHourlyOtRate - 2);
  const unexplainedDeductionDetected = payslip.unexplainedDeductions > 0;
  const hasInconsistencies = isOvertimeUnderpaid || unexplainedDeductionDetected;

  const warnings: string[] = [];
  if (isOvertimeUnderpaid) {
    const lossPerHr = Math.round(legalHourlyOtRate - payslip.overtimeRatePerHourPaid);
    const totalOtLoss = Math.round(lossPerHr * payslip.overtimeHours);
    warnings.push(
      `⚠️ ওভারটাইম রেট কম দেওয়া হয়েছে: শ্রম আইন অনুযায়ী আপনার প্রতি ঘণ্টার ওভারটাইম রেট হওয়া উচিত ৳${legalHourlyOtRate}, কিন্তু দেওয়া হয়েছে ৳${payslip.overtimeRatePerHourPaid}। মোট ${payslip.overtimeHours} ঘণ্টায় আপনার ক্ষতি হয়েছে প্রায় ৳${totalOtLoss.toLocaleString()}!`
    );
  }

  if (unexplainedDeductionDetected) {
    warnings.push(
      `⚠️ ব্যাখ্যাহীন কর্তন পাওয়া গেছে: আপনার বেতন থেকে ৳${payslip.unexplainedDeductions.toLocaleString()} টাকা "বিবিধ/অজানা" খাতে কাটা হয়েছে, যার কোনো আইনি ভিত্তি বা স্পষ্ট ভাউচার উল্লেখ নেই।`
    );
  }

  const simpleExplanationBn = `আপনার মূল বেতন ৳${payslip.basicSalary.toLocaleString()}, বাড়িভাড়া ও ভাতাসহ মোট ৳${(payslip.basicSalary + payslip.houseRentAllowance + payslip.medicalAllowance + payslip.conveyanceAllowance).toLocaleString()}। এর সাথে ${payslip.overtimeHours} ঘণ্টার ওভারটাইম বাবদ ৳${payslip.overtimePayTotal.toLocaleString()} যোগ করা হয়েছে এবং কর্তন বাদ দিয়ে নিট প্রদেয় বেতন দাঁড়িয়েছে ৳${payslip.netPayableSalary.toLocaleString()}।`;

  const overtimeAnalysisBn = isOvertimeUnderpaid
    ? `আইনি ওভারটাইম রেট ৳${legalHourlyOtRate}/ঘণ্টা, কিন্তু আপনি পেয়েছেন ৳${payslip.overtimeRatePerHourPaid}/ঘণ্টা। এটি বেআইনি কর্তন।`
    : `ওভারটাইম হিসাব সম্পূর্ণ সঠিক ও আইনি মানদণ্ড অনুযায়ী দেওয়া হয়েছে (৳${payslip.overtimeRatePerHourPaid}/ঘণ্টা)।`;

  const deductionAnalysisBn = unexplainedDeductionDetected
    ? `প্রভিডেন্ট ফান্ড ৳${payslip.providentFundDeduction} ছাড়াও রহস্যজনকভাবে ৳${payslip.unexplainedDeductions} কাটা হয়েছে।`
    : `শুধুমাত্র স্বীকৃত প্রভিডেন্ট ফান্ড ৳${payslip.providentFundDeduction} কাটা হয়েছে, কোনো অবৈধ কর্তন নেই।`;

  const recommendationBn = hasInconsistencies
    ? 'পরামর্শ: এই অডিট রিপোর্টটি সেভ করে আপনার কারখানার এইচআর (HR) বা শ্রমিক কল্যাণ প্রতিনিধির কাছে পেশ করে বকেয়া পাওনা দাবি করুন।'
    : 'আপনার পে-স্লিপের সকল হিসাব বাংলাদেশ শ্রম আইন অনুযায়ী সম্পূর্ণ নির্ভুল রয়েছে।';

  return {
    hasInconsistencies,
    legalHourlyOtRate,
    isOvertimeUnderpaid,
    unexplainedDeductionDetected,
    simpleExplanationBn,
    overtimeAnalysisBn,
    deductionAnalysisBn,
    warningAlertsBn: warnings,
    recommendationBn,
    isAiGenerated: false
  };
}

export async function auditPayslipWithAi(payslip: MockPayslip): Promise<PayslipAuditResult> {
  try {
    const res = await fetch('/api/payslip/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payslip })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.hasInconsistencies === 'boolean') {
        return data as PayslipAuditResult;
      }
    }
  } catch (err) {
    console.warn('AI Payslip Audit failed, using heuristic fallback:', err);
  }

  return auditPayslipHeuristic(payslip);
}

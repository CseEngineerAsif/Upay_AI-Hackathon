import { GoogleGenAI } from '@google/genai';
import { generateGeminiContentWithFallback } from './geminiHelper';
import { MockPayslip, PayslipAuditResult } from '../src/types/payslipWageOrchestrator';
import { auditPayslipHeuristic } from '../src/utils/payslipWageManager';

export async function auditPayslipWithGemini(
  aiClient: GoogleGenAI | null,
  payslip: MockPayslip
): Promise<PayslipAuditResult> {
  const fallback = auditPayslipHeuristic(payslip);

  if (!aiClient) {
    return fallback;
  }

  try {
    const prompt = `
You are a Bangladesh Labor Law & Garment Worker Payroll Auditor.
Review the following worker's payslip according to the Bangladesh Labor Act 2006:
- Worker: ${payslip.workerName} (${payslip.workerRole}, ${payslip.factoryName})
- Basic Salary: ৳${payslip.basicSalary}
- House Rent & Allowances: ৳${payslip.houseRentAllowance + payslip.medicalAllowance + payslip.conveyanceAllowance}
- Overtime Hours Worked: ${payslip.overtimeHours} hours
- Overtime Rate Paid Per Hour: ৳${payslip.overtimeRatePerHourPaid} (Total OT: ৳${payslip.overtimePayTotal})
- Legal OT Formula in Bangladesh: (Basic Salary / 208) * 2
- Deductions: Provident Fund ৳${payslip.providentFundDeduction}, Unexplained Deductions ৳${payslip.unexplainedDeductions}
- Net Payable: ৳${payslip.netPayableSalary}

Task:
1. Calculate the legal OT rate: (Basic / 208) * 2.
2. Check if the paid OT rate is lower than the legal rate.
3. Check if there are unexplained or arbitrary deductions.
4. Explain the salary calculation in simple, warm, everyday Bangla that an ordinary factory worker can easily understand.
5. Provide clear warnings if any inconsistency is detected.

Respond in strict JSON format:
{
  "hasInconsistencies": true,
  "legalHourlyOtRate": 100.96,
  "isOvertimeUnderpaid": true,
  "unexplainedDeductionDetected": true,
  "simpleExplanationBn": "সহজ ভাষায় বেতনের ব্যাখ্যা...",
  "overtimeAnalysisBn": "ওভারটাইম বিশ্লেষণ...",
  "deductionAnalysisBn": "কর্তন বিশ্লেষণ...",
  "warningAlertsBn": [
    "⚠️ ওভারটাইমে প্রতি ঘণ্টায় ৳৩৪ কম দেওয়া হয়েছে!",
    "⚠️ ৳৭৫০ টাকার কোনো আইনি ব্যাখ্যা নেই!"
  ],
  "recommendationBn": "শ্রমিক প্রতিনিধিদের সাথে কথা বলার পরামর্শ..."
}
`;

    const response = await generateGeminiContentWithFallback(aiClient, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      hasInconsistencies: Boolean(parsed.hasInconsistencies),
      legalHourlyOtRate: Number(parsed.legalHourlyOtRate) || fallback.legalHourlyOtRate,
      isOvertimeUnderpaid: Boolean(parsed.isOvertimeUnderpaid),
      unexplainedDeductionDetected: Boolean(parsed.unexplainedDeductionDetected),
      simpleExplanationBn: parsed.simpleExplanationBn || fallback.simpleExplanationBn,
      overtimeAnalysisBn: parsed.overtimeAnalysisBn || fallback.overtimeAnalysisBn,
      deductionAnalysisBn: parsed.deductionAnalysisBn || fallback.deductionAnalysisBn,
      warningAlertsBn: Array.isArray(parsed.warningAlertsBn) ? parsed.warningAlertsBn : fallback.warningAlertsBn,
      recommendationBn: parsed.recommendationBn || fallback.recommendationBn,
      isAiGenerated: true
    };
  } catch (err) {
    console.warn('Gemini payslip audit error, using fallback:', err);
    return fallback;
  }
}

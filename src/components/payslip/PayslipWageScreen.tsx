import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  MockPayslip,
  PayslipAuditResult,
  WorkerCashoutSlot,
  AgentTimeSlotDemand
} from '../../types/payslipWageOrchestrator';
import {
  MOCK_PAYSLIPS,
  INITIAL_WORKER_SLOTS,
  INITIAL_AGENT_DEMANDS,
  auditPayslipHeuristic,
  auditPayslipWithAi
} from '../../utils/payslipWageManager';

export const PayslipWageScreen: React.FC = () => {
  const { language } = useAppStore();

  const [activeTab, setActiveTab] = useState<'auditor' | 'orchestrator' | 'agent_view'>('auditor');

  // Payslip Auditor State
  const [selectedPayslip, setSelectedPayslip] = useState<MockPayslip>(MOCK_PAYSLIPS[0]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<PayslipAuditResult | null>(null);

  // Manual Editing fields
  const [basicSalary, setBasicSalary] = useState<number>(MOCK_PAYSLIPS[0].basicSalary);
  const [otHours, setOtHours] = useState<number>(MOCK_PAYSLIPS[0].overtimeHours);
  const [otPaidRate, setOtPaidRate] = useState<number>(MOCK_PAYSLIPS[0].overtimeRatePerHourPaid);
  const [unexplainedDed, setUnexplainedDed] = useState<number>(MOCK_PAYSLIPS[0].unexplainedDeductions);

  // Wage-Day Orchestrator State
  const [workerSlots, setWorkerSlots] = useState<WorkerCashoutSlot[]>(INITIAL_WORKER_SLOTS);
  const [agentDemands, setAgentDemands] = useState<AgentTimeSlotDemand[]>(INITIAL_AGENT_DEMANDS);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    // Initial heuristic audit on load
    setAuditResult(auditPayslipHeuristic(selectedPayslip));
  }, []);

  const handleSelectPreset = (ps: MockPayslip) => {
    setSelectedPayslip(ps);
    setBasicSalary(ps.basicSalary);
    setOtHours(ps.overtimeHours);
    setOtPaidRate(ps.overtimeRatePerHourPaid);
    setUnexplainedDed(ps.unexplainedDeductions);

    const initialRes = auditPayslipHeuristic(ps);
    setAuditResult(initialRes);
  };

  const handleRunAiAudit = async () => {
    setIsAuditing(true);
    const updatedPayslip: MockPayslip = {
      ...selectedPayslip,
      basicSalary,
      overtimeHours: otHours,
      overtimeRatePerHourPaid: otPaidRate,
      overtimePayTotal: Math.round(otHours * otPaidRate),
      unexplainedDeductions: unexplainedDed,
      netPayableSalary:
        basicSalary +
        selectedPayslip.houseRentAllowance +
        selectedPayslip.medicalAllowance +
        selectedPayslip.conveyanceAllowance +
        Math.round(otHours * otPaidRate) -
        (selectedPayslip.providentFundDeduction + unexplainedDed)
    };

    try {
      const res = await auditPayslipWithAi(updatedPayslip);
      setAuditResult(res);
      setToastMsg('✓ এআই পে-স্লিপ অডিট সম্পন্ন হয়েছে!');
      setTimeout(() => setToastMsg(null), 3500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleSelectUserSlot = (slotId: string) => {
    const updated = workerSlots.map((s) => ({
      ...s,
      isCurrentUserSlot: s.slotId === slotId
    }));
    setWorkerSlots(updated);
    setToastMsg('✓ আপনার ক্যাশ-আউট স্লট সফলভাবে পরিবর্তন করা হয়েছে!');
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleToggleAgentCash = (slotId: string) => {
    const updated = agentDemands.map((d) => {
      if (d.slotId === slotId) {
        const nextState = !d.isCashPrepared;
        return {
          ...d,
          isCashPrepared: nextState,
          statusBn: nextState ? 'ক্যাশ রেডি আছে ✓' : 'অতিরিক্ত ক্যাশ প্রয়োজন!'
        };
      }
      return d;
    });
    setAgentDemands(updated);
  };

  const myAssignedSlot = workerSlots.find((s) => s.isCurrentUserSlot) || workerSlots[2];

  return (
    <div className="w-full flex-1 flex flex-col bg-slate-50 overflow-y-auto no-scrollbar pb-24 select-none">
      {/* Top Banner */}
      <div className="w-full bg-gradient-to-r from-[#0B4DA2] via-[#08336A] to-[#0B4DA2] text-white px-4 pt-5 pb-5 shadow-md relative overflow-hidden">
        {/* Glow circles */}
        <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-amber-400/15 blur-xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-emerald-400/15 blur-xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center text-xl border border-white/20">
                👔
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base font-black tracking-tight text-white">
                    {language === 'bn' ? 'পে-স্লিপ ও ওয়েজ-ডে' : 'Payslip & Wage-Day'}
                  </h1>
                  <span className="px-1.5 py-0.2 rounded-full bg-[#FFD600] text-slate-950 text-[9px] font-black uppercase">
                    Worker Aid
                  </span>
                </div>
                <p className="text-[11px] text-blue-100 font-medium">
                  {language === 'bn'
                    ? 'শ্রমিকদের পে-স্লিপ নির্ভুলতা অডিট ও বেতন দিনে ভিড়হীন ক্যাশ-আউট'
                    : 'Garment Worker Payslip Auditor & Staggered Cashout Orchestrator'}
                </p>
              </div>
            </div>

            <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
              শ্রম আইন ২০০৬
            </span>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-black/25 p-1 rounded-2xl border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('auditor')}
              className={`py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'auditor'
                  ? 'bg-white text-[#0B4DA2] shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              পে-স্লিপ অডিট 🔍
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('orchestrator')}
              className={`py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'orchestrator'
                  ? 'bg-white text-[#0B4DA2] shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              আমার স্লট 🕒
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('agent_view')}
              className={`py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'agent_view'
                  ? 'bg-white text-[#0B4DA2] shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              এজেন্ট ভিউ 🏪
            </button>
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="bg-emerald-600 text-white text-xs px-4 py-2.5 text-center font-bold animate-fade-in shadow-xs">
          {toastMsg}
        </div>
      )}

      {/* Main Body */}
      <div className="px-4 py-4 space-y-4 text-xs">
        {/* ================= PART A: PAYSLIP AUDITOR ================= */}
        {activeTab === 'auditor' && (
          <div className="space-y-4">
            {/* Preset Selector */}
            <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
              <span className="font-bold text-slate-800 block text-xs">
                নমুনা পে-স্লিপ নির্বাচন করুন (বা নিজে এডিট করুন):
              </span>
              <div className="grid grid-cols-1 gap-2">
                {MOCK_PAYSLIPS.map((ps) => (
                  <button
                    key={ps.id}
                    type="button"
                    onClick={() => handleSelectPreset(ps)}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                      selectedPayslip.id === ps.id
                        ? 'bg-blue-50/70 border-[#0B4DA2]'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-xs">{ps.workerName}</span>
                        <span className="text-[10px] text-slate-500">({ps.workerRole})</span>
                        {ps.unexplainedDeductions > 0 || ps.overtimeRatePerHourPaid < 100 ? (
                          <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800 text-[8px] font-black">
                            অসঙ্গতি আছে ⚠️
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[8px] font-black">
                            সঠিক ✓
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {ps.factoryName} • মূল বেতন: ৳{ps.basicSalary.toLocaleString()}
                      </span>
                    </div>
                    <span className="font-mono font-black text-xs text-[#0B4DA2]">
                      ৳{ps.netPayableSalary.toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Editable Form Inputs */}
            <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-slate-900 text-xs">বেতন ও কর্তনের বিবরণ সমন্বয়</h4>
                <span className="text-[10px] text-slate-400">এডিট করার সুবিধা</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 block">মূল বেতন (৳):</label>
                  <input
                    type="number"
                    value={basicSalary}
                    onChange={(e) => setBasicSalary(Number(e.target.value) || 0)}
                    className="w-full p-2 rounded-xl border border-slate-200 font-mono font-bold text-xs text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 block">ওভারটাইম ঘণ্টা:</label>
                  <input
                    type="number"
                    value={otHours}
                    onChange={(e) => setOtHours(Number(e.target.value) || 0)}
                    className="w-full p-2 rounded-xl border border-slate-200 font-mono font-bold text-xs text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 block">
                    প্রদেয় ওটি রেট (৳/ঘণ্টা):
                  </label>
                  <input
                    type="number"
                    value={otPaidRate}
                    onChange={(e) => setOtPaidRate(Number(e.target.value) || 0)}
                    className="w-full p-2 rounded-xl border border-slate-200 font-mono font-bold text-xs text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-rose-600 block">
                    ব্যাখ্যাহীন কর্তন (৳):
                  </label>
                  <input
                    type="number"
                    value={unexplainedDed}
                    onChange={(e) => setUnexplainedDed(Number(e.target.value) || 0)}
                    className="w-full p-2 rounded-xl border border-rose-200 font-mono font-bold text-xs text-rose-900"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleRunAiAudit}
                disabled={isAuditing}
                className="w-full py-2.5 rounded-2xl bg-[#0B4DA2] hover:bg-blue-800 text-white font-black text-xs shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isAuditing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>এআই অডিট বিশ্লেষণ চলছে...</span>
                  </>
                ) : (
                  <>
                    <span>🤖</span>
                    <span>এআই দিয়ে পে-স্লিপ অডিট ও যাচাই করুন</span>
                  </>
                )}
              </button>
            </div>

            {/* AUDIT RESULTS WITH SIMPLE BANGLA & WARNINGS (Core Requirement) */}
            {auditResult && (
              <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-md space-y-3 animate-scale-up">
                {/* Status Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {auditResult.hasInconsistencies ? '⚠️' : '✅'}
                    </span>
                    <div>
                      <h4 className="font-black text-slate-900 text-xs">
                        {auditResult.hasInconsistencies
                          ? 'পে-স্লিপে অসঙ্গতি ও বেআইনি কর্তন শনাক্ত!'
                          : 'পে-স্লিপ সম্পূর্ণ সঠিক ও নির্ভুল'}
                      </h4>
                      <span className="text-[10px] text-slate-400">
                        বাংলাদেশ শ্রম আইন ২০০৬ অনুযায়ী বিশ্লেষিত
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full font-black text-[9px] ${
                      auditResult.hasInconsistencies
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {auditResult.hasInconsistencies ? 'সতর্কতা জরুরি' : 'স্বীকৃত'}
                  </span>
                </div>

                {/* Clear Warning Alerts (Core Requirement) */}
                {auditResult.warningAlertsBn.length > 0 && (
                  <div className="space-y-1.5">
                    {auditResult.warningAlertsBn.map((warn, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 text-[11px] leading-relaxed font-semibold flex items-start gap-1.5"
                      >
                        <span>🚨</span>
                        <span>{warn}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Simple Bangla Explanation (Core Requirement) */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    সহজ বাংলায় হিসাবের বিবরণ:
                  </span>
                  <p className="text-slate-800 leading-relaxed text-[11px]">
                    {auditResult.simpleExplanationBn}
                  </p>
                </div>

                {/* Legal Overtime Rate Comparison */}
                <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-1.5 text-[11px]">
                  <span className="font-bold text-indigo-950 block text-xs">
                    ⚖️ আইনি ওভারটাইম রেট তুলনা:
                  </span>
                  <div className="flex justify-between text-indigo-900">
                    <span>শ্রম আইন অনুযায়ী ন্যূনতম ওটি রেট:</span>
                    <span className="font-mono font-bold text-emerald-700">
                      ৳{auditResult.legalHourlyOtRate}/ঘণ্টা
                    </span>
                  </div>
                  <div className="flex justify-between text-indigo-900">
                    <span>পে-স্লিপে প্রদত্ত ওটি রেট:</span>
                    <span className="font-mono font-bold text-rose-600">
                      ৳{otPaidRate}/ঘণ্টা
                    </span>
                  </div>
                  <p className="text-[10px] text-indigo-800 pt-1 border-t border-indigo-200">
                    {auditResult.overtimeAnalysisBn}
                  </p>
                </div>

                {/* Recommendation */}
                <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-[10px] flex items-start gap-2">
                  <span className="text-base leading-none">💡</span>
                  <p className="leading-relaxed">
                    <strong>শ্রমিক সুরক্ষা পরামর্শ:</strong> {auditResult.recommendationBn}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= PART B: WAGE-DAY ORCHESTRATOR ================= */}
        {activeTab === 'orchestrator' && (
          <div className="space-y-4">
            {/* PROMINENT ASSIGNED CASHOUT TIME SLOT NOTIFICATION (Core Requirement) */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 text-white shadow-lg space-y-3 relative overflow-hidden animate-scale-up">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl">🔔</span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-200">
                    বেতন দিন লাইভ নোটিফিকেশন
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-bold text-[9px] backdrop-blur-xs">
                  ভিড়মুক্ত স্লট
                </span>
              </div>

              <div>
                <span className="text-xs text-emerald-100 font-medium block">
                  আপনার ক্যাশ-আউটের নির্ধারিত সময়:
                </span>
                <h3 className="font-mono font-black text-2xl text-white mt-0.5">
                  {myAssignedSlot.timeWindowBn}
                </h3>
              </div>

              <div className="p-3 rounded-2xl bg-black/20 border border-white/10 space-y-1 text-xs text-emerald-50">
                <div className="flex justify-between">
                  <span>নির্ধারিত এজেন্ট:</span>
                  <span className="font-bold text-white">{myAssignedSlot.agentNameBn}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>লোকেশন:</span>
                  <span>{myAssignedSlot.agentLocationBn}</span>
                </div>
                <div className="flex justify-between text-[11px] pt-1 border-t border-white/10">
                  <span>বর্তমান ভিড়:</span>
                  <span className="font-bold text-amber-300">
                    {myAssignedSlot.crowdLevelBn} ({myAssignedSlot.assignedWorkersCount} জন)
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-emerald-100">
                * অনুগ্রহ করে নির্ধারিত সময়ে এজেন্ট পয়েন্টে উপস্থিত হোন। এর ফলে লাইনে দাঁড়িয়ে ভোগান্তি ও ক্যাশ স্বল্পতা এড়ানো সম্ভব হবে।
              </p>
            </div>

            {/* Other Available Slots to Reschedule / Stagger */}
            <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-slate-900 text-xs">
                  অন্যান্য সময় বা এজেন্টে স্লট পরিবর্তন (Reschedule)
                </h4>
                <span className="text-[10px] text-slate-400">৪টি স্লট চালু</span>
              </div>

              <div className="space-y-2">
                {workerSlots.map((slot) => (
                  <div
                    key={slot.slotId}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                      slot.isCurrentUserSlot
                        ? 'bg-emerald-50 border-emerald-400 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-xs">
                          {slot.timeWindowBn}
                        </span>
                        {slot.isCurrentUserSlot && (
                          <span className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-white font-black text-[8px]">
                            আপনার স্লট
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {slot.agentNameBn} ({slot.agentLocationBn})
                      </span>
                      <span
                        className={`text-[9px] font-bold mt-0.5 inline-block ${
                          slot.crowdLevel === 'high'
                            ? 'text-rose-600'
                            : slot.crowdLevel === 'moderate'
                            ? 'text-amber-600'
                            : 'text-emerald-700'
                        }`}
                      >
                        {slot.crowdLevelBn} • {slot.assignedWorkersCount} জন বরাদ্দ
                      </span>
                    </div>

                    {!slot.isCurrentUserSlot && (
                      <button
                        type="button"
                        onClick={() => handleSelectUserSlot(slot.slotId)}
                        className="px-2.5 py-1 rounded-xl bg-slate-200 hover:bg-[#0B4DA2] hover:text-white text-slate-800 font-bold text-[10px] active:scale-95 transition-all cursor-pointer"
                      >
                        স্লট নিন
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= PART B (AGENT VIEW): PRE-CASH DEMAND PREPARATION ================= */}
        {activeTab === 'agent_view' && (
          <div className="space-y-4">
            <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏪</span>
                  <div>
                    <h4 className="font-black text-slate-900 text-xs">
                      এজেন্ট প্রি-ক্যাশ ও ডিমান্ড ম্যানেজমেন্ট
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      মা টেলিকম অ্যান্ড ভ্যারাইটিজ (এজেন্ট আইডি: AG-7721)
                    </p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#0B4DA2] font-black text-[9px]">
                  আজকের মোট চাহিদা: ৳৩৮.৪ লাখ
                </span>
              </div>
              <p className="text-[10px] text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                শ্রমিকদের সুনির্দিষ্ট সময় স্লট অনুযায়ী আগাম ক্যাশের পূর্বাভাস দেখে কাউন্টারে পর্যাপ্ত নগদ টাকা প্রস্তুত রাখুন, যাতে বেতন দিনে ক্যাশ ক্রাইসিস তৈরি না হয়।
              </p>
            </div>

            {/* Demand per Time Slot Cards */}
            <div className="space-y-2.5">
              {agentDemands.map((demand) => (
                <div
                  key={demand.slotId}
                  className={`p-3.5 rounded-2xl border shadow-2xs space-y-2 transition-all ${
                    demand.isCashPrepared
                      ? 'bg-white border-emerald-300'
                      : 'bg-rose-50/50 border-rose-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">🕒</span>
                        <h5 className="font-bold text-slate-900 text-xs">{demand.timeRangeBn}</h5>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        প্রত্যাশিত শ্রমিক সংখ্যা: <strong>{demand.expectedWorkersCount} জন</strong>
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-black text-sm text-[#0B4DA2] block">
                        ৳{demand.expectedCashDemandBdt.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-slate-400">ক্যাশ চাহিদা</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                    <span
                      className={`font-bold ${
                        demand.isCashPrepared ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {demand.statusBn}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleAgentCash(demand.slotId)}
                      className={`px-3 py-1 rounded-xl font-bold cursor-pointer active:scale-95 transition-all ${
                        demand.isCashPrepared
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                      }`}
                    >
                      {demand.isCashPrepared ? 'স্ট্যাটাস বদলান' : '✓ ক্যাশ রেডি মার্ক করুন'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { useAppStore } from '../../store/useAppStore';
import {
  computeBusinessImpact,
  DEFAULT_IMPACT_INPUTS,
  ImpactModelInputs,
  EVAL_REPORT
} from '../../utils/impactModel';
import { SUCCESS_METRICS } from '../../config/successMetrics';

interface ImpactDashboardProps {
  onClose: () => void;
  onSwitchToQueue?: () => void;
}

export const ImpactDashboardModal: React.FC<ImpactDashboardProps> = ({
  onClose,
  onSwitchToQueue
}) => {
  const { language } = useAppStore();
  const isBn = language === 'bn';

  // State for all 7 editable model inputs
  const [inputs, setInputs] = useState<ImpactModelInputs>(DEFAULT_IMPACT_INPUTS);
  const [showAssumptions, setShowAssumptions] = useState(true);
  const [showHowWeMeasure, setShowHowWeMeasure] = useState(false);

  // Live calculated business impact
  const impact = useMemo(() => computeBusinessImpact(inputs), [inputs]);

  // Handle input changes
  const handleInputChange = (field: keyof ImpactModelInputs, val: number) => {
    setInputs((prev) => ({
      ...prev,
      [field]: isNaN(val) ? 0 : Math.max(0, val)
    }));
  };

  const handleReset = () => {
    setInputs(DEFAULT_IMPACT_INPUTS);
  };

  // Chart 1: Financial Comparison (Baseline vs Ours: Loss Prevented & Friction Cost)
  const comparisonChartData = [
    {
      name: isBn ? 'জেনেরিক সতর্কতা (Baseline)' : 'Baseline (Generic)',
      prevented: impact.baselineFraudLossPreventedBdt,
      frictionCost: impact.baselineOperationalCostBdt
    },
    {
      name: isBn ? 'রিকার্শন পে এআই (Ours)' : 'Ours (Safe AI + Cooling)',
      prevented: impact.estimatedFraudLossPreventedBdt,
      frictionCost: impact.totalOperationalCostBdt
    }
  ];

  // Chart 2: Per-Region Recall Bar Chart (Dhaka, Chattogram, Sylhet, Rajshahi, Khulna, Barishal)
  const regionalChartData = Object.entries(EVAL_REPORT.regions).map(([region, stat]) => ({
    region,
    recall: stat.recall,
    precision: stat.precision,
    prevented: stat.lossPreventedBdt
  }));

  // Chart 3: Recall-vs-FPR Curve (Ours vs Baseline)
  const rocChartData = EVAL_REPORT.rocCurveSampled || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-2">
      <div className="w-full max-w-[440px] sm:max-w-[480px] bg-slate-900 text-white rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[94vh] animate-scale-up border border-slate-700/80">
        {/* Header */}
        <div className="px-4 py-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 border-b border-slate-700/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center text-base shadow-xs shrink-0">
              📊
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <h2 className="text-sm font-black text-white truncate">
                  {isBn ? 'বিজনেস ও কাস্টমার ইমপ্যাক্ট' : 'Business & Customer Impact'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/50">
                  SIMULATED (synthetic data)
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                {isBn
                  ? `${EVAL_REPORT.dataset.totalSamples.toLocaleString()} সিন্থেটিক লেনদেন (Seed ${EVAL_REPORT.dataset.randomSeed}) ও LightGBM মডেল থেকে গণনাকৃত`
                  : `Computed from ${EVAL_REPORT.dataset.totalSamples.toLocaleString()} synthetic txs (Seed ${EVAL_REPORT.dataset.randomSeed}) in reports/impact_eval.json`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Sub-bar: Tab switcher & How we measure link */}
        <div className="px-4 py-2 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center gap-2">
            {onSwitchToQueue && (
              <button
                onClick={onSwitchToQueue}
                className="px-3 py-1 rounded-full font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-700 transition-all cursor-pointer"
              >
                {isBn ? '← রিস্ক কিউ' : '← Risk Queue'}
              </button>
            )}
            <span className="px-3 py-1 rounded-full font-black text-amber-300 bg-amber-500/20 border border-amber-500/40 shadow-xs">
              {isBn ? 'ইমপ্যাক্ট ড্যাশবোর্ড' : 'Impact Analytics'}
            </span>
          </div>

          <button
            onClick={() => setShowHowWeMeasure(true)}
            className="text-[11px] font-bold text-sky-400 hover:text-sky-300 underline flex items-center gap-1 cursor-pointer"
          >
            <span>📏</span>
            <span>{isBn ? 'পরিমাপ পদ্ধতি (How we measure)' : 'How we measure'}</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4 text-xs">
          {/* Prominent Simulated Data Notice */}
          <div className="p-2.5 rounded-2xl bg-amber-950/40 border border-amber-600/40 flex items-start gap-2.5">
            <span className="text-base text-amber-400 shrink-0">⚠️</span>
            <div className="text-[10.5px] leading-relaxed text-amber-200">
              <span className="font-bold text-amber-300">
                {isBn ? 'SIMULATED (synthetic data):' : 'SIMULATED (synthetic data):'}
              </span>{' '}
              {isBn
                ? 'এই ড্যাশবোর্ডের প্রতিটি সংখ্যা reports/impact_eval.json এবং পরিবর্তনযোগ্য অনুমিতি (Assumptions) থেকে সরাসরি গণনাকৃত। কোনো পরিসংখ্যান কাল্পনিক নয়।'
                : 'Every figure below is computed from reports/impact_eval.json and audited assumptions. No statistics are invented.'}
            </div>
          </div>

          {/* 5 KPI Cards with Audited Assumptions Listed Next to Results */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* KPI 1: Fraud Loss Prevented */}
            <div className="col-span-2 p-3 rounded-2xl bg-slate-800/90 border border-emerald-500/30 shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10.5px] font-bold text-emerald-400">
                  {isBn ? '১. প্রতিরোধকৃত ফ্রড ক্ষতি (Fraud Loss Prevented)' : '1. Fraud Loss Prevented (Monthly)'}
                </span>
                <span className="text-[8.5px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  SIMULATED (synthetic data)
                </span>
              </div>
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-black font-mono text-white">
                  ৳{impact.estimatedFraudLossPreventedBdt.toLocaleString()}
                </span>
                <span className="text-[10.5px] text-emerald-400 font-bold">
                  (+৳{impact.incrementalLossPreventedBdt.toLocaleString()} vs Baseline ৳{impact.baselineFraudLossPreventedBdt.toLocaleString()})
                </span>
              </div>
              <p className="text-[9.5px] text-slate-300 mt-1 font-mono bg-slate-900/70 px-2 py-1 rounded-lg border border-slate-700/70">
                {isBn
                  ? `সূত্র: ${inputs.monthlyTransactions.toLocaleString()} লেনদেন × ${inputs.fraudRatePercent}% ফ্রড × ${impact.operationalRecallPercent}% রিকল × ${inputs.warnedUsersCancelRatePercent}% বাতিল × ৳${inputs.avgFraudAmountBdt.toLocaleString()}`
                  : `Audit: ${inputs.monthlyTransactions.toLocaleString()} tx × ${inputs.fraudRatePercent}% fraud × ${impact.operationalRecallPercent}% recall × ${inputs.warnedUsersCancelRatePercent}% cancel × ৳${inputs.avgFraudAmountBdt.toLocaleString()}`}
              </p>
            </div>

            {/* KPI 2: False-Positive Cost */}
            <div className="p-3 rounded-2xl bg-slate-800/90 border border-slate-700 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-amber-300">
                    {isBn ? '২. ভুল সতর্কতার খরচ' : '2. False-Positive Cost'}
                  </span>
                  <span className="text-[7.5px] font-mono px-1 rounded bg-amber-500/20 text-amber-300">
                    SIMULATED
                  </span>
                </div>
                <span className="text-base font-black font-mono text-amber-400 block">
                  ৳{impact.falsePositiveCostBdt.toLocaleString()}
                </span>
              </div>
              <span className="text-[8.5px] text-slate-400 block mt-1 font-mono">
                {impact.falseAlertsCount.toLocaleString()} FPs ({impact.operationalFprPercent}% FPR) × ৳{inputs.costPerFalseAlertBdt} + ৳{impact.analystReviewCostBdt.toLocaleString()} review
              </span>
            </div>

            {/* KPI 3: Net Savings & ROI */}
            <div className="p-3 rounded-2xl bg-slate-800/90 border border-sky-500/30 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-sky-400">
                    {isBn ? '৩. নেট সেভিংস ও ROI' : '3. Net Savings & ROI'}
                  </span>
                  <span className="text-[7.5px] font-mono px-1 rounded bg-sky-500/20 text-sky-300">
                    SIMULATED
                  </span>
                </div>
                <span className="text-base font-black font-mono text-white block">
                  ৳{impact.netSavingsBdt.toLocaleString()}
                </span>
              </div>
              <span className="text-[8.5px] text-emerald-400 font-bold block mt-1 font-mono">
                ROI: {impact.roiPercent}% | Retention: +৳{impact.retentionValueBdt.toLocaleString()}
              </span>
            </div>

            {/* KPI 4: Scam Recall @ 1% FPR */}
            <div className="p-3 rounded-2xl bg-slate-800/90 border border-purple-500/30 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-purple-400">
                    {isBn ? '৪. রিকল @ ১% FPR' : '4. Scam Recall @ 1% FPR'}
                  </span>
                  <span className="text-[7.5px] font-mono px-1 rounded bg-purple-500/20 text-purple-300">
                    SIMULATED
                  </span>
                </div>
                <span className="text-base font-black font-mono text-white block">
                  {impact.scamRecallAt1FprPercent}%
                </span>
              </div>
              <span className="text-[8.5px] text-purple-300 block mt-1 font-mono">
                @ 5% FPR: {impact.scamRecallAt5FprPercent}% | Baseline @1%: {EVAL_REPORT.comparison.baseline.recallAt1Fpr}%
              </span>
            </div>

            {/* KPI 5: Transaction Completion Rate After Warning */}
            <div className="p-3 rounded-2xl bg-slate-800/90 border border-teal-500/30 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-teal-400">
                    {isBn ? '৫. লেনদেন সম্পন্ন হার' : '5. Completion Rate'}
                  </span>
                  <span className="text-[7.5px] font-mono px-1 rounded bg-teal-500/20 text-teal-300">
                    SIMULATED
                  </span>
                </div>
                <span className="text-base font-black font-mono text-white block">
                  {impact.transactionCompletionRateAfterWarningPercent}%
                </span>
              </div>
              <span className="text-[8.5px] text-slate-400 block mt-1 font-mono">
                {isBn
                  ? `বৈধ সতর্কতায় সম্পন্ন (Baseline: ${EVAL_REPORT.comparison.baseline.completionRateAfterWarningPercent}%)`
                  : `After warning (vs ${EVAL_REPORT.comparison.baseline.completionRateAfterWarningPercent}% baseline)`}
              </span>
            </div>
          </div>

          {/* Collapsible Assumptions Panel with 7 Editable Inputs */}
          <div className="rounded-2xl bg-slate-800/95 border border-amber-500/30 overflow-hidden shadow-sm">
            <button
              onClick={() => setShowAssumptions(!showAssumptions)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span>⚙️</span>
                <span className="font-bold text-xs text-white">
                  {isBn
                    ? 'অনুমিতি ও ইন্টারেক্টিভ ক্যালকুলেটর (Assumptions & Editable Inputs)'
                    : 'Assumptions Panel (Editable Inputs — Live Recalculation)'}
                </span>
              </div>
              <span className="text-amber-300 text-[10px] font-bold">
                {showAssumptions ? (isBn ? '▲ গুটিয়ে নিন' : '▲ Collapse') : (isBn ? '▼ প্রসারিত করুন' : '▼ Expand')}
              </span>
            </button>

            {showAssumptions && (
              <div className="p-4 pt-2 border-t border-slate-700/70 space-y-3 bg-slate-900/70">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-300">
                    {isBn
                      ? 'যেকোনো ইনপুট পরিবর্তন করলে তাৎক্ষণিকভাবে সব KPI ও চার্ট আপডেট হবে:'
                      : 'Edit any assumption below to recalculate KPIs and charts in real time:'}
                  </span>
                  <button
                    onClick={handleReset}
                    className="text-[10px] font-bold text-sky-400 hover:underline cursor-pointer shrink-0"
                  >
                    {isBn ? 'ডিফল্টে রিসেট করুন' : 'Reset Defaults'}
                  </button>
                </div>

                {/* All 7 Editable Input Fields with Defaults Shown */}
                <div className="grid grid-cols-2 gap-2.5 text-[10.5px]">
                  <div>
                    <label className="text-slate-300 block mb-0.5">
                      {isBn ? '১. গড় ফ্রড অঙ্ক (BDT)' : '1. Avg Fraud Amount (BDT)'}{' '}
                      <span className="text-[9px] text-slate-500">(Def: ৳{DEFAULT_IMPACT_INPUTS.avgFraudAmountBdt})</span>
                    </label>
                    <input
                      type="number"
                      value={inputs.avgFraudAmountBdt}
                      onChange={(e) => handleInputChange('avgFraudAmountBdt', parseFloat(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-0.5">
                      {isBn ? '২. ফ্রড রেট (%)' : '2. Fraud Rate (%)'}{' '}
                      <span className="text-[9px] text-slate-500">(Def: {DEFAULT_IMPACT_INPUTS.fraudRatePercent}%)</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={inputs.fraudRatePercent}
                      onChange={(e) => handleInputChange('fraudRatePercent', parseFloat(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-0.5">
                      {isBn ? '৩. মাসিক লেনদেন সংখ্যা' : '3. Monthly Transactions'}{' '}
                      <span className="text-[9px] text-slate-500">(Def: {DEFAULT_IMPACT_INPUTS.monthlyTransactions.toLocaleString()})</span>
                    </label>
                    <input
                      type="number"
                      step="1000"
                      value={inputs.monthlyTransactions}
                      onChange={(e) => handleInputChange('monthlyTransactions', parseInt(e.target.value, 10))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-0.5">
                      {isBn ? '৪. প্রতি ভুল অ্যালার্ট খরচ (BDT)' : '4. Cost per False Alert (BDT)'}{' '}
                      <span className="text-[9px] text-slate-500">(Def: ৳{DEFAULT_IMPACT_INPUTS.costPerFalseAlertBdt})</span>
                    </label>
                    <input
                      type="number"
                      value={inputs.costPerFalseAlertBdt}
                      onChange={(e) => handleInputChange('costPerFalseAlertBdt', parseFloat(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-0.5">
                      {isBn ? '৫. অ্যানালিস্ট রিভিউ খরচ (BDT)' : '5. Analyst Cost/Review (BDT)'}{' '}
                      <span className="text-[9px] text-slate-500">(Def: ৳{DEFAULT_IMPACT_INPUTS.analystCostPerReviewBdt})</span>
                    </label>
                    <input
                      type="number"
                      value={inputs.analystCostPerReviewBdt}
                      onChange={(e) => handleInputChange('analystCostPerReviewBdt', parseFloat(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-0.5">
                      {isBn ? '৬. স্ক্যাম বাতিল হার (%)' : '6. % Warned Cancel Scam'}{' '}
                      <span className="text-[9px] text-slate-500">(Def: {DEFAULT_IMPACT_INPUTS.warnedUsersCancelRatePercent}%)</span>
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={inputs.warnedUsersCancelRatePercent}
                      onChange={(e) => handleInputChange('warnedUsersCancelRatePercent', parseFloat(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-slate-300 block mb-0.5">
                      {isBn ? '৭. রিটেনশন আপলিফট অনুমিতি (%)' : '7. Retention Uplift Assumption (%)'}{' '}
                      <span className="text-[9px] text-slate-500">(Default: {DEFAULT_IMPACT_INPUTS.retentionUpliftPercent}%)</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={inputs.retentionUpliftPercent}
                      onChange={(e) => handleInputChange('retentionUpliftPercent', parseFloat(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Audited Assumptions Table */}
                <div className="pt-2 border-t border-slate-800 space-y-1.5">
                  <h4 className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                    {isBn ? 'অডিট তালিকা (Audited Assumptions & Ground Truth):' : 'Audited Assumptions & Ground-Truth Sources:'}
                  </h4>
                  <div className="space-y-1">
                    {impact.assumptions.map((a) => (
                      <div
                        key={a.key}
                        className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/90 flex flex-col gap-0.5 text-[9.5px]"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200">{isBn ? a.labelBn : a.labelEn}</span>
                          <span className="font-mono font-bold text-emerald-300">{a.value}</span>
                        </div>
                        <div className="flex items-center justify-between text-[8.5px] text-slate-400">
                          <span>{a.formulaOrNote}</span>
                          <span className="font-mono text-amber-300/90">{a.source}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chart 1: Baseline vs Ours (Loss Prevented & Friction Cost) */}
          <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-200">
                {isBn ? '১. বেসলাইন বনাম আমাদের এআই (প্রতিরোধকৃত ক্ষতি)' : '1. Baseline vs Ours (Loss Prevented BDT)'}
              </h3>
              <span className="text-[8.5px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                SIMULATED
              </span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 9 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 9 }} tickFormatter={(v) => `৳${Math.round(v / 1000)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 10 }}
                    formatter={(val: any) => `৳${Number(val).toLocaleString()} BDT`}
                  />
                  <Legend wrapperStyle={{ fontSize: 10, paddingTop: 6 }} />
                  <Bar
                    dataKey="prevented"
                    name={isBn ? 'প্রতিরোধকৃত ফ্রড (Loss Prevented)' : 'Loss Prevented (BDT)'}
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="frictionCost"
                    name={isBn ? 'ভুল সতর্কতা ও অপারেশন খরচ' : 'False-Alert & Review Cost'}
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Recall-vs-FPR Curve */}
          <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-200">
                {isBn ? '২. রিকল বনাম ভুল সতর্কতা কার্ভ (Recall vs FPR)' : '2. Recall-vs-FPR Curve (Ours vs Baseline)'}
              </h3>
              <span className="text-[8.5px] font-mono px-1.5 py-0.5 rounded bg-purple-900/50 text-purple-300 border border-purple-700">
                PR-AUC: {EVAL_REPORT.metrics.prAuc} • SIMULATED
              </span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rocChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="fprPercent" stroke="#94a3b8" tick={{ fontSize: 9 }} unit="%" />
                  <YAxis stroke="#94a3b8" domain={[0, 100]} tick={{ fontSize: 9 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 10 }}
                    formatter={(val: any) => `${val}%`}
                    labelFormatter={(label) => `FPR: ${label}%`}
                  />
                  <Legend wrapperStyle={{ fontSize: 10, paddingTop: 6 }} />
                  <Line
                    type="monotone"
                    dataKey="recallPercent"
                    name={isBn ? 'আমাদের এআই রিকল (Ours %)' : 'Ours Recall %'}
                    stroke="#ec4899"
                    strokeWidth={2.5}
                    dot={{ r: 2.5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="baselineRecallPercent"
                    name={isBn ? 'জেনেরিক বেসলাইন (Baseline %)' : 'Baseline Recall %'}
                    stroke="#64748b"
                    strokeWidth={1.8}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Per-Region Recall Bar Chart */}
          <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-200">
                {isBn ? '৩. বিভাগভিত্তিক রিকল (Per-Region Recall)' : '3. Per-Region Recall Bar Chart (%)'}
              </h3>
              <span className="text-[8.5px] font-mono px-1.5 py-0.5 rounded bg-slate-700 text-amber-300">
                6 Regions • SIMULATED
              </span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionalChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="region" stroke="#94a3b8" tick={{ fontSize: 9 }} />
                  <YAxis stroke="#94a3b8" domain={[0, 100]} tick={{ fontSize: 9 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 10 }}
                    formatter={(val: any) => `${val}%`}
                  />
                  <Legend wrapperStyle={{ fontSize: 10, paddingTop: 6 }} />
                  <Bar
                    dataKey="recall"
                    name={isBn ? 'রিকল (Recall %)' : 'Recall %'}
                    fill="#8b5cf6"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="precision"
                    name={isBn ? 'প্রিসিশন (Precision %)' : 'Precision %'}
                    fill="#38bdf8"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0 text-xs">
          <span className="text-[10px] text-slate-400">
            {isBn ? 'রিপোর্ট জেনারেট কমান্ড:' : 'Reproduce report:'}{' '}
            <code className="text-amber-400 font-mono">npm run evaluate</code>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer transition-colors"
          >
            {isBn ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>

      {/* Modal: How We Measure (Success Metrics Definition from src/config/successMetrics.ts) */}
      {showHowWeMeasure && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3">
          <div className="w-full max-w-[430px] bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl max-h-[88vh] overflow-y-auto no-scrollbar space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>📏</span>
                  <span>{isBn ? 'পরিমাপ পদ্ধতি (How We Measure)' : 'How We Measure Success'}</span>
                </h3>
                <span className="text-[9.5px] text-amber-300 font-mono">
                  src/config/successMetrics.ts • SIMULATED (synthetic data)
                </span>
              </div>
              <button
                onClick={() => setShowHowWeMeasure(false)}
                className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-[10.5px] text-slate-300 leading-relaxed">
              {isBn
                ? 'রিকার্শন পে-এর প্রতিটি সাফল্যের সূচক, গাণিতিক সূত্র ও লক্ষ্যমাত্রা src/config/successMetrics.ts ফাইলে সংজ্ঞায়িত এবং reports/impact_eval.json থেকে স্বয়ংক্রিয়ভাবে যাচাইকৃত।'
                : 'Each metric definition, mathematical formula, and target threshold is defined in src/config/successMetrics.ts and computed from reports/impact_eval.json.'}
            </p>

            <div className="space-y-3">
              {SUCCESS_METRICS.map((metric) => (
                <div
                  key={metric.id}
                  className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-sky-400">
                      {isBn ? metric.nameBn : metric.nameEn}
                    </span>
                    <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 shrink-0">
                      {metric.status} • SIMULATED
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-relaxed">
                    {isBn ? metric.definitionBn : metric.definitionEn}
                  </p>
                  <div className="p-2 rounded-lg bg-slate-950 font-mono text-[9px] text-amber-300 break-all">
                    {metric.formula}
                  </div>
                  <div className="grid grid-cols-1 gap-0.5 text-[9.5px] text-slate-300 pt-1">
                    <div>
                      <span className="text-slate-400">Target: </span>
                      <span className="font-bold text-emerald-300">{metric.targetThreshold}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Baseline: </span>
                      <span className="font-mono">{metric.measuredBaseline}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Ours: </span>
                      <span className="font-mono font-bold text-white">{metric.measuredOurs}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowHowWeMeasure(false)}
              className="w-full py-2.5 rounded-xl bg-[#0B4DA2] hover:bg-blue-600 text-white font-bold text-xs cursor-pointer"
            >
              {isBn ? 'ঠিক আছে' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

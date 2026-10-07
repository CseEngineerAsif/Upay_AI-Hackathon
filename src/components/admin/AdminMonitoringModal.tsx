import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency, toBanglaNumber } from '../../utils/formatters';
import { generateSeedData } from '../../../functions/seedData';
import { EVAL_REPORT } from '../../utils/impactModel';

interface BenchmarkCase {
  id: string;
  amount: number;
  isActualFraud: boolean;
  predictedRiskScore: number;
  predictedLevel: 'low' | 'medium' | 'high';
  region: 'Dhaka' | 'Chittagong' | 'Sylhet' | 'Rajshahi' | 'Khulna' | 'Barisal';
  ageGroup: '18-25' | '26-40' | '41-60' | '60+';
  userTenure: 'new' | 'established';
  latencyMs: number;
}

export const AdminMonitoringModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { language, setCurrentModal } = useAppStore();
  const [cases, setCases] = useState<BenchmarkCase[]>(() => generateSeedData().benchmarkCases || []);
  const [activeTab, setActiveTab] = useState<'metrics' | 'fairness'>('metrics');

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await fetch('/api/seed');
        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (data.benchmarkCases && Array.isArray(data.benchmarkCases)) {
            setCases(data.benchmarkCases);
          }
        }
      } catch (err) {
        console.warn('API benchmark fetch unavailable, using built-in seed cases');
      }
    };
    fetchCases();
  }, []);

  // Compute Metrics directly from reports/impact_eval.json & deterministic seed cases
  const precision = EVAL_REPORT.metrics.precision;
  const recall = EVAL_REPORT.metrics.recall;
  const fpr = EVAL_REPORT.metrics.fpr;
  const totalSaved = EVAL_REPORT.comparison.ours.totalLossPreventedBdt;
  const totalTp = EVAL_REPORT.metrics.confusionMatrix.tp;
  const totalLatency = cases.reduce((acc, c) => acc + c.latencyMs, 0);
  const avgLatency = cases.length > 0 ? Math.round(totalLatency / cases.length) : 0;

  // Regional stats from reports/impact_eval.json
  const regionStats = Object.entries(EVAL_REPORT.regions).map(([name, stat]) => ({
    name,
    recall: stat.recall,
    count: stat.totalTransactions
  }));

  // Fairness by Age Group (deterministic 120 seed cases)
  const ageGroups = ['18-25', '26-40', '41-60', '60+'];
  const ageStats = ageGroups.map((ag) => {
    const subset = cases.filter((c) => c.ageGroup === ag);
    const subTp = subset.filter((c) => c.isActualFraud && c.predictedRiskScore >= 60).length;
    const subActual = subset.filter((c) => c.isActualFraud).length;
    const recallRate = subActual > 0 ? Math.round((subTp / subActual) * 100) : 0;
    return { name: ag, recall: recallRate, count: subset.length };
  });

  // Fairness by Tenure (deterministic 120 seed cases)
  const newUsers = cases.filter((c) => c.userTenure === 'new');
  const oldUsers = cases.filter((c) => c.userTenure === 'established');
  const newRecall = Math.round(
    (newUsers.filter((c) => c.isActualFraud && c.predictedRiskScore >= 60).length /
      Math.max(newUsers.filter((c) => c.isActualFraud).length, 1)) *
      100
  );
  const oldRecall = Math.round(
    (oldUsers.filter((c) => c.isActualFraud && c.predictedRiskScore >= 60).length /
      Math.max(oldUsers.filter((c) => c.isActualFraud).length, 1)) *
      100
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2">
      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh] animate-scale-up">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📈</span>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold">
                  {language === 'bn' ? 'মডেল মনিটরিং ও ফেয়ারনেস' : 'Model Monitoring & Fairness'}
                </h2>
                <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  SIMULATED (synthetic data)
                </span>
              </div>
              <span className="text-[10px] text-teal-400">
                {language === 'bn'
                  ? 'reports/impact_eval.json (৬,০০০ স্যাম্পল) ও ১২০ কেস অডিট'
                  : 'Evaluated on reports/impact_eval.json (6,000 samples) & 120 cases'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:bg-slate-700"
          >
            ✕
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-all ${
              activeTab === 'metrics' ? 'border-[#0B4DA2] text-[#0B4DA2]' : 'border-transparent'
            }`}
          >
            {language === 'bn' ? 'পারফরম্যান্স মেট্রিক্স' : 'Impact Metrics'}
          </button>
          <button
            onClick={() => setActiveTab('fairness')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-all ${
              activeTab === 'fairness' ? 'border-[#0B4DA2] text-[#0B4DA2]' : 'border-transparent'
            }`}
          >
            {language === 'bn' ? 'মডেল ফেয়ারনেস ভিউ' : 'Model Fairness'}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
          {activeTab === 'metrics' && (
            <div className="space-y-4">
              {/* Estimated Money Saved Hero */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-700 text-white text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                    {language === 'bn' ? 'বেঞ্চমার্কে প্রতিরোধকৃত ফ্রড অর্থ' : 'Evaluated Fraud Loss Prevented'}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-black/25 text-amber-300">
                    SIMULATED
                  </span>
                </div>
                <p className="text-3xl font-black">
                  {formatCurrency(totalSaved, language)}
                </p>
                <span className="text-[11px] text-white/80 block">
                  {language === 'bn'
                    ? `${toBanglaNumber(totalTp)}টি ফ্রড শনাক্ত (reports/impact_eval.json)`
                    : `${totalTp} fraudulent attempts detected in 6,000-sample benchmark`}
                </span>
              </div>

              {/* 4 Core ML Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    প্রিসিশন (Precision)
                  </span>
                  <span className="text-xl font-black text-slate-900">
                    {toBanglaNumber(precision)}%
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    সঠিক ফ্রড শনাক্তের অনুপাত
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    রিকল (Recall / TPR)
                  </span>
                  <span className="text-xl font-black text-emerald-600">
                    {toBanglaNumber(recall)}%
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    মোট ফ্রড ধরার হার (@5% FPR: {toBanglaNumber(EVAL_REPORT.metrics.recallAt5Fpr)}%)
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    ফলস পজিটিভ রেট (FPR)
                  </span>
                  <span className="text-xl font-black text-amber-600">
                    {toBanglaNumber(fpr)}%
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    অযথা সতর্কতা সৃষ্টির হার
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    লেটেন্সি (Latency)
                  </span>
                  <span className="text-xl font-black text-[#0B4DA2]">
                    {toBanglaNumber(avgLatency)} ms
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    ১২০ বেঞ্চমার্ক গড় স্পীড
                  </span>
                </div>
              </div>

              <button
                onClick={() => setCurrentModal('impact_dashboard')}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>📊</span>
                <span>
                  {language === 'bn'
                    ? 'পূর্ণাঙ্গ বিজনেস ও কাস্টমার ইমপ্যাক্ট ড্যাশবোর্ড খুলুন ›'
                    : 'Open Full Business & Customer Impact Dashboard ›'}
                </span>
              </button>
            </div>
          )}

          {activeTab === 'fairness' && (
            <div className="space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                {language === 'bn'
                  ? 'মডেলটির ঝুঁকি নির্ধারণ বিভিন্ন অঞ্চল, বয়স ও ব্যবহারকারীর অভিজ্ঞতার ক্ষেত্রে পক্ষপাতহীন কি না তা যাচাই করার ব্যবস্থা (SIMULATED):'
                  : 'Fairness audit across demographics to ensure non-discriminatory safety checks (SIMULATED):'}
              </p>

              {/* By Region */}
              <div className="p-3 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block">
                  🌐 {language === 'bn' ? 'অঞ্চলভিত্তিক নির্ভুলতা (Region Parity - 6,000 txs):' : 'By Region (TPR - 6,000 txs):'}
                </span>
                <div className="space-y-1.5">
                  {regionStats.map((r) => (
                    <div key={r.name} className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-700">{r.name} ({r.count})</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                          <div className="h-full bg-[#0B4DA2]" style={{ width: `${r.recall}%` }} />
                        </div>
                        <span className="font-bold font-mono">{toBanglaNumber(r.recall)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* By Age Group */}
              <div className="p-3 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block">
                  👥 {language === 'bn' ? 'বয়স ভিত্তিক সমতা (Age Demographics - 120 cases):' : 'By Age Group (120 cases):'}
                </span>
                <div className="space-y-1.5">
                  {ageStats.map((ag) => (
                    <div key={ag.name} className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-700">{ag.name} বছর</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                          <div className="h-full bg-emerald-600" style={{ width: `${ag.recall}%` }} />
                        </div>
                        <span className="font-bold font-mono">{toBanglaNumber(ag.recall)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* New vs Old User Tenure */}
              <div className="p-3 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block">
                  ⏱️ {language === 'bn' ? 'নতুন বনাম পুরাতন ব্যবহারকারী সমতা:' : 'New vs Established Users:'}
                </span>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-[11px]">
                  <span>নতুন অ্যাকাউন্ট (New Users):</span>
                  <span className="font-bold text-[#0B4DA2]">{toBanglaNumber(newRecall)}% TPR</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-[11px]">
                  <span>পুরাতন অ্যাকাউন্ট (Established):</span>
                  <span className="font-bold text-[#0B4DA2]">{toBanglaNumber(oldRecall)}% TPR</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

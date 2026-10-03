import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  OperatorType,
  UserHabitsInput,
  BundleOptimizationResult,
  ActivePackTracker
} from '../../types/bundleOptimizer';
import {
  INITIAL_ACTIVE_TRACKER,
  getClientFallbackRecommendation,
  optimizeBundleWithAi
} from '../../utils/bundleOptimizerManager';

export const BundleOptimizerScreen: React.FC = () => {
  const { language, setCurrentModal } = useAppStore();

  // Habit Inputs
  const [operator, setOperator] = useState<OperatorType>('robi');
  const [monthlyDataGB, setMonthlyDataGB] = useState<number>(25);
  const [monthlyMinutes, setMonthlyMinutes] = useState<number>(350);
  const [monthlySms, setMonthlySms] = useState<number>(50);

  // AI Recommendation State
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [recommendation, setRecommendation] = useState<BundleOptimizationResult>(() =>
    getClientFallbackRecommendation({
      operator: 'robi',
      monthlyDataGB: 25,
      monthlyMinutes: 350,
      monthlySms: 50
    })
  );

  // Mid-Month Tracker State
  const [tracker, setTracker] = useState<ActivePackTracker>(INITIAL_ACTIVE_TRACKER);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleApplyPreset = (preset: { data: number; mins: number; sms: number }) => {
    setMonthlyDataGB(preset.data);
    setMonthlyMinutes(preset.mins);
    setMonthlySms(preset.sms);
  };

  const handleRunOptimization = async () => {
    setIsLoadingAi(true);
    try {
      const result = await optimizeBundleWithAi({
        operator,
        monthlyDataGB,
        monthlyMinutes,
        monthlySms
      });
      setRecommendation(result);
    } catch (err) {
      setRecommendation(
        getClientFallbackRecommendation({
          operator,
          monthlyDataGB,
          monthlyMinutes,
          monthlySms
        })
      );
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleActivateBooster = () => {
    // Add booster data and extend safety
    setTracker((prev) => ({
      ...prev,
      totalDataGB: prev.totalDataGB + prev.suggestedBooster.dataGB,
      remainingDataGB: prev.remainingDataGB + prev.suggestedBooster.dataGB,
      isAtRiskOfBurnout: false,
      burnoutEstimatedDays: 14
    }));
    setToastMsg('🎉 ৳৭৮ বুস্টার প্যাক সফলভাবে সক্রিয় হয়েছে! মেয়াদ শেষ হওয়া পর্যন্ত আপনার ব্যালেন্স সুরক্ষিত।');
    setTimeout(() => setToastMsg(null), 5000);
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-slate-50 overflow-y-auto no-scrollbar pb-24 select-none">
      {/* Header Banner (Min-height 96-110px, unclipped, normal flow) */}
      <div className="w-full min-h-[96px] sm:min-h-[104px] h-auto shrink-0 bg-gradient-to-r from-[#0B4DA2] via-[#093974] to-[#0B4DA2] text-white px-4 py-5 shadow-md relative">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl border border-white/20 shrink-0">
                📶
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <h1 className="text-[19px] font-black tracking-tight text-white leading-tight">
                    {language === 'bn' ? 'বান্ডেল অপ্টিমাইজার' : 'Bundle Optimizer'}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-[#FFD600] text-slate-950 text-[10px] font-black uppercase tracking-wide shrink-0">
                    AI Tariff
                  </span>
                </div>
                <p className="text-xs text-blue-100 font-medium leading-snug mt-1">
                  {language === 'bn'
                    ? 'আপনার ব্যবহারের ধরনে সবচেয়ে কম খরচের রিচার্জ প্যাক ও মেয়াদ সুরক্ষা'
                    : 'AI-Powered Lowest Cost Mobile Recharge & Mid-Month Protection'}
                </p>
              </div>
            </div>

            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30 shrink-0">
              সাশ্রয় গ্যারান্টি
            </span>
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="bg-emerald-600 text-white text-xs px-4 py-2.5 text-center font-bold animate-fade-in shadow-xs">
          {toastMsg}
        </div>
      )}

      {/* Main Content */}
      <div className="px-4 py-4 space-y-4 text-xs">
        {/* SECTION 1: MID-MONTH USAGE TRACKER & BURNOUT PROTECTION (Core Requirement) */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">🛡️</span>
              <div>
                <h3 className="font-black text-slate-900 text-xs">
                  {language === 'bn' ? 'মাসিক মেয়াদ সুরক্ষা ও ব্যবহার ট্র্যাকার' : 'Mid-Month Usage & Burnout Protection'}
                </h3>
                <span className="text-[10px] text-slate-500">
                  বর্তমান প্যাক: <strong>{tracker.packNameBn}</strong> (মেয়াদ বাকি: {tracker.daysLeft} দিন)
                </span>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200">
              {tracker.operatorNameBn}
            </span>
          </div>

          {/* Data & Voice Progress Bars */}
          <div className="space-y-2.5 pt-1">
            {/* Data Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-600 font-medium">ইন্টারনেট ডেটা অবশিষ্ট:</span>
                <span className="font-mono font-bold text-slate-900">
                  {tracker.remainingDataGB.toFixed(1)} GB / {tracker.totalDataGB} GB
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    tracker.isAtRiskOfBurnout ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                  style={{
                    width: `${Math.min(100, (tracker.usedDataGB / tracker.totalDataGB) * 100)}%`
                  }}
                />
              </div>
            </div>

            {/* Minutes Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-600 font-medium">টকটাইম মিনিট অবশিষ্ট:</span>
                <span className="font-mono font-bold text-slate-900">
                  {tracker.remainingMinutes} মিনিট / {tracker.totalMinutes} মিনিট
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all"
                  style={{
                    width: `${Math.min(100, (tracker.usedMinutes / tracker.totalMinutes) * 100)}%`
                  }}
                />
              </div>
            </div>
          </div>

          {/* OUT-OF-BUNDLE BURNOUT WARNING (Core Requirement) */}
          {tracker.isAtRiskOfBurnout ? (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 space-y-2">
              <div className="flex items-center gap-1.5 font-black text-xs text-rose-700">
                <span>⚠️</span>
                <span>সতর্কবার্তা: ডেটা প্যাক দ্রুত শেষ হওয়ার ঝুঁকি!</span>
              </div>
              <p className="text-[11px] leading-relaxed text-rose-900">
                আপনার বর্তমান ব্যবহারের গতিতে আগামী <strong>{tracker.burnoutEstimatedDays} দিনের মধ্যে</strong> ডেটা শেষ হয়ে যেতে পারে, অথচ মূল প্যাকের মেয়াদ বাকি রয়েছে <strong>{tracker.daysLeft} দিন</strong>। প্যাক শেষ হয়ে গেলে পে-অ্যাজ-ইউ-গো (Pay-As-You-Go) রেটে অ্যাকাউন্ট ব্যালেন্স থেকে বাড়তি চার্জ কেটে নেওয়া হতে পারে।
              </p>

              {/* SUGGESTED BOOSTER (Core Requirement) */}
              <div className="p-2.5 rounded-xl bg-white border border-rose-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 text-xs block">
                    {tracker.suggestedBooster.nameBn}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    বাড়তি চার্জ এড়াতে সাশ্রয়ী মিনি বুস্টার
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleActivateBooster}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>৳{tracker.suggestedBooster.price} রিচার্জ</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2">
              <span className="text-base">✅</span>
              <span className="text-[11px] font-medium">
                আপনার ডেটা ও টকটাইম নিরাপদ মাত্রায় রয়েছে। মেয়াদ শেষ হওয়া পর্যন্ত অতিরিক্ত চার্জ কাটার কোনো ঝুঁকি নেই।
              </span>
            </div>
          )}
        </div>

        {/* SECTION 2: USAGE HABIT INPUT (Data, Minutes, SMS, Operator) */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">⚙️</span>
              <div>
                <h3 className="font-black text-slate-900 text-xs">
                  {language === 'bn' ? 'আপনার মাসিক ব্যবহারের অভ্যাস' : 'Monthly Usage Habits'}
                </h3>
                <p className="text-[10px] text-slate-500">
                  প্রয়োজনীয় ডেটা ও মিনিট নির্ধারণ করুন
                </p>
              </div>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 block">কুইক প্রিসেট:</span>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: '🎓 স্টুডেন্ট', data: 15, mins: 200, sms: 30 },
                { label: '💼 প্রফেশনাল', data: 25, mins: 350, sms: 50 },
                { label: '🚀 হেভি ইউজার', data: 45, mins: 600, sms: 100 }
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold transition-colors cursor-pointer text-center"
                >
                  {p.label} ({p.data}GB)
                </button>
              ))}
            </div>
          </div>

          {/* Operator Selector */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 block">মোবাইল অপারেটর:</span>
            <div className="grid grid-cols-5 gap-1">
              {[
                { id: 'gp', name: 'GP' },
                { id: 'robi', name: 'Robi' },
                { id: 'banglalink', name: 'BL' },
                { id: 'airtel', name: 'Airtel' },
                { id: 'teletalk', name: 'Teletalk' }
              ].map((op) => (
                <button
                  key={op.id}
                  type="button"
                  onClick={() => setOperator(op.id as OperatorType)}
                  className={`py-1.5 rounded-xl font-bold text-[10px] border transition-all cursor-pointer ${
                    operator === op.id
                      ? 'bg-[#0B4DA2] text-white border-[#0B4DA2] shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {op.name}
                </button>
              ))}
            </div>
          </div>

          {/* Habit Sliders */}
          <div className="space-y-3 pt-1">
            {/* Data Slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-600 font-bold">মাসিক ডেটা প্রয়োজন:</span>
                <span className="font-mono font-black text-[#0B4DA2] text-xs">
                  {monthlyDataGB} GB
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={monthlyDataGB}
                onChange={(e) => setMonthlyDataGB(Number(e.target.value))}
                className="w-full accent-[#0B4DA2] cursor-pointer"
              />
            </div>

            {/* Minutes Slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-600 font-bold">মাসিক টকটাইম প্রয়োজন:</span>
                <span className="font-mono font-black text-[#0B4DA2] text-xs">
                  {monthlyMinutes} মিনিট
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="800"
                step="50"
                value={monthlyMinutes}
                onChange={(e) => setMonthlyMinutes(Number(e.target.value))}
                className="w-full accent-[#0B4DA2] cursor-pointer"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleRunOptimization}
            disabled={isLoadingAi}
            className="w-full py-2.5 rounded-2xl bg-[#0B4DA2] hover:bg-blue-800 text-white font-black text-xs shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            {isLoadingAi ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>এআই বিশ্লেষণ চলছে...</span>
              </>
            ) : (
              <>
                <span>✨</span>
                <span>এআই দিয়ে সেরা সাশ্রয়ী বান্ডেল খুঁজুন (Analyze with AI)</span>
              </>
            )}
          </button>
        </div>

        {/* SECTION 3: AI RECOMMENDED PACK & BANGLA EXPLANATION (Core Requirement) */}
        {recommendation && (
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="font-black text-slate-900 text-xs uppercase tracking-wide">
                  {language === 'bn' ? 'এআই নির্বাচিত সেরা সাশ্রয়ী বান্ডেল' : 'AI Lowest-Cost Recommendation'}
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800">
                আনুমানিক ৳{recommendation.monthlySavingsEstimate} সাশ্রয়/মাস
              </span>
            </div>

            {/* Recommended Pack Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-[#0B4DA2] text-white">
                    {recommendation.recommendedPack.operatorNameBn}
                  </span>
                  <h4 className="font-black text-slate-900 text-sm mt-1">
                    {recommendation.recommendedPack.nameBn}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-600 mt-0.5">
                    <span>📶 {recommendation.recommendedPack.dataGB} GB ইন্টারনেট</span>
                    <span>•</span>
                    <span>📞 {recommendation.recommendedPack.voiceMinutes} মিনিট</span>
                    <span>•</span>
                    <span>📅 {recommendation.recommendedPack.validityDays} দিন</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-black text-base text-[#0B4DA2] block">
                    ৳{recommendation.recommendedPack.price}
                  </span>
                  <span className="text-[9px] text-emerald-700 font-bold">এককালীন রিচার্জ</span>
                </div>
              </div>

              {/* BANGLA EXPLANATION (Core Requirement) */}
              <div className="p-2.5 rounded-xl bg-white/90 border border-blue-100 text-[11px] leading-relaxed text-slate-700">
                💡 <strong>কেন এটি সবচেয়ে সাশ্রয়ী:</strong> {recommendation.banglaExplanation}
              </div>

              {/* One-Tap Recharge Button */}
              <button
                type="button"
                onClick={() => setCurrentModal('mobile_recharge')}
                className="w-full py-2.5 rounded-xl bg-[#FFD600] hover:bg-yellow-400 text-slate-950 font-black text-xs shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>⚡</span>
                <span>এখনই এই বান্ডেল রিচার্জ করুন (৳{recommendation.recommendedPack.price})</span>
              </button>
            </div>

            {/* Alternative Packs */}
            {recommendation.alternativePacks && recommendation.alternativePacks.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  বিকল্প সাশ্রয়ী প্যাক:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {recommendation.alternativePacks.map((alt) => (
                    <div
                      key={alt.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1"
                    >
                      <span className="font-bold text-slate-900 text-xs block truncate">
                        {alt.nameBn}
                      </span>
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>{alt.dataGB}GB + {alt.voiceMinutes}মিনিট</span>
                        <span className="font-bold font-mono text-[#0B4DA2]">৳{alt.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
